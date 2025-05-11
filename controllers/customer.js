const User = require('../models/User');
const Order = require('../models/Order');
const Feedback = require('../models/Feedback');
const Item = require('../models/Item');

// @desc    Get customer dashboard data
// @route   GET /api/customer/dashboard
// @access  Private (Customer only)
exports.getDashboard = async (req, res) => {
  try {
    // Get customer info
    const customer = await User.findById(req.user.id);
    
    if (!customer || customer.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as a customer'
      });
    }
    
    // Get customer's recent orders
    const recentOrders = await Order.find({ 'customer.id': customer._id })
      .sort({ orderDate: -1 })
      .limit(5);
      
    // Count total orders for this customer
    const totalOrders = await Order.countDocuments({ 'customer.id': customer._id });
    
    // Count active orders (pending or processing)
    const activeOrders = await Order.countDocuments({ 
      'customer.id': customer._id,
      status: { $in: ['Pending', 'Processing'] }
    });
    
    res.status(200).json({
      success: true,
      data: {
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address
        },
        stats: {
          totalOrders,
          activeOrders
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get customer orders
// @route   GET /api/customer/orders
// @access  Private (Customer only)
exports.getCustomerOrders = async (req, res) => {
  try {
    const customer = await User.findById(req.user.id);
    
    // Get query parameters for filtering
    const { status, startDate, endDate } = req.query;
    
    // Build query
    const query = { 'customer.id': customer._id };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get orders
    const orders = await Order.find(query)
      .sort({ orderDate: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get order details
// @route   GET /api/customer/orders/:id
// @access  Private (Customer only)
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if the order belongs to this customer
    if (order.customer.id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new order
// @route   POST /api/customer/orders
// @access  Private (Customer only)
exports.createOrder = async (req, res) => {
  let session;
  
  try {
    console.log('Creating order with data:', req.body);
    
    const customer = await User.findById(req.user.id);
    
    if (!customer || customer.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as a customer'
      });
    }
    
    // Extract order data from request body
    const { items, notes } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one item to the order'
      });
    }
    
    // Calculate total amount and validate stock
    let totalAmount = 0;
    const orderItems = [];
    
    // Check stock and calculate total
    for (const orderItem of items) {
      console.log('Processing item:', orderItem);
      
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
          message: `Not enough stock for ${item.name}. Available: ${item.stockQuantity}`
        });
      }
      
      // Add price if not provided
      if (!orderItem.price) {
        orderItem.price = item.price;
      }
      
      // Calculate subtotal
      const subtotal = orderItem.price * orderItem.quantity;
      totalAmount += subtotal;
      
      // Add to order items array
      orderItems.push({
        item: item._id,
        name: item.name,
        price: orderItem.price,
        quantity: orderItem.quantity,
        subtotal
      });
    }
    
    // Create order with all necessary fields
    const orderData = {
      orderNumber: `ORD${Date.now()}`,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || ''
      },
      items: orderItems,
      totalAmount,
      notes: notes || '',
      status: 'Pending',
      paymentStatus: 'Pending',
      paymentMethod: 'Cash', // Default payment method
      orderDate: Date.now(),
      createdBy: customer._id
    };
    
    console.log('Order data prepared:', orderData);
    
    // Try to use transactions if possible
    try {
      session = await Order.startSession();
      session.startTransaction();
      
      // Create the order
      const order = await Order.create([orderData], { session });
      console.log('Order created:', order);
      
      // Update stock for each item
      for (const orderItem of orderItems) {
        const updatedItem = await Item.findByIdAndUpdate(
          orderItem.item,
          { $inc: { stockQuantity: -orderItem.quantity } },
          { session, new: true }
        );
        console.log('Updated item stock:', updatedItem);
      }
      
      // Commit the transaction
      await session.commitTransaction();
      
      res.status(201).json({
        success: true,
        data: order[0]
      });
    } catch (txError) {
      // If an error occurred in transaction
      console.error('Transaction error:', txError);
      
      if (session) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          console.error('Error aborting transaction:', abortError);
        }
      }
      
      // Try non-transactional approach as fallback
      console.log('Attempting non-transactional order creation as fallback...');
      
      // Create order without transaction
      const order = await Order.create(orderData);
      console.log('Order created without transaction:', order);
      
      // Update stock for each item without transaction
      for (const orderItem of orderItems) {
        const updatedItem = await Item.findByIdAndUpdate(
          orderItem.item,
          { $inc: { stockQuantity: -orderItem.quantity } },
          { new: true }
        );
        console.log('Updated item stock without transaction:', updatedItem);
      }
      
      res.status(201).json({
        success: true,
        data: order
      });
    } finally {
      if (session) {
        session.endSession();
      }
    }
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
    
    // Ensure session is ended if exists
    if (session) {
      try {
        session.endSession();
      } catch (sessionError) {
        console.error('Error ending session:', sessionError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Submit feedback for an order
// @route   POST /api/customer/feedback
// @access  Private (Customer only)
exports.submitFeedback = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    
    if (!orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order ID and rating'
      });
    }
    
    // Check if order exists and belongs to this customer
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (order.customer.id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to provide feedback for this order'
      });
    }
    
    // Create feedback
    const feedback = await Feedback.create({
      order: orderId,
      customer: req.user.id,
      rating,
      comment,
      date: Date.now()
    });
    
    // Update order with feedback reference
    order.feedback = feedback._id;
    await order.save();
    
    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get customer profile
// @route   GET /api/customer/profile
// @access  Private (Customer only)
exports.getProfile = async (req, res) => {
  try {
    const customer = await User.findById(req.user.id);
    
    if (!customer || customer.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as a customer'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        _id: customer._id,
        username: customer.username,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update customer profile
// @route   PUT /api/customer/profile
// @access  Private (Customer only)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    // Update customer profile
    const customer = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: {
        _id: customer._id,
        username: customer.username,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        role: customer.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 