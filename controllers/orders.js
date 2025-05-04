const Order = require('../models/Order');
const Item = require('../models/Item');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    let query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.orderDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.orderDate = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.orderDate = { $lte: new Date(req.query.endDate) };
    }
    
    // Filter by today if requested
    if (req.query.today === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      query.orderDate = {
        $gte: today,
        $lt: tomorrow
      };
    }
    
    // Find orders
    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    
    // Calculate total amount if not provided
    if (!req.body.totalAmount && req.body.items && req.body.items.length > 0) {
      req.body.totalAmount = req.body.items.reduce((total, item) => total + item.subtotal, 0);
    }
    
    // Validate items and update stock
    if (req.body.items && req.body.items.length > 0) {
      for (let i = 0; i < req.body.items.length; i++) {
        const orderItem = req.body.items[i];
        
        // Check if item exists
        const item = await Item.findById(orderItem.item);
        if (!item) {
          return res.status(404).json({
            success: false,
            message: `Item with ID ${orderItem.item} not found`
          });
        }
        
        // Check if enough stock
        if (item.stockQuantity < orderItem.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for ${item.name}`
          });
        }
        
        // Update item stock
        await Item.findByIdAndUpdate(
          orderItem.item,
          { $inc: { stockQuantity: -orderItem.quantity } }
        );
        
        // Add item name if not provided
        if (!orderItem.name) {
          req.body.items[i].name = item.name;
        }
        
        // Set price if not provided
        if (!orderItem.price) {
          req.body.items[i].price = item.price;
        }
        
        // Calculate subtotal if not provided
        if (!orderItem.subtotal) {
          req.body.items[i].subtotal = orderItem.price * orderItem.quantity;
        }
      }
    }
    
    const order = await Order.create(req.body);
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        message: messages
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Handle item changes if updating items
    if (req.body.items) {
      // First, restore previous quantities
      for (const oldItem of order.items) {
        await Item.findByIdAndUpdate(
          oldItem.item,
          { $inc: { stockQuantity: oldItem.quantity } }
        );
      }
      
      // Then process new items
      for (const newItem of req.body.items) {
        const item = await Item.findById(newItem.item);
        
        if (!item) {
          return res.status(404).json({
            success: false,
            message: `Item with ID ${newItem.item} not found`
          });
        }
        
        if (item.stockQuantity < newItem.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for ${item.name}`
          });
        }
        
        // Update stock
        await Item.findByIdAndUpdate(
          newItem.item,
          { $inc: { stockQuantity: -newItem.quantity } }
        );
      }
    }
    
    // Update order
    order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        message: messages
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }
    
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Restore item quantities
    for (const orderItem of order.items) {
      await Item.findByIdAndUpdate(
        orderItem.item,
        { $inc: { stockQuantity: orderItem.quantity } }
      );
    }
    
    await order.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 