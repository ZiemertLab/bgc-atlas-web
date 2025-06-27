const express = require('express');
const router = express.Router();
const db = require('../db');

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
      ORDER BY public_release_date DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM studies');
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
      ORDER BY collection_date DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM samples');
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
      ORDER BY r.accession
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM runs');
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
      ORDER BY id
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM biomes');
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

    // Get BGCs with pagination, joining with assemblies to get assembly info
    const bgcsResult = await db.query(`
      SELECT b.*, a.accession as assembly_accession 
      FROM bgcs b
      JOIN assemblies a ON b.assembly = a.id
      ORDER BY b.id
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM bgcs');
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

    // Get GCFs with pagination, including a count of BGCs in each GCF
    const gcfsResult = await db.query(`
      SELECT g.id, COUNT(b.id) as bgc_count
      FROM gcfs g
      LEFT JOIN bgcs b ON g.id = b.gcf_id
      GROUP BY g.id
      ORDER BY g.id
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM gcfs');
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

module.exports = router;
