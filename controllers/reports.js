const Order = require('../models/Order');
const Expense = require('../models/Expense');
const Item = require('../models/Item');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

// @desc    Get daily sales and expenses report
// @route   GET /api/reports/daily
// @access  Private
exports.getDailyReport = async (req, res) => {
  try {
    // Get date parameters
    let date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Get orders for the day
    const orders = await Order.find({
      orderDate: {
        $gte: date,
        $lt: nextDay
      }
    });
    
    // Calculate sales metrics
    const totalSales = orders.reduce((total, order) => total + order.totalAmount, 0);
    const completedOrders = orders.filter(order => order.status === 'Delivered').length;
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    const processingOrders = orders.filter(order => order.status === 'Processing').length;
    
    // Get expenses for the day
    const expenses = await Expense.find({
      date: {
        $gte: date,
        $lt: nextDay
      }
    });
    
    // Calculate expense metrics
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    
    // Calculate profit
    const profit = totalSales - totalExpenses;
    
    // Get top selling items
    const itemSales = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (itemSales[item.name]) {
          itemSales[item.name].quantity += item.quantity;
          itemSales[item.name].revenue += item.subtotal;
        } else {
          itemSales[item.name] = {
            name: item.name,
            quantity: item.quantity,
            revenue: item.subtotal
          };
        }
      });
    });
    
    const topItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    res.status(200).json({
      success: true,
      data: {
        date: date.toISOString(),
        totalSales,
        totalExpenses,
        profit,
        orderCount: orders.length,
        orderStatus: {
          completed: completedOrders,
          pending: pendingOrders,
          processing: processingOrders
        },
        topItems,
        orders,
        expenses
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

// @desc    Get date range report
// @route   GET /api/reports/range
// @access  Private
exports.getDateRangeReport = async (req, res) => {
  try {
    // Get date parameters
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide start and end dates'
      });
    }
    
    const startDate = new Date(req.query.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(req.query.endDate);
    endDate.setHours(23, 59, 59, 999);
    
    // Get orders for the range
    const orders = await Order.find({
      orderDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ orderDate: 1 });
    
    // Get expenses for the range
    const expenses = await Expense.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });
    
    // Calculate daily metrics
    const dailyData = {};
    const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Initialize daily data
    for (let i = 0; i < dayCount; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      dailyData[dateStr] = {
        date: dateStr,
        sales: 0,
        expenses: 0,
        profit: 0,
        orderCount: 0
      };
    }
    
    // Populate daily sales data
    orders.forEach(order => {
      const dateStr = order.orderDate.toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].sales += order.totalAmount;
        dailyData[dateStr].orderCount += 1;
      }
    });
    
    // Populate daily expense data
    expenses.forEach(expense => {
      const dateStr = expense.date.toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].expenses += expense.amount;
      }
    });
    
    // Calculate daily profit
    Object.keys(dailyData).forEach(dateStr => {
      dailyData[dateStr].profit = dailyData[dateStr].sales - dailyData[dateStr].expenses;
    });
    
    // Calculate overall metrics
    const totalSales = orders.reduce((total, order) => total + order.totalAmount, 0);
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    const profit = totalSales - totalExpenses;
    
    // Group expenses by category
    const expensesByCategory = {};
    expenses.forEach(expense => {
      if (expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] += expense.amount;
      } else {
        expensesByCategory[expense.category] = expense.amount;
      }
    });
    
    // Get top selling items
    const itemSales = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (itemSales[item.name]) {
          itemSales[item.name].quantity += item.quantity;
          itemSales[item.name].revenue += item.subtotal;
        } else {
          itemSales[item.name] = {
            name: item.name,
            quantity: item.quantity,
            revenue: item.subtotal
          };
        }
      });
    });
    
    const topItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
    res.status(200).json({
      success: true,
      data: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: dayCount,
        summary: {
          totalSales,
          totalExpenses,
          profit,
          orderCount: orders.length,
          expenseCount: expenses.length
        },
        dailyData: Object.values(dailyData),
        expensesByCategory,
        topItems
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

// @desc    Get inventory status report
// @route   GET /api/reports/inventory
// @access  Private
exports.getInventoryReport = async (req, res) => {
  try {
    // Get all items
    const items = await Item.find().sort({ category: 1, name: 1 });
    
    // Group by category
    const itemsByCategory = {};
    items.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });
    
    // Identify low stock items
    const lowStockItems = items.filter(item => item.stockQuantity <= item.minStockLevel);
    
    // Calculate total inventory value
    const totalInventoryValue = items.reduce(
      (total, item) => total + (item.cost * item.stockQuantity),
      0
    );
    
    res.status(200).json({
      success: true,
      data: {
        totalItems: items.length,
        lowStockCount: lowStockItems.length,
        totalInventoryValue,
        itemsByCategory,
        lowStockItems
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

// @desc    Get dashboard summary
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboardSummary = async (req, res) => {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get today's orders
    const todayOrders = await Order.find({
      orderDate: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Get today's expenses
    const todayExpenses = await Expense.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Calculate today's metrics
    const todaySales = todayOrders.reduce((total, order) => total + order.totalAmount, 0);
    const todayExpenseTotal = todayExpenses.reduce((total, expense) => total + expense.amount, 0);
    const todayProfit = todaySales - todayExpenseTotal;
    
    // Get yesterday's orders for comparison
    const yesterdayOrders = await Order.find({
      orderDate: {
        $gte: yesterday,
        $lt: today
      }
    });
    
    // Calculate yesterday's metrics for comparison
    const yesterdaySales = yesterdayOrders.reduce((total, order) => total + order.totalAmount, 0);
    
    // Calculate sales growth
    const salesGrowth = yesterdaySales === 0 
      ? 100 
      : ((todaySales - yesterdaySales) / yesterdaySales) * 100;
    
    // Get pending orders
    const pendingOrders = await Order.find({
      status: { $in: ['Pending', 'Processing'] }
    }).sort({ orderDate: 1 }).limit(10);
    
    // Get low stock items
    const lowStockItems = await Item.find({
      $expr: { $lte: ["$stockQuantity", "$minStockLevel"] }
    }).sort({ stockQuantity: 1 }).limit(10);
    
    res.status(200).json({
      success: true,
      data: {
        todaySales,
        todayExpenses: todayExpenseTotal,
        todayProfit,
        todayOrderCount: todayOrders.length,
        salesGrowth,
        pendingOrders,
        lowStockItems,
        todayOrders: todayOrders.slice(0, 10),
        todayExpensesList: todayExpenses.slice(0, 10)
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

// @desc    Get customer feedback report
// @route   GET /api/reports/feedback
// @access  Private (Admin and Staff only)
exports.getFeedbackReport = async (req, res) => {
  try {
    // Query parameters for filtering
    const { startDate, endDate, minRating, maxRating } = req.query;
    
    // Build query object
    const query = {};
    
    // Apply date filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Apply rating filter if provided
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseInt(minRating);
      if (maxRating) query.rating.$lte = parseInt(maxRating);
    }
    
    // Get feedback with populated order and customer details
    const feedback = await Feedback.find(query)
      .populate({
        path: 'order',
        select: 'orderNumber orderDate totalAmount status'
      })
      .populate({
        path: 'customer',
        select: 'name email'
      })
      .sort({ date: -1 });
    
    // Calculate average rating
    const totalRatings = feedback.length;
    const averageRating = totalRatings > 0 
      ? feedback.reduce((sum, item) => sum + item.rating, 0) / totalRatings 
      : 0;
    
    // Count ratings by score (1-5)
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    feedback.forEach(item => {
      ratingCounts[item.rating] += 1;
    });
    
    // Calculate percentage for each rating
    const ratingPercentages = {};
    Object.keys(ratingCounts).forEach(rating => {
      ratingPercentages[rating] = totalRatings > 0 
        ? (ratingCounts[rating] / totalRatings) * 100 
        : 0;
    });
    
    // Return feedback data
    res.status(200).json({
      success: true,
      data: {
        totalFeedback: totalRatings,
        averageRating,
        ratingCounts,
        ratingPercentages,
        recentFeedback: feedback
      }
    });
  } catch (error) {
    console.error('Error fetching feedback report:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 