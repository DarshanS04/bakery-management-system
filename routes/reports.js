const express = require('express');
const { 
  getDailyReport, 
  getDateRangeReport, 
  getInventoryReport, 
  getDashboardSummary,
  getFeedbackReport
} = require('../controllers/reports');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/daily', protect, authorize('admin', 'staff'), getDailyReport);
router.get('/range', protect, authorize('admin', 'staff'), getDateRangeReport);
router.get('/inventory', protect, authorize('admin', 'staff'), getInventoryReport);
router.get('/dashboard', protect, authorize('admin', 'staff'), getDashboardSummary);
router.get('/feedback', protect, authorize('admin', 'staff'), getFeedbackReport);

module.exports = router; 