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

// Get upload limits from environment variables
const maxFiles = parseInt(process.env.MAX_UPLOAD_FILES || '50');
const maxSizeMB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '250');
const maxSizeBytes = maxSizeMB * 1024 * 1024;

// Configure multer with limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: maxSizeBytes,
    files: maxFiles
  }
});

// Stats endpoints
router.get('/stats/kpi', async (req, res) => {
  try {
    // Get counts from database
    const studiesCount = await db.query('SELECT COUNT(*) FROM studies');
    const samplesCount = await db.query('SELECT COUNT(*) FROM samples');
    const runsCount = await db.query('SELECT COUNT(*) FROM runs');
    const assembliesCount = await db.query('SELECT COUNT(*) FROM assemblies');
    
    // Get datasets analyzed (analyses)
    const datasetsAnalyzedCount = await db.query('SELECT COUNT(*) FROM analyses');
    
    // Get complete analyses (those with complete_time set or analysis_status indicating completion)
    const completeAnalysesCount = await db.query(`
      SELECT COUNT(*) FROM analyses 
      WHERE complete_time IS NOT NULL OR analysis_status = 'completed'
    `);
    
    // Get BGCs identified
    const bgcsCount = await db.query('SELECT COUNT(*) FROM bgcs');
    
    // Get complete BGCs (those linked to complete analyses)
    const completeBgcsCount = await db.query(`
      SELECT COUNT(DISTINCT b.id) FROM bgcs b
      JOIN assemblies a ON b.assembly = a.id
      JOIN assembly_analyses aa ON a.id = aa.assembly_id
      JOIN analyses an ON aa.analysis_id = an.id
      WHERE an.complete_time IS NOT NULL OR an.analysis_status = 'completed'
    `);
    
    // Get GCFs identified
    const gcfsCount = await db.query('SELECT COUNT(*) FROM gcfs');
    
    // Get complete GCFs (those containing at least one complete BGC)
    const completeGcfsCount = await db.query(`
      SELECT COUNT(DISTINCT g.id) FROM gcfs g
      JOIN bgcs b ON g.id = b.gcf_id
      JOIN assemblies a ON b.assembly = a.id
      JOIN assembly_analyses aa ON a.id = aa.assembly_id
      JOIN analyses an ON aa.analysis_id = an.id
      WHERE an.complete_time IS NOT NULL OR an.analysis_status = 'completed'
    `);

    const kpiData = [
      { title: "Datasets Analyzed", value: datasetsAnalyzedCount.rows[0].count },
      { title: "Complete Analyses", value: completeAnalysesCount.rows[0].count },
      { title: "BGCs Identified", value: bgcsCount.rows[0].count },
      { title: "Complete BGCs", value: completeBgcsCount.rows[0].count },
      { title: "GCFs Identified", value: gcfsCount.rows[0].count },
      { title: "Complete GCFs", value: completeGcfsCount.rows[0].count },
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


// Helper function to build WHERE clauses from filters
function buildFilterWhereClause(filters, tableAlias = '') {
  if (!filters || filters.length === 0) {
    return { whereClause: '', params: [] };
  }

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  filters.forEach(filter => {
    const { key, value, type } = filter;
    const columnName = tableAlias ? `${tableAlias}.${key}` : key;

    switch (type) {
      case 'text':
        if (value && value.trim()) {
          conditions.push(`${columnName} ILIKE $${paramIndex}`);
          params.push(`%${value.trim()}%`);
          paramIndex++;
        }
        break;

      case 'range':
        if (value && (value.min || value.max)) {
          if (value.min) {
            conditions.push(`${columnName} >= $${paramIndex}`);
            params.push(parseFloat(value.min));
            paramIndex++;
          }
          if (value.max) {
            conditions.push(`${columnName} <= $${paramIndex}`);
            params.push(parseFloat(value.max));
            paramIndex++;
          }
        }
        break;

      case 'select':
        if (value) {
          conditions.push(`${columnName} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
        break;

      case 'multiselect':
        if (value && Array.isArray(value) && value.length > 0) {
          // For array columns, use && operator to check if arrays overlap
          if (key === 'product_class' || key === 'product_type') {
            conditions.push(`${columnName} && $${paramIndex}`);
            params.push(value);
          } else {
            // For regular columns, use IN clause
            const placeholders = value.map(() => `$${paramIndex++}`).join(',');
            paramIndex -= value.length; // Reset for actual assignment
            conditions.push(`${columnName} IN (${placeholders})`);
            value.forEach(v => {
              params.push(v);
              paramIndex++;
            });
          }
        }
        break;

      case 'boolean':
        if (value !== null && value !== undefined) {
          conditions.push(`${columnName} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
        break;

      case 'date':
        if (value && (value.from || value.to)) {
          if (value.from) {
            conditions.push(`${columnName} >= $${paramIndex}`);
            params.push(value.from);
            paramIndex++;
          }
          if (value.to) {
            conditions.push(`${columnName} <= $${paramIndex}`);
            params.push(value.to);
            paramIndex++;
          }
        }
        break;
    }
  });

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, params };
}

// Parse filters from query parameters
function parseFilters(query) {
  const filters = [];
  
  // Check if filters are passed as a JSON string
  if (query.filters) {
    try {
      const parsedFilters = JSON.parse(query.filters);
      return parsedFilters.map(filter => ({
        ...filter,
        type: getFilterType(filter.key)
      }));
    } catch (e) {
      console.error('Error parsing filters:', e);
    }
  }

  return filters;
}

// Get filter type based on filter key
function getFilterType(key) {
  const filterTypes = {
    // Text filters
    'analysis_id': 'text',
    'accession': 'text',
    'study_name': 'text',
    'bioproject': 'text',
    'sample_names': 'text',
    'biosamples': 'text',
    'environment_features': 'text',
    'environment_materials': 'text',
    'geo_loc_names': 'text',
    'species': 'text',
    'study_names': 'text',
    'id': 'text',
    'assembly_accession': 'text',
    'contig': 'text',
    'lineage': 'text',
    'tax_id': 'text',
    'genus': 'text',
    'family': 'text',
    
    // Range filters
    'bgc_count': 'range',
    'latitudes': 'range',
    'longitudes': 'range',
    
    // Select filters
    'instrument_platform': 'select',
    
    // Multiselect filters
    'environment_biomes': 'multiselect',
    'product_class': 'multiselect',
    'product_type': 'multiselect',
    
    // Boolean filters
    'is_complete': 'boolean',
    
    // Date filters
    'public_release_date': 'date'
  };
  
  return filterTypes[key] || 'text';
}

// Browse endpoints
router.get('/browse/studies', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const sortColumn = req.query.sortColumn || 'public_release_date';
    const sortDirection = req.query.sortDirection || 'desc';

    // Parse filters
    const filters = parseFilters(req.query);

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['accession', 'study_name', 'bioproject', 'public_release_date', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'public_release_date';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'desc';

    // Build filter WHERE clause
    const { whereClause, params: filterParams } = buildFilterWhereClause(filters, 's');
    
    // Adjust parameter indices for pagination
    const paginationParams = [limit, offset];
    const allParams = [...filterParams, ...paginationParams];
    const limitOffset = `LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`;

    // Get studies with pagination, filtering, and BGC count
    const studiesQuery = `
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
      ${limitOffset}
    `;

    const studiesResult = await db.query(studiesQuery, allParams);

    // Get total count with filters
    const countQuery = `
      SELECT COUNT(*) 
      FROM studies s
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, filterParams);
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
    // Validate sort parameters to prevent SQL injection
    const validColumns = ['accession', 'sample_name', 'environment_biome', 'collection_date', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'collection_date';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'desc';

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
      ORDER BY ${column === 'bgc_count' ? 'bgc_count' : 's.' + column} ${direction}
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM samples s');
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

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['accession', 'sample_name', 'experiment_type', 'instrument_platform', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'accession';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

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
      ORDER BY ${column === 'sample_name' ? 's.sample_name' : column === 'bgc_count' ? 'bgc_count' : 'r.' + column} ${direction}
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM runs r JOIN samples s ON r.sample_id = s.id');
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

    // Parse filters
    const filters = parseFilters(req.query);

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['id', 'lineage', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'id';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

    // Build filter WHERE clause
    const { whereClause, params: filterParams } = buildFilterWhereClause(filters, 'b');
    
    // Adjust parameter indices for pagination
    const paginationParams = [limit, offset];
    const allParams = [...filterParams, ...paginationParams];
    const limitOffset = `LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`;

    // Get biomes with pagination, filtering, and BGC count
    const biomesQuery = `
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
      ${limitOffset}
    `;

    const biomesResult = await db.query(biomesQuery, allParams);

    // Get total count with filters
    const countQuery = `
      SELECT COUNT(*) 
      FROM biomes b
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, filterParams);
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

    // Parse filters
    const filters = parseFilters(req.query);

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['id', 'product_class', 'product_type', 'assembly_accession', 'contig', 'is_complete'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'id';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

    // Build filter WHERE clause - need special handling for BGCs table
    let { whereClause, params: filterParams } = buildFilterWhereClause(filters, 'b');
    
    // Handle assembly_accession filter specially since it's from joined table
    const assemblyFilters = filters.filter(f => f.key === 'assembly_accession');
    if (assemblyFilters.length > 0) {
      // Replace 'b.assembly_accession' with 'a.accession' in the where clause
      whereClause = whereClause.replace(/b\.assembly_accession/g, 'a.accession');
    }
    
    // Adjust parameter indices for pagination
    const paginationParams = [limit, offset];
    const allParams = [...filterParams, ...paginationParams];
    const limitOffset = `LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`;

    // Get BGCs with pagination, filtering, joining with assemblies to get assembly info
    const bgcsQuery = `
      SELECT b.*, a.accession as assembly_accession 
      FROM bgcs b
      JOIN assemblies a ON b.assembly = a.id
      ${whereClause}
      ORDER BY ${column === 'assembly_accession' ? 'a.accession' : 'b.' + column} ${direction}
      ${limitOffset}
    `;

    const bgcsResult = await db.query(bgcsQuery, allParams);

    // Get total count with filters
    const countQuery = `
      SELECT COUNT(*) 
      FROM bgcs b 
      JOIN assemblies a ON b.assembly = a.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, filterParams);
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

    // Parse filters
    const filters = parseFilters(req.query);

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['id', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'id';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

    // Build filter WHERE clause for GCFs - need special handling since we're using GROUP BY
    let havingClause = '';
    let whereClause = '';
    const filterParams = [];
    let paramIndex = 1;

    filters.forEach(filter => {
      const { key, value, type } = filter;
      
      if (key === 'id' && value && value.trim()) {
        whereClause = `WHERE g.id::text ILIKE $${paramIndex}`;
        filterParams.push(`%${value.trim()}%`);
        paramIndex++;
      } else if (key === 'bgc_count' && value && (value.min || value.max)) {
        const conditions = [];
        if (value.min) {
          conditions.push(`COUNT(b.id) >= $${paramIndex}`);
          filterParams.push(parseFloat(value.min));
          paramIndex++;
        }
        if (value.max) {
          conditions.push(`COUNT(b.id) <= $${paramIndex}`);
          filterParams.push(parseFloat(value.max));
          paramIndex++;
        }
        if (conditions.length > 0) {
          havingClause = `HAVING ${conditions.join(' AND ')}`;
        }
      }
    });

    // Adjust parameter indices for pagination
    const paginationParams = [limit, offset];
    const allParams = [...filterParams, ...paginationParams];
    const limitOffset = `LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`;

    // Get GCFs with pagination, filtering, including a count of BGCs in each GCF
    const gcfsQuery = `
      SELECT g.id, COUNT(b.id) as bgc_count
      FROM gcfs g
      LEFT JOIN bgcs b ON g.id = b.gcf_id
      ${whereClause}
      GROUP BY g.id
      ${havingClause}
      ORDER BY ${column === 'id' ? 'g.id' : column} ${direction}
      ${limitOffset}
    `;

    const gcfsResult = await db.query(gcfsQuery, allParams);

    // Get total count with filters
    const countQuery = `
      SELECT COUNT(*) FROM (
        SELECT g.id
        FROM gcfs g
        LEFT JOIN bgcs b ON g.id = b.gcf_id
        ${whereClause}
        GROUP BY g.id
        ${havingClause}
      ) as filtered_gcfs
    `;
    const countResult = await db.query(countQuery, filterParams);
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

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['id', 'accession', 'wgs_accession', 'coverage', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'id';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

    // Get assemblies with pagination, including a count of BGCs in each assembly
    const assembliesResult = await db.query(`
      SELECT a.id, a.accession, a.wgs_accession, a.coverage, COUNT(b.id) as bgc_count
      FROM assemblies a
      LEFT JOIN bgcs b ON a.id = b.assembly
      GROUP BY a.id, a.accession, a.wgs_accession, a.coverage
      ORDER BY ${column === 'bgc_count' ? 'bgc_count' : 'a.' + column} ${direction}
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM assemblies');
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
    const sortColumn = req.query.sortColumn || 'analysis_id';
    const sortDirection = req.query.sortDirection || 'asc';

    // Parse filters
    const filters = parseFilters(req.query);

    // Validate sort parameters to prevent SQL injection
    const validColumns = [
      'analysis_id', 'analysis_accession', 'instrument_platform', 'bgc_count',
      'sample_ids', 'sample_accessions', 'biosamples', 'sample_names', 'latitudes', 'longitudes',
      'geo_loc_names', 'environment_biomes', 'environment_features', 'environment_materials',
      'host_tax_ids', 'species', 'study_ids', 'study_accessions', 'bioprojects', 'study_names',
      'biome_ids', 'biome_lineages', 'publication_dois', 'publication_titles'
    ];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'analysis_id';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

    // Build filter WHERE clause - no table alias needed for materialized view
    const { whereClause, params: filterParams } = buildFilterWhereClause(filters);
    
    // Adjust parameter indices for pagination
    const paginationParams = [limit, offset];
    const allParams = [...filterParams, ...paginationParams];
    const limitOffset = `LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`;

    // Get analyses with pagination and filtering from the unified materialized view
    const analysesQuery = `
      SELECT *
      FROM unified_analyses_materialized
      ${whereClause}
      ORDER BY ${column} ${direction}
      ${limitOffset}
    `;

    const analysesResult = await db.query(analysesQuery, allParams);

    // Get total count with filters
    const countQuery = `
      SELECT COUNT(*) 
      FROM unified_analyses_materialized
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, filterParams);
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

router.get('/browse/taxonomy', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const sortColumn = req.query.sortColumn || 'species';
    const sortDirection = req.query.sortDirection || 'asc';

    // Parse filters
    const filters = parseFilters(req.query);

    // Validate sort parameters to prevent SQL injection
    const validColumns = ['host_tax_id', 'species', 'bgc_count'];
    const validDirections = ['asc', 'desc'];

    const column = validColumns.includes(sortColumn) ? sortColumn : 'species';
    const direction = validDirections.includes(sortDirection.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';

    // Build filter WHERE clause for taxonomy aggregation
    let { whereClause, params: filterParams } = buildFilterWhereClause(filters, 's');
    
    // Handle special taxonomy filters
    const taxFilters = filters.filter(f => ['tax_id', 'genus', 'family'].includes(f.key));
    if (taxFilters.length > 0) {
      // For now, we'll treat tax_id as host_tax_id and ignore genus/family since they're not in the schema
      taxFilters.forEach(filter => {
        if (filter.key === 'tax_id' && filter.value && filter.value.trim()) {
          const paramIndex = filterParams.length + 1;
          if (whereClause) {
            whereClause += ` AND s.host_tax_id::text ILIKE $${paramIndex}`;
          } else {
            whereClause = `WHERE s.host_tax_id::text ILIKE $${paramIndex}`;
          }
          filterParams.push(`%${filter.value.trim()}%`);
        }
      });
    }
    
    // Adjust parameter indices for pagination
    const paginationParams = [limit, offset];
    const allParams = [...filterParams, ...paginationParams];
    const limitOffset = `LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`;

    // Get taxonomy data with BGC counts
    const taxonomyQuery = `
      SELECT 
        s.host_tax_id,
        s.species,
        COUNT(DISTINCT bgc.id) as bgc_count
      FROM samples s
      LEFT JOIN sample_runs sr ON s.id = sr.sample_id
      LEFT JOIN runs r ON sr.run_id = r.id
      LEFT JOIN run_assemblies ra ON r.id = ra.run_id
      LEFT JOIN assemblies a ON ra.assembly_id = a.id
      LEFT JOIN bgcs bgc ON a.id = bgc.assembly
      ${whereClause}
      GROUP BY s.host_tax_id, s.species
      HAVING s.host_tax_id IS NOT NULL OR s.species IS NOT NULL
      ORDER BY ${column === 'bgc_count' ? 'bgc_count' : column} ${direction}
      ${limitOffset}
    `;

    const taxonomyResult = await db.query(taxonomyQuery, allParams);

    // Get total count with filters
    const countQuery = `
      SELECT COUNT(*) FROM (
        SELECT s.host_tax_id, s.species
        FROM samples s
        ${whereClause}
        GROUP BY s.host_tax_id, s.species
        HAVING s.host_tax_id IS NOT NULL OR s.species IS NOT NULL
      ) as taxonomy_groups
    `;
    const countResult = await db.query(countQuery, filterParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: taxonomyResult.rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching taxonomy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get distinct values for filter dropdowns
router.get('/browse/filter-options/:table/:column', async (req, res) => {
  try {
    const { table, column } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    // Define allowed table-column combinations for security
    const allowedFilters = {
      analyses: ['instrument_platform', 'environment_biomes', 'species'],
      studies: ['bioproject'],
      bgcs: ['product_class', 'product_type', 'anchor'],
      biomes: ['lineage'],
      taxonomy: ['species', 'genus', 'family']
    };
    
    if (!allowedFilters[table] || !allowedFilters[table].includes(column)) {
      return res.status(400).json({ error: 'Invalid table or column' });
    }
    
    let query;
    let params = [limit];
    
    switch (table) {
      case 'analyses':
        if (column === 'instrument_platform') {
          query = `
            SELECT DISTINCT instrument_platform as value, COUNT(*) as count
            FROM unified_analyses_materialized 
            WHERE instrument_platform IS NOT NULL 
            GROUP BY instrument_platform 
            ORDER BY instrument_platform ASC 
            LIMIT $1
          `;
        } else if (column === 'environment_biomes') {
          query = `
            SELECT DISTINCT unnest(environment_biomes) as value, COUNT(*) as count
            FROM unified_analyses_materialized 
            WHERE environment_biomes IS NOT NULL 
            GROUP BY value 
            ORDER BY value ASC 
            LIMIT $1
          `;
        } else if (column === 'species') {
          query = `
            SELECT DISTINCT unnest(species) as value, COUNT(*) as count
            FROM unified_analyses_materialized 
            WHERE species IS NOT NULL 
            GROUP BY value 
            ORDER BY value ASC 
            LIMIT $1
          `;
        }
        break;
        
      case 'studies':
        if (column === 'bioproject') {
          query = `
            SELECT DISTINCT bioproject as value, COUNT(*) as count
            FROM studies 
            WHERE bioproject IS NOT NULL 
            GROUP BY bioproject 
            ORDER BY bioproject ASC 
            LIMIT $1
          `;
        }
        break;
        
      case 'bgcs':
        if (column === 'product_class') {
          query = `
            SELECT DISTINCT unnest(product_class) as value, COUNT(*) as count
            FROM bgcs 
            GROUP BY value 
            ORDER BY value ASC 
            LIMIT $1
          `;
        } else if (column === 'product_type') {
          query = `
            SELECT DISTINCT unnest(product_type) as value, COUNT(*) as count
            FROM bgcs 
            GROUP BY value 
            ORDER BY value ASC 
            LIMIT $1
          `;
        } else if (column === 'anchor') {
          query = `
            SELECT DISTINCT anchor as value, COUNT(*) as count
            FROM bgcs 
            WHERE anchor IS NOT NULL 
            GROUP BY anchor 
            ORDER BY anchor ASC 
            LIMIT $1
          `;
        }
        break;
        
      case 'biomes':
        if (column === 'lineage') {
          query = `
            SELECT DISTINCT lineage as value, COUNT(*) as count
            FROM biomes 
            WHERE lineage IS NOT NULL 
            GROUP BY lineage 
            ORDER BY lineage ASC 
            LIMIT $1
          `;
        }
        break;
        
      case 'taxonomy':
        if (column === 'species') {
          query = `
            SELECT DISTINCT species as value, COUNT(*) as count
            FROM samples 
            WHERE species IS NOT NULL 
            GROUP BY species 
            ORDER BY species ASC 
            LIMIT $1
          `;
        }
        break;
        
      default:
        return res.status(400).json({ error: 'Unsupported table' });
    }
    
    if (!query) {
      return res.status(400).json({ error: 'Unsupported column for this table' });
    }
    
    const result = await db.query(query, params);
    
    // Return just the values for dropdown options
    const options = result.rows.map(row => row.value);
    
    res.json({
      options,
      total: result.rows.length,
      // Also include counts for potential future use
      detailed: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch endpoint to get multiple filter options at once
router.post('/browse/filter-options/batch', async (req, res) => {
  try {
    const { requests } = req.body; // Array of {table, column} objects
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ error: 'Invalid requests format' });
    }
    
    const results = {};
    
    for (const request of requests) {
      const { table, column } = request;
      try {
        // Call the single endpoint logic directly
        const limit = 100;
        
        // Define allowed table-column combinations for security
        const allowedFilters = {
          analyses: ['instrument_platform', 'environment_biomes', 'species'],
          studies: ['bioproject'],
          bgcs: ['product_class', 'product_type', 'anchor'],
          biomes: ['lineage'],
          taxonomy: ['species', 'genus', 'family']
        };
        
        if (!allowedFilters[table] || !allowedFilters[table].includes(column)) {
          results[`${table}.${column}`] = [];
          continue;
        }
        
        let query;
        let params = [limit];
        
        switch (table) {
          case 'analyses':
            if (column === 'instrument_platform') {
              query = `
                SELECT DISTINCT instrument_platform as value, COUNT(*) as count
                FROM unified_analyses_materialized 
                WHERE instrument_platform IS NOT NULL 
                GROUP BY instrument_platform 
                ORDER BY instrument_platform ASC 
                LIMIT $1
              `;
            } else if (column === 'environment_biomes') {
              query = `
                SELECT DISTINCT unnest(environment_biomes) as value, COUNT(*) as count
                FROM unified_analyses_materialized 
                WHERE environment_biomes IS NOT NULL 
                GROUP BY value 
                ORDER BY value ASC 
                LIMIT $1
              `;
            } else if (column === 'species') {
              query = `
                SELECT DISTINCT unnest(species) as value, COUNT(*) as count
                FROM unified_analyses_materialized 
                WHERE species IS NOT NULL 
                GROUP BY value 
                ORDER BY value ASC 
                LIMIT $1
              `;
            }
            break;
            
          case 'studies':
            if (column === 'bioproject') {
              query = `
                SELECT DISTINCT bioproject as value, COUNT(*) as count
                FROM studies 
                WHERE bioproject IS NOT NULL 
                GROUP BY bioproject 
                ORDER BY bioproject ASC 
                LIMIT $1
              `;
            }
            break;
            
          case 'bgcs':
            if (column === 'product_class') {
              query = `
                SELECT DISTINCT unnest(product_class) as value, COUNT(*) as count
                FROM bgcs 
                GROUP BY value 
                ORDER BY value ASC 
                LIMIT $1
              `;
            } else if (column === 'product_type') {
              query = `
                SELECT DISTINCT unnest(product_type) as value, COUNT(*) as count
                FROM bgcs 
                GROUP BY value 
                ORDER BY value ASC 
                LIMIT $1
              `;
            } else if (column === 'anchor') {
              query = `
                SELECT DISTINCT anchor as value, COUNT(*) as count
                FROM bgcs 
                WHERE anchor IS NOT NULL 
                GROUP BY anchor 
                ORDER BY anchor ASC 
                LIMIT $1
              `;
            }
            break;
            
          case 'biomes':
            if (column === 'lineage') {
              query = `
                SELECT DISTINCT lineage as value, COUNT(*) as count
                FROM biomes 
                WHERE lineage IS NOT NULL 
                GROUP BY lineage 
                ORDER BY lineage ASC 
                LIMIT $1
              `;
            }
            break;
            
          case 'taxonomy':
            if (column === 'species') {
              query = `
                SELECT DISTINCT species as value, COUNT(*) as count
                FROM samples 
                WHERE species IS NOT NULL 
                GROUP BY species 
                ORDER BY species ASC 
                LIMIT $1
              `;
            }
            break;
        }
        
        if (query) {
          const result = await db.query(query, params);
          const options = result.rows.map(row => row.value);
          results[`${table}.${column}`] = options;
        } else {
          results[`${table}.${column}`] = [];
        }
        
      } catch (error) {
        console.error(`Error fetching options for ${table}.${column}:`, error);
        results[`${table}.${column}`] = [];
      }
    }
    
    res.json(results);
    
  } catch (error) {
    console.error('Error in batch filter options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import the queue and the updateQueueStatsInRedis function
const { searchQueue, updateQueueStatsInRedis } = require('../queue');

// Using the updateQueueStatsInRedis function imported from the queue module

// Error handler middleware for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: `File size limit exceeded. Maximum file size is ${maxSizeMB} MB.` 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({ 
        error: `Too many files. Maximum number of files is ${maxFiles}.` 
      });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  next(err);
};

// Sequence Search endpoint
router.post('/search/sequence', (req, res, next) => {
  upload.array('files')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
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

    // Update queue statistics in Redis
    await updateQueueStatsInRedis('sequence');
    await updateQueueStatsInRedis(); // Update all stats

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
router.post('/search/bgc', (req, res, next) => {
  upload.array('files')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
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

    // Update queue statistics in Redis
    await updateQueueStatsInRedis('bgc');
    await updateQueueStatsInRedis(); // Update all stats

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

    // Create a Redis connection
    const Redis = require('ioredis');
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // Create a cache key based on the job type
    const cacheKey = type ? `queue-stats:${type}` : 'queue-stats:all';

    // Try to get queue stats from Redis
    let queueStats = null;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      // Use stats from Redis
      console.log('Using queue statistics from Redis cache');
      queueStats = JSON.parse(cachedData).queueStats;
    } else {
      // If not in Redis, update Redis and get fresh stats
      console.log('Updating queue statistics in Redis');
      await updateQueueStatsInRedis(type);
      const freshData = await redis.get(cacheKey);
      if (freshData) {
        queueStats = JSON.parse(freshData).queueStats;
      } else {
        // Fallback to direct calculation if Redis fails
        const waitingJobs = await searchQueue.getWaitingCount();
        const activeJobs = await searchQueue.getActiveCount();
        const totalJobs = waitingJobs + activeJobs;
        queueStats = {
          totalJobs,
          activeJobs,
          waitingJobs
        };
      }
    }

    // Get queue position of the job
    let queuePosition = 0;
    if (state === 'waiting') {
      // Get all waiting jobs
      const waitingJobsData = await searchQueue.getJobs(['waiting']);
      // Find the position of the current job in the waiting queue
      queuePosition = waitingJobsData.findIndex(waitingJob => waitingJob.id === jobId) + 1;
    }

    // Add queue position to the stats
    queueStats.queuePosition = queuePosition;

    redis.quit();

    res.json({
      jobId,
      type,
      state,
      progress,
      result,
      queueStats
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sample locations for map
router.get('/map/sample-locations', async (req, res) => {
  try {
    const { bounds, zoom, limit = 1000, offset = 0, all = false } = req.query;

    // Create a cache key based on the request parameters
    const Redis = require('ioredis');
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // Special cache key for "all" requests
    const cacheKey = all === 'true' 
      ? 'sample-locations:all-samples' 
      : `sample-locations:${bounds || 'all'}:${zoom || 'all'}:${limit}:${offset}`;

    // Try to get data from cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log('Returning sample locations from cache');
      redis.quit();
      return res.json(JSON.parse(cachedData));
    }

    // If not in cache, query the database
    let query = `
      SELECT id, accession, sample_name, latitude, longitude
      FROM samples
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Add bounding box filter if provided and not requesting all samples
    if (bounds && all !== 'true') {
      const [south, west, north, east] = bounds.split(',').map(Number);
      query += ` AND latitude BETWEEN $${paramIndex} AND $${paramIndex+1} 
                 AND longitude BETWEEN $${paramIndex+2} AND $${paramIndex+3}`;
      queryParams.push(south, north, west, east);
      paramIndex += 4;
    }

    // If zoom level is low and not requesting all samples, use clustering to reduce points
    if (zoom && parseInt(zoom) < 5 && all !== 'true') {
      // For low zoom levels, cluster points by rounding coordinates
      // The lower the zoom, the more aggressive the clustering
      const precision = Math.max(1, parseInt(zoom));
      query = `
        SELECT 
          MIN(id) as id,
          MIN(accession) as accession,
          COUNT(*) as sample_count,
          ROUND(AVG(latitude)::numeric, ${precision}) as latitude,
          ROUND(AVG(longitude)::numeric, ${precision}) as longitude
        FROM (${query}) as samples
        GROUP BY ROUND(latitude::numeric, ${precision}), ROUND(longitude::numeric, ${precision})
      `;
    }

    // Get total count for pagination or total count
    const countResult = await db.query(`
      SELECT COUNT(*) FROM samples 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `);

    const totalSamples = parseInt(countResult.rows[0].count);

    // Add pagination only if not requesting all samples
    if (all !== 'true') {
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex+1}`;
      queryParams.push(parseInt(limit), parseInt(offset));
    }

    const result = await db.query(query, queryParams);

    const responseData = {
      data: result.rows,
      total: totalSamples,
      limit: all === 'true' ? totalSamples : parseInt(limit),
      offset: all === 'true' ? 0 : parseInt(offset)
    };

    // Cache the result for 1 hour (3600 seconds)
    // For "all" requests, cache for longer (24 hours) since they're less likely to change
    const cacheTime = all === 'true' ? 86400 : 3600;
    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', cacheTime);
    redis.quit();

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching sample locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get queue statistics endpoint
router.get('/search/queue-stats', async (req, res) => {
  try {
    const { type } = req.query;
    console.log(`[DEBUG] Queue stats request received for type: ${type || 'all'}`);

    // Validate the search type if provided
    if (type && type !== 'sequence' && type !== 'bgc') {
      console.log(`[DEBUG] Invalid search type: ${type}`);
      return res.status(400).json({ error: 'Invalid search type. Must be "sequence" or "bgc".' });
    }

    // Create a Redis connection
    const Redis = require('ioredis');
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // Create a cache key based on the type parameter
    const cacheKey = type ? `queue-stats:${type}` : 'queue-stats:all';
    console.log(`[DEBUG] Using Redis cache key: ${cacheKey}`);

    // Try to get data from cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`[DEBUG] Found data in Redis cache: ${cachedData}`);
      const parsedData = JSON.parse(cachedData);
      console.log(`[DEBUG] Parsed data from Redis: ${JSON.stringify(parsedData)}`);
      redis.quit();
      return res.json(parsedData);
    } else {
      console.log(`[DEBUG] No data found in Redis for key: ${cacheKey}`);
    }

    // If not in cache, update Redis and get fresh stats
    console.log('[DEBUG] Updating queue statistics in Redis');
    const queueStats = await updateQueueStatsInRedis(type);
    console.log(`[DEBUG] Queue stats from updateQueueStatsInRedis: ${JSON.stringify(queueStats)}`);

    // Get the updated data from Redis
    const freshData = await redis.get(cacheKey);
    console.log(`[DEBUG] Fresh data from Redis: ${freshData}`);
    redis.quit();

    if (freshData) {
      const parsedFreshData = JSON.parse(freshData);
      console.log(`[DEBUG] Parsed fresh data: ${JSON.stringify(parsedFreshData)}`);
      return res.json(parsedFreshData);
    } else {
      console.log(`[DEBUG] No fresh data found in Redis after update for key: ${cacheKey}`);
    }

    // Fallback response if Redis fails
    const fallbackResponse = {
      queueStats: queueStats || {
        totalJobs: 0,
        activeJobs: 0,
        waitingJobs: 0
      }
    };
    console.log(`[DEBUG] Using fallback response: ${JSON.stringify(fallbackResponse)}`);
    res.json(fallbackResponse);
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
