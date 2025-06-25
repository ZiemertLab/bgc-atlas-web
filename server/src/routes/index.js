const express = require('express');
const router = express.Router();

// Mock data for demonstration purposes
const kpiData = [
  { title: "Total BGCs", value: "1,203,456" },
  { title: "Total GCFs", value: "89,123" },
  { title: "Total Samples", value: "45,678" },
  { title: "Total Taxa", value: "12,345" },
];

const barChartData = [
  { name: "PKS", count: 450 },
  { name: "NRPS", count: 380 },
  { name: "RiPP", count: 290 },
  { name: "Terpene", count: 220 },
  { name: "Saccharide", count: 180 },
  { name: "Other", count: 150 },
];

const lineChartData = [
  { year: '2020', count: 100000 },
  { year: '2021', count: 350000 },
  { year: '2022', count: 700000 },
  { year: '2023', count: 950000 },
  { year: '2024', count: 1203456 },
];

// Stats endpoints
router.get('/stats/kpi', (req, res) => {
  res.json(kpiData);
});

router.get('/stats/bgc-classes', (req, res) => {
  res.json(barChartData);
});

router.get('/stats/growth', (req, res) => {
  res.json(lineChartData);
});

// Browse endpoints
router.get('/browse/bgcs', (req, res) => {
  // Mock data for BGCs
  res.json({
    data: [],
    total: 0,
    page: 1,
    limit: 10
  });
});

router.get('/browse/gcfs', (req, res) => {
  // Mock data for GCFs
  res.json({
    data: [],
    total: 0,
    page: 1,
    limit: 10
  });
});

router.get('/browse/samples', (req, res) => {
  // Mock data for samples
  res.json({
    data: [],
    total: 0,
    page: 1,
    limit: 10
  });
});

router.get('/browse/taxonomy', (req, res) => {
  // Mock data for taxonomy
  res.json({
    data: [],
    total: 0,
    page: 1,
    limit: 10
  });
});

module.exports = router;