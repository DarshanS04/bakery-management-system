const express = require('express');
const { 
  getDailyReport, 
  getDateRangeReport, 
  getInventoryReport, 
  getDashboardSummary 
} = require('../controllers/reports');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/daily', protect, getDailyReport);
router.get('/range', protect, getDateRangeReport);
router.get('/inventory', protect, getInventoryReport);
router.get('/dashboard', protect, getDashboardSummary);

module.exports = router; 