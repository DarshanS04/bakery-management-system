const express = require('express');
const { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrder, 
  deleteOrder,
  updateOrderStatus
} = require('../controllers/orders');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router
  .route('/:id')
  .get(protect, getOrder)
  .put(protect, authorize('admin'), updateOrder)
  .delete(protect, authorize('admin'), deleteOrder);

router
  .route('/:id/status')
  .patch(protect, updateOrderStatus);

module.exports = router; 