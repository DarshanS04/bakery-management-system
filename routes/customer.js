const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getDashboard, 
  getCustomerOrders, 
  getOrderDetails,
  createOrder,
  submitFeedback,
  getProfile,
  updateProfile
} = require('../controllers/customer');

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('customer'));

// Dashboard route
router.get('/dashboard', getDashboard);

// Orders routes
router.get('/orders', getCustomerOrders);
router.get('/orders/:id', getOrderDetails);
router.post('/orders', createOrder);

// Feedback route
router.post('/feedback', submitFeedback);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router; 