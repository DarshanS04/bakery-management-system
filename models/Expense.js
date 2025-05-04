const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an expense title'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Ingredients', 'Utilities', 'Rent', 'Salaries', 'Equipment', 'Marketing', 'Maintenance', 'Transport', 'Miscellaneous']
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  paidTo: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'UPI', 'Other'],
    default: 'Cash'
  },
  receipt: {
    type: String  // Path to receipt image if uploaded
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', ExpenseSchema); 