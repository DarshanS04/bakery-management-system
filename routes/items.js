const express = require('express');
const { 
  getItems, 
  getItem, 
  createItem, 
  updateItem, 
  deleteItem,
  updateStock
} = require('../controllers/items');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getItems)
  .post(protect, authorize('admin'), createItem);

router
  .route('/:id')
  .get(protect, getItem)
  .put(protect, authorize('admin'), updateItem)
  .delete(protect, authorize('admin'), deleteItem);

router
  .route('/:id/stock')
  .patch(protect, updateStock);

module.exports = router; 