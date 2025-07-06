const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', '..', process.env.UPLOADS_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create a new directory with UUID for each upload session
    const sessionId = uuidv4();
    const sessionDir = path.join(uploadsDir, sessionId);
    fs.mkdirSync(sessionDir, { recursive: true });

    // Store the session directory path in the request for later use
    req.sessionDir = sessionDir;
    req.sessionId = sessionId;

    cb(null, sessionDir);
  },
  filename: function (req, file, cb) {
    // Keep the original filename
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Stats endpoints
router.get('/stats/kpi', async (req, res) => {
  try {
    // Get counts from database
    const studiesCount = await db.query('SELECT COUNT(*) FROM studies');
    const samplesCount = await db.query('SELECT COUNT(*) FROM samples');
    const runsCount = await db.query('SELECT COUNT(*) FROM runs');
    const assembliesCount = await db.query('SELECT COUNT(*) FROM assemblies');
    const bgcsCount = await db.query('SELECT COUNT(*) FROM bgcs');
    const gcfsCount = await db.query('SELECT COUNT(*) FROM gcfs');

    const kpiData = [
      { title: "Total Studies", value: studiesCount.rows[0].count },
      { title: "Total Samples", value: samplesCount.rows[0].count },
      { title: "Total Runs", value: runsCount.rows[0].count },
      { title: "Total Assemblies", value: assembliesCount.rows[0].count },
      { title: "Total BGCs", value: bgcsCount.rows[0].count },
      { title: "Total GCFs", value: gcfsCount.rows[0].count },
    ];

    res.json(kpiData);
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats/bgc-classes', async (req, res) => {
  try {
    // Get BGC class counts from the database
    // This query uses unnest to expand the product_class array and count occurrences of each class
    const result = await db.query(`
      SELECT unnest(product_class) as name, COUNT(*) as count
      FROM bgcs
      GROUP BY name
      ORDER BY count DESC
    `);

    const barChartData = result.rows;

    res.json(barChartData);
  } catch (error) {
    console.error('Error fetching BGC classes data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats/growth', async (req, res) => {
  try {
    // Get study counts by year
    const result = await db.query(`
      SELECT EXTRACT(YEAR FROM public_release_date) as year, COUNT(*) as count
      FROM studies
      GROUP BY EXTRACT(YEAR FROM public_release_date)
      ORDER BY year
    `);

    const lineChartData = result.rows.map(row => ({
      year: row.year.toString(),
      count: parseInt(row.count)
    }));

    res.json(lineChartData);
  } catch (error) {
    console.error('Error fetching growth data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Browse endpoints
router.get('/browse/studies', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const sortColumn = req.query.sortColumn || 'public_release_date';
    const sortDirection = req.query.sortDirection || 'desc';
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['accession', 'study_name', 'bioproject', 'public_release_date', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'public_release_date';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'desc';

    // Build WHERE clause based on filters
    let whereClause = '';
    const queryParams = [limit, offset];
    let paramIndex = 3; // Start from $3 since $1 and $2 are used for LIMIT and OFFSET

    if (Object.keys(filters).length > 0) {
      whereClause = 'WHERE ';
      const conditions = [];

      if (filters.accession) {
        conditions.push(`s.accession ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.accession}%`);
        paramIndex++;
      }

      if (filters.study_name) {
        conditions.push(`s.study_name ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.study_name}%`);
        paramIndex++;
      }

      if (filters.bioproject) {
        conditions.push(`s.bioproject ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.bioproject}%`);
        paramIndex++;
      }

      if (filters.public_release_date) {
        conditions.push(`s.public_release_date::text LIKE $${paramIndex}`);
        queryParams.push(`${filters.public_release_date}%`);
        paramIndex++;
      }

      // BGC count filtering would require a HAVING clause on a subquery, which is more complex
      // For now, we'll skip it for simplicity

      whereClause += conditions.join(' AND ');

      // If no conditions were added, remove the WHERE clause
      if (conditions.length === 0) {
        whereClause = '';
      }
    }

    // Get studies with pagination and BGC count
    const studiesResult = await db.query(`
      SELECT s.*, 
        (SELECT COUNT(*) 
         FROM bgcs bgc
         JOIN assemblies a ON bgc.assembly = a.id
         JOIN run_assemblies ra ON a.id = ra.assembly_id
         JOIN runs r ON ra.run_id = r.id
         JOIN sample_runs sr ON r.id = sr.run_id
         JOIN samples samp ON sr.sample_id = samp.id
         JOIN study_samples ss ON samp.id = ss.sample_id
         WHERE ss.study_id = s.id) AS bgc_count
      FROM studies s
      ${whereClause}
      ORDER BY ${column === 'bgc_count' ? 'bgc_count' : 's.' + column} ${direction}
      LIMIT $1 OFFSET $2
    `, queryParams);

    // Get total count with filters
    let countQuery = 'SELECT COUNT(*) FROM studies s';
    if (whereClause) {
      countQuery += ' ' + whereClause;
    }
    const countResult = await db.query(countQuery, queryParams.slice(2)); // Remove limit and offset
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: studiesResult.rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching studies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/browse/samples', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const sortColumn = req.query.sortColumn || 'collection_date';
    const sortDirection = req.query.sortDirection || 'desc';
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['accession', 'sample_name', 'environment_biome', 'collection_date', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'collection_date';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'desc';

    // Build WHERE clause based on filters
    let whereClause = '';
    const queryParams = [limit, offset];
    let paramIndex = 3; // Start from $3 since $1 and $2 are used for LIMIT and OFFSET

    if (Object.keys(filters).length > 0) {
      whereClause = 'WHERE ';
      const conditions = [];

      if (filters.accession) {
        conditions.push(`s.accession ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.accession}%`);
        paramIndex++;
      }

      if (filters.sample_name) {
        conditions.push(`s.sample_name ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.sample_name}%`);
        paramIndex++;
      }

      if (filters.environment_biome) {
        conditions.push(`s.environment_biome ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.environment_biome}%`);
        paramIndex++;
      }

      if (filters.collection_date) {
        conditions.push(`s.collection_date::text LIKE $${paramIndex}`);
        queryParams.push(`${filters.collection_date}%`);
        paramIndex++;
      }

      // BGC count filtering would require a HAVING clause on a subquery, which is more complex
      // For now, we'll skip it for simplicity

      whereClause += conditions.join(' AND ');

      // If no conditions were added, remove the WHERE clause
      if (conditions.length === 0) {
        whereClause = '';
      }
    }

    // Get samples with pagination and BGC count
    const samplesResult = await db.query(`
      SELECT s.*, 
        (SELECT COUNT(*) 
         FROM bgcs bgc
         JOIN assemblies a ON bgc.assembly = a.id
         JOIN run_assemblies ra ON a.id = ra.assembly_id
         JOIN runs r ON ra.run_id = r.id
         JOIN sample_runs sr ON r.id = sr.run_id
         WHERE sr.sample_id = s.id) AS bgc_count
      FROM samples s
      ${whereClause}
      ORDER BY ${column === 'bgc_count' ? 'bgc_count' : 's.' + column} ${direction}
      LIMIT $1 OFFSET $2
    `, queryParams);

    // Get total count with filters
    let countQuery = 'SELECT COUNT(*) FROM samples s';
    if (whereClause) {
      countQuery += ' ' + whereClause;
    }
    const countResult = await db.query(countQuery, queryParams.slice(2)); // Remove limit and offset
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: samplesResult.rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching samples:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/browse/runs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const sortColumn = req.query.sortColumn || 'accession';
    const sortDirection = req.query.sortDirection || 'asc';
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['accession', 'sample_name', 'experiment_type', 'instrument_platform', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'accession';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

    // Build WHERE clause based on filters
    let whereClause = '';
    const queryParams = [limit, offset];
    let paramIndex = 3; // Start from $3 since $1 and $2 are used for LIMIT and OFFSET

    if (Object.keys(filters).length > 0) {
      whereClause = 'WHERE ';
      const conditions = [];

      if (filters.accession) {
        conditions.push(`r.accession ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.accession}%`);
        paramIndex++;
      }

      if (filters.sample_name) {
        conditions.push(`s.sample_name ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.sample_name}%`);
        paramIndex++;
      }

      if (filters.experiment_type) {
        conditions.push(`r.experiment_type ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.experiment_type}%`);
        paramIndex++;
      }

      if (filters.instrument_platform) {
        conditions.push(`r.instrument_platform ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.instrument_platform}%`);
        paramIndex++;
      }

      // BGC count filtering would require a HAVING clause on a subquery, which is more complex
      // For now, we'll skip it for simplicity

      whereClause += conditions.join(' AND ');

      // If no conditions were added, remove the WHERE clause
      if (conditions.length === 0) {
        whereClause = '';
      }
    }

    // Get runs with pagination and BGC count
    const runsResult = await db.query(`
      SELECT r.*, s.sample_name,
        (SELECT COUNT(*) 
         FROM bgcs bgc
         JOIN assemblies a ON bgc.assembly = a.id
         JOIN run_assemblies ra ON a.id = ra.assembly_id
         WHERE ra.run_id = r.id) AS bgc_count
      FROM runs r
      JOIN samples s ON r.sample_id = s.id
      ${whereClause}
      ORDER BY ${column === 'sample_name' ? 's.sample_name' : column === 'bgc_count' ? 'bgc_count' : 'r.' + column} ${direction}
      LIMIT $1 OFFSET $2
    `, queryParams);

    // Get total count with filters
    let countQuery = 'SELECT COUNT(*) FROM runs r JOIN samples s ON r.sample_id = s.id';
    if (whereClause) {
      countQuery += ' ' + whereClause;
    }
    const countResult = await db.query(countQuery, queryParams.slice(2)); // Remove limit and offset
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: runsResult.rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching runs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/browse/biomes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const sortColumn = req.query.sortColumn || 'id';
    const sortDirection = req.query.sortDirection || 'asc';
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['id', 'lineage', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'id';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

    // Build WHERE clause based on filters
    let whereClause = '';
    const queryParams = [limit, offset];
    let paramIndex = 3; // Start from $3 since $1 and $2 are used for LIMIT and OFFSET

    if (Object.keys(filters).length > 0) {
      whereClause = 'WHERE ';
      const conditions = [];

      if (filters.id) {
        conditions.push(`b.id = $${paramIndex}`);
        queryParams.push(parseInt(filters.id));
        paramIndex++;
      }

      if (filters.lineage) {
        conditions.push(`b.lineage ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.lineage}%`);
        paramIndex++;
      }

      // BGC count filtering would require a HAVING clause on a subquery, which is more complex
      // For now, we'll skip it for simplicity

      whereClause += conditions.join(' AND ');

      // If no conditions were added, remove the WHERE clause
      if (conditions.length === 0) {
        whereClause = '';
      }
    }

    // Get biomes with pagination and BGC count
    const biomesResult = await db.query(`
      SELECT b.*,
        (SELECT COUNT(*) 
         FROM bgcs bgc
         JOIN assemblies a ON bgc.assembly = a.id
         JOIN run_assemblies ra ON a.id = ra.assembly_id
         JOIN runs r ON ra.run_id = r.id
         JOIN sample_runs sr ON r.id = sr.run_id
         JOIN samples s ON sr.sample_id = s.id
         JOIN sample_biomes sb ON s.id = sb.sample_id
         WHERE sb.biome_id = b.id) AS bgc_count
      FROM biomes b
      ${whereClause}
      ORDER BY ${column === 'bgc_count' ? 'bgc_count' : 'b.' + column} ${direction}
      LIMIT $1 OFFSET $2
    `, queryParams);

    // Get total count with filters
    let countQuery = 'SELECT COUNT(*) FROM biomes b';
    if (whereClause) {
      countQuery += ' ' + whereClause;
    }
    const countResult = await db.query(countQuery, queryParams.slice(2)); // Remove limit and offset
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: biomesResult.rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching biomes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/browse/bgcs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const sortColumn = req.query.sortColumn || 'id';
    const sortDirection = req.query.sortDirection || 'asc';
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['id', 'product_class', 'assembly_accession', 'contig'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'id';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

    // Build WHERE clause based on filters
    let whereClause = '';
    const queryParams = [limit, offset];
    let paramIndex = 3; // Start from $3 since $1 and $2 are used for LIMIT and OFFSET

    if (Object.keys(filters).length > 0) {
      whereClause = 'WHERE ';
      const conditions = [];

      if (filters.id) {
        conditions.push(`b.id ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.id}%`);
        paramIndex++;
      }

      if (filters.product_class) {
        conditions.push(`array_to_string(b.product_class, ',') ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.product_class}%`);
        paramIndex++;
      }

      if (filters.assembly_accession) {
        conditions.push(`a.accession ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.assembly_accession}%`);
        paramIndex++;
      }

      if (filters.contig) {
        conditions.push(`b.contig ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.contig}%`);
        paramIndex++;
      }

      whereClause += conditions.join(' AND ');
    }

    // Get BGCs with pagination, joining with assemblies to get assembly info
    const bgcsResult = await db.query(`
      SELECT b.*, a.accession as assembly_accession 
      FROM bgcs b
      JOIN assemblies a ON b.assembly = a.id
      ${whereClause}
      ORDER BY ${column === 'assembly_accession' ? 'a.accession' : 'b.' + column} ${direction}
      LIMIT $1 OFFSET $2
    `, queryParams);

    // Get total count with filters
    let countQuery = 'SELECT COUNT(*) FROM bgcs b JOIN assemblies a ON b.assembly = a.id';
    if (whereClause) {
      countQuery += ' ' + whereClause;
    }
    const countResult = await db.query(countQuery, queryParams.slice(2)); // Remove limit and offset
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: bgcsResult.rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching BGCs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/browse/gcfs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const sortColumn = req.query.sortColumn || 'id';
    const sortDirection = req.query.sortDirection || 'asc';
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['id', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'id';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

    // Build WHERE and HAVING clauses based on filters
    let whereClause = '';
    let havingClause = '';
    const queryParams = [limit, offset];
    let paramIndex = 3; // Start from $3 since $1 and $2 are used for LIMIT and OFFSET

    if (Object.keys(filters).length > 0) {
      const conditions = [];

      if (filters.id) {
        conditions.push(`g.id = $${paramIndex}`);
        queryParams.push(parseInt(filters.id));
        paramIndex++;
      }

      if (filters.bgc_count) {
        havingClause = ` HAVING COUNT(b.id) = $${paramIndex}`;
        queryParams.push(parseInt(filters.bgc_count));
        paramIndex++;
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }
    }

    // Get GCFs with pagination, including a count of BGCs in each GCF
    const gcfsResult = await db.query(`
      SELECT g.id, COUNT(b.id) as bgc_count
      FROM gcfs g
      LEFT JOIN bgcs b ON g.id = b.gcf_id
      ${whereClause}
      GROUP BY g.id
      ${havingClause}
      ORDER BY ${column === 'id' ? 'g.id' : column} ${direction}
      LIMIT $1 OFFSET $2
    `, queryParams);

    // Get total count with filters
    // For accurate count with HAVING clause, we need a subquery
    let countQuery = `
      SELECT COUNT(*) FROM (
        SELECT g.id
        FROM gcfs g
        LEFT JOIN bgcs b ON g.id = b.gcf_id
        ${whereClause}
        GROUP BY g.id
        ${havingClause}
      ) as filtered_gcfs
    `;

    const countResult = await db.query(countQuery, queryParams.slice(2)); // Remove limit and offset
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: gcfsResult.rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching GCFs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/browse/assemblies', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const sortColumn = req.query.sortColumn || 'id';
    const sortDirection = req.query.sortDirection || 'asc';
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['id', 'accession', 'wgs_accession', 'coverage', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'id';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

    // Build WHERE and HAVING clauses based on filters
    let whereClause = '';
    let havingClause = '';
    const queryParams = [limit, offset];
    let paramIndex = 3; // Start from $3 since $1 and $2 are used for LIMIT and OFFSET

    if (Object.keys(filters).length > 0) {
      whereClause = 'WHERE ';
      const conditions = [];

      if (filters.id) {
        conditions.push(`a.id ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.id}%`);
        paramIndex++;
      }

      if (filters.accession) {
        conditions.push(`a.accession ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.accession}%`);
        paramIndex++;
      }

      if (filters.wgs_accession) {
        conditions.push(`a.wgs_accession ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.wgs_accession}%`);
        paramIndex++;
      }

      if (filters.coverage) {
        conditions.push(`a.coverage = $${paramIndex}`);
        queryParams.push(parseFloat(filters.coverage));
        paramIndex++;
      }

      if (filters.bgc_count) {
        havingClause = ` HAVING COUNT(b.id) = $${paramIndex}`;
        queryParams.push(parseInt(filters.bgc_count));
        paramIndex++;
      }

      whereClause += conditions.join(' AND ');

      // If no conditions were added, remove the WHERE clause
      if (conditions.length === 0) {
        whereClause = '';
      }
    }

    // Get assemblies with pagination, including a count of BGCs in each assembly
    const assembliesResult = await db.query(`
      SELECT a.id, a.accession, a.wgs_accession, a.coverage, COUNT(b.id) as bgc_count
      FROM assemblies a
      LEFT JOIN bgcs b ON a.id = b.assembly
      ${whereClause}
      GROUP BY a.id, a.accession, a.wgs_accession, a.coverage
      ${havingClause}
      ORDER BY ${column === 'bgc_count' ? 'bgc_count' : 'a.' + column} ${direction}
      LIMIT $1 OFFSET $2
    `, queryParams);

    // Get total count with filters
    // For accurate count with HAVING clause, we need a subquery
    let countQuery = `
      SELECT COUNT(*) FROM (
        SELECT a.id
        FROM assemblies a
        LEFT JOIN bgcs b ON a.id = b.assembly
        ${whereClause}
        GROUP BY a.id
        ${havingClause}
      ) as filtered_assemblies
    `;

    const countResult = await db.query(countQuery, queryParams.slice(2)); // Remove limit and offset
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: assembliesResult.rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching assemblies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/browse/analyses', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const sortColumn = req.query.sortColumn || 'id';
    const sortDirection = req.query.sortDirection || 'asc';
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['id', 'accession', 'experiment_type', 'pipeline_version', 'analysis_status', 'submit_time', 'complete_time', 'instrument_platform', 'instrument_model'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'id';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

    // Build WHERE clause based on filters
    let whereClause = '';
    const queryParams = [limit, offset];
    let paramIndex = 3; // Start from $3 since $1 and $2 are used for LIMIT and OFFSET

    if (Object.keys(filters).length > 0) {
      whereClause = 'WHERE ';
      const conditions = [];

      if (filters.id) {
        conditions.push(`a.id ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.id}%`);
        paramIndex++;
      }

      if (filters.accession) {
        conditions.push(`a.accession ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.accession}%`);
        paramIndex++;
      }

      if (filters.experiment_type) {
        conditions.push(`a.experiment_type ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.experiment_type}%`);
        paramIndex++;
      }

      if (filters.pipeline_version) {
        conditions.push(`a.pipeline_version ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.pipeline_version}%`);
        paramIndex++;
      }

      if (filters.analysis_status) {
        conditions.push(`a.analysis_status ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.analysis_status}%`);
        paramIndex++;
      }

      if (filters.instrument_platform) {
        conditions.push(`a.instrument_platform ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.instrument_platform}%`);
        paramIndex++;
      }

      if (filters.instrument_model) {
        conditions.push(`a.instrument_model ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.instrument_model}%`);
        paramIndex++;
      }

      whereClause += conditions.join(' AND ');

      // If no conditions were added, remove the WHERE clause
      if (conditions.length === 0) {
        whereClause = '';
      }
    }

    // Get analyses with pagination
    const analysesResult = await db.query(`
      SELECT a.*
      FROM analyses a
      ${whereClause}
      ORDER BY a.${column} ${direction}
      LIMIT $1 OFFSET $2
    `, queryParams);

    // Get total count with filters
    let countQuery = 'SELECT COUNT(*) FROM analyses a';
    if (whereClause) {
      countQuery += ' ' + whereClause;
    }
    const countResult = await db.query(countQuery, queryParams.slice(2)); // Remove limit and offset
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: analysesResult.rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import the queue
const { searchQueue } = require('../queue');

// Sequence Search endpoint
router.post('/search/sequence', upload.array('files'), async (req, res) => {
  try {
    // Files are uploaded to req.sessionDir with UUID req.sessionId
    const jobData = {
      type: 'sequence', // Add type field to identify the job type
      sessionId: req.sessionId,
      uploadPath: req.sessionDir,
      files: req.files.map(file => ({
        filename: file.filename,
        path: file.path
      }))
    };

    // Generate a UUID for the job ID
    const jobId = uuidv4();

    // Add job to the search queue with custom job ID
    const job = await searchQueue.add(jobData, {
      jobId: jobId,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });

    // Return the job ID and session ID to the client
    res.json({
      success: true,
      message: 'Files uploaded and search job queued successfully',
      sessionId: req.sessionId,
      jobId: job.id,
      uploadPath: req.sessionDir,
      files: req.files.map(file => ({
        filename: file.filename,
        path: file.path
      }))
    });
  } catch (error) {
    console.error('Error uploading sequence files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// BGC Search endpoint
router.post('/search/bgc', upload.array('files'), async (req, res) => {
  try {
    // Files are uploaded to req.sessionDir with UUID req.sessionId
    const jobData = {
      type: 'bgc', // Add type field to identify the job type
      sessionId: req.sessionId,
      uploadPath: req.sessionDir,
      files: req.files.map(file => ({
        filename: file.filename,
        path: file.path
      }))
    };

    // Generate a UUID for the job ID
    const jobId = uuidv4();

    // Add job to the search queue with custom job ID
    const job = await searchQueue.add(jobData, {
      jobId: jobId,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });

    // Return the job ID and session ID to the client
    res.json({
      success: true,
      message: 'Files uploaded and search job queued successfully',
      sessionId: req.sessionId,
      jobId: job.id,
      uploadPath: req.sessionDir,
      files: req.files.map(file => ({
        filename: file.filename,
        path: file.path
      }))
    });
  } catch (error) {
    console.error('Error uploading BGC files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get job status endpoint
router.get('/search/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get job from the single queue
    const job = await searchQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get the job type from the job data
    const type = job.data.type;

    // Get job state and progress
    const state = await job.getState();
    const progress = job._progress;

    // Get job result if completed
    let result = null;
    if (state === 'completed') {
      result = await job.finished();
    }

    // Get all jobs from the queue
    const waitingJobs = await searchQueue.getWaitingCount();
    const activeJobs = await searchQueue.getActiveCount();
    const totalJobs = waitingJobs + activeJobs;

    // Get queue position of the job
    let queuePosition = 0;
    if (state === 'waiting') {
      // Get all waiting jobs
      const waitingJobsData = await searchQueue.getJobs(['waiting']);
      // Find the position of the current job in the waiting queue
      queuePosition = waitingJobsData.findIndex(waitingJob => waitingJob.id === jobId) + 1;
    }

    res.json({
      jobId,
      type,
      state,
      progress,
      result,
      queueStats: {
        totalJobs,
        activeJobs,
        waitingJobs,
        queuePosition
      }
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get queue statistics endpoint
router.get('/search/queue-stats', async (req, res) => {
  try {
    const { type } = req.query;

    // Validate the search type if provided
    if (type && type !== 'sequence' && type !== 'bgc') {
      return res.status(400).json({ error: 'Invalid search type. Must be "sequence" or "bgc".' });
    }

    // Get all jobs from the queue
    const allJobs = await searchQueue.getJobs(['waiting', 'active']);

    // Filter jobs by type if requested
    const filteredJobs = type 
      ? allJobs.filter(job => job.data.type === type)
      : allJobs;

    // Count active and waiting jobs
    const activeJobs = filteredJobs.filter(job => job._state === 'active').length;
    const waitingJobs = filteredJobs.filter(job => job._state === 'waiting').length;
    const totalJobs = activeJobs + waitingJobs;

    res.json({
      queueStats: {
        totalJobs,
        activeJobs,
        waitingJobs
      }
    });
  } catch (error) {
    console.error('Error getting queue statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all jobs for a session
router.get('/search/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { type } = req.query;

    // Validate the search type if provided
    if (type && type !== 'sequence' && type !== 'bgc') {
      return res.status(400).json({ error: 'Invalid search type. Must be "sequence" or "bgc".' });
    }

    // Get all jobs from the single queue
    const jobs = await searchQueue.getJobs(['waiting', 'active', 'completed', 'failed']);

    // Filter jobs by sessionId and type if provided
    const sessionJobs = jobs.filter(job => {
      const matchesSession = job.data.sessionId === sessionId;
      const matchesType = type ? job.data.type === type : true;
      return matchesSession && matchesType;
    });

    // Get state and progress for each job
    const jobsWithStatus = await Promise.all(sessionJobs.map(async (job) => {
      const state = await job.getState();
      const progress = job._progress;

      // Get job result if completed
      let result = null;
      if (state === 'completed') {
        result = await job.finished();
      }

      return {
        jobId: job.id,
        type: job.data.type,
        state,
        progress,
        result
      };
    }));

    res.json({
      sessionId,
      jobs: jobsWithStatus
    });
  } catch (error) {
    console.error('Error getting session jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
