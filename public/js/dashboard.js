// Dashboard Module
const Dashboard = (() => {
  // Cache DOM elements
  const todayOrders = document.getElementById('today-orders-count');
  const todaySales = document.getElementById('today-sales');
  const todayExpenses = document.getElementById('today-expenses');
  const todayProfit = document.getElementById('today-profit');
  const pendingOrdersList = document.getElementById('pending-orders-list');
  const lowStockList = document.getElementById('low-stock-list');
  
  // Initialize dashboard
  const init = async () => {
    loadDashboardData();
  };
  
  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      // Show loading states
      showLoadingState();
      
      // Fetch dashboard data
      const result = await Utils.fetchApi(API_ENDPOINTS.dashboardSummary);
      
      if (result.success) {
        // Update dashboard with the data
        updateDashboardStats(result.data.data);
        renderPendingOrders(result.data.data.pendingOrders);
        renderLowStockItems(result.data.data.lowStockItems);
      } else {
        Utils.showAlert('Error', 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      Utils.showAlert('Error', 'Failed to load dashboard data');
    }
  };
  
  // Show loading state
  const showLoadingState = () => {
    todayOrders.textContent = '...';
    todaySales.textContent = '...';
    todayExpenses.textContent = '...';
    todayProfit.textContent = '...';
    Utils.showLoading('pending-orders-list');
    Utils.showLoading('low-stock-list');
  };
  
  // Update dashboard statistics
  const updateDashboardStats = (data) => {
    todayOrders.textContent = data.todayOrderCount;
    todaySales.textContent = Utils.formatCurrency(data.todaySales);
    todayExpenses.textContent = Utils.formatCurrency(data.todayExpenses);
    todayProfit.textContent = Utils.formatCurrency(data.todayProfit);
  };
  
  // Render pending orders list
  const renderPendingOrders = (orders) => {
    if (!orders || orders.length === 0) {
      pendingOrdersList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-shopping-cart"></i>
          <p>No pending orders</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    orders.forEach(order => {
      html += `
        <div class="data-card pending">
          <div class="data-card-header">
            <div class="data-card-title">${order.orderNumber}</div>
            <span class="data-badge badge-${order.status.toLowerCase()}">${order.status}</span>
          </div>
          <div class="data-card-detail">Customer: ${order.customer.name}</div>
          <div class="data-card-detail">Amount: ${Utils.formatCurrency(order.totalAmount)}</div>
          <div class="data-card-detail">Date: ${Utils.formatDate(order.orderDate)}</div>
          <div class="data-card-actions">
            <button class="btn-link view-order" data-id="${order._id}">View Details</button>
          </div>
        </div>
      `;
    });
    
    pendingOrdersList.innerHTML = html;
    
    // Add event listeners to view buttons
    pendingOrdersList.querySelectorAll('.view-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-id');
        // Navigate to orders page and view this order
        UI.navigateTo('orders');
        Orders.viewOrder(orderId);
      });
    });
  };
  
  // Render low stock items list
  const renderLowStockItems = (items) => {
    if (!items || items.length === 0) {
      lowStockList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>No low stock items</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    items.forEach(item => {
      html += `
        <div class="data-card">
          <div class="data-card-header">
            <div class="data-card-title">${item.name}</div>
            <span class="data-badge badge-pending">${item.category}</span>
          </div>
          <div class="data-card-detail stock-low">
            Stock: ${item.stockQuantity} ${item.unit} (Min: ${item.minStockLevel})
          </div>
          <div class="data-card-actions">
            <button class="btn-link update-stock" data-id="${item._id}">Update Stock</button>
            <button class="btn-link view-item" data-id="${item._id}">View Details</button>
          </div>
        </div>
      `;
    });
    
    lowStockList.innerHTML = html;
    
    // Add event listeners to buttons
    lowStockList.querySelectorAll('.view-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-id');
        // Navigate to inventory page and view this item
        UI.navigateTo('inventory');
        Inventory.viewItem(itemId);
      });
    });
    
    lowStockList.querySelectorAll('.update-stock').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-id');
        // Navigate to inventory page and update stock
        UI.navigateTo('inventory');
        Inventory.openStockUpdateModal(itemId);
      });
    });
  };
  
  // Public methods
  return {
    init,
    loadDashboardData
  };
})(); 