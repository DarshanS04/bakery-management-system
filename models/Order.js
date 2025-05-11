const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      // This is a placeholder, real value will be set in pre-save
      return 'ORD' + new Date().getTime();
    }
  },
  customer: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a customer ID']
    },
    name: {
      type: String,
      required: [true, 'Please provide a customer name']
    },
    email: {
      type: String
    },
    phone: {
      type: String
    },
    address: {
      type: String
    }
  },
  items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: true
      },
      subtotal: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Partial'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Other'],
    default: 'Cash'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date
  },
  notes: {
    type: String
  },
  feedback: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get latest order
    try {
      const latestOrder = await mongoose.model('Order').findOne({}, {}, { sort: { 'orderDate': -1 } });
      let counter = 1;
      
      if (latestOrder) {
        // Extract counter from the last order number if from the same day
        const lastOrderDate = new Date(latestOrder.orderDate);
        if (lastOrderDate.toDateString() === date.toDateString()) {
          const lastOrderCounter = parseInt(latestOrder.orderNumber.substr(-3));
          if (!isNaN(lastOrderCounter)) {
            counter = lastOrderCounter + 1;
          }
        }
      }
      
      // Format: ORDyymmdd001
      this.orderNumber = `ORD${year}${month}${day}${counter.toString().padStart(3, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Order', OrderSchema); 