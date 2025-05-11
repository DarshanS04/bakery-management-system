const Customer = (() => {
  // Cache DOM elements
  let customerContent;
  let customerSidebar;
  
  // Initialize customer dashboard
  const init = () => {
    console.log('Initializing customer dashboard');
    
    // Update page title
    document.getElementById('page-title').textContent = 'Customer Dashboard';
    
    // Create customer content area if not exists
    if (!document.getElementById('customer-content')) {
      const content = document.getElementById('content');
      customerContent = document.createElement('div');
      customerContent.id = 'customer-content';
      content.appendChild(customerContent);
    } else {
      customerContent = document.getElementById('customer-content');
    }
    
    // Create customer sidebar
    createCustomerSidebar();
    
    // Set up hash-based navigation
    setupHashNavigation();
    
    // Load default page or from hash
    const hash = window.location.hash.substring(1);
    if (hash && ['customer-dashboard', 'customer-orders', 'customer-neworder', 'customer-feedback', 'customer-profile'].includes(hash)) {
      navigateTo(hash);
    } else {
      navigateTo('customer-dashboard');
      history.pushState(null, '', '#customer-dashboard');
    }
  };
  
  // Create customer sidebar menu
  const createCustomerSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    
    // Clear existing sidebar content
    sidebar.innerHTML = '';
    
    // Create sidebar header
    const sidebarHeader = document.createElement('div');
    sidebarHeader.className = 'sidebar-header';
    sidebarHeader.innerHTML = `
      <img src="images/logo.png" alt="Bakery Logo" class="logo">
      <h2>Bakery Shop</h2>
    `;
    sidebar.appendChild(sidebarHeader);
    
    // Create customer navigation
    const sidebarSection = document.createElement('div');
    sidebarSection.className = 'sidebar-section';
    sidebarSection.innerHTML = `
      <h3>Customer Menu</h3>
      <ul>
        <li><a href="#customer-dashboard" class="sidebar-link" data-tab="customer-dashboard"><i class="fas fa-home"></i> Dashboard</a></li>
        <li><a href="#customer-orders" class="sidebar-link" data-tab="customer-orders"><i class="fas fa-shopping-cart"></i> My Orders</a></li>
        <li><a href="#customer-neworder" class="sidebar-link" data-tab="customer-neworder"><i class="fas fa-plus-circle"></i> New Order</a></li>
        <li><a href="#customer-feedback" class="sidebar-link" data-tab="customer-feedback"><i class="fas fa-comment"></i> Feedback</a></li>
        <li><a href="#customer-profile" class="sidebar-link" data-tab="customer-profile"><i class="fas fa-user"></i> My Profile</a></li>
      </ul>
    `;
    sidebar.appendChild(sidebarSection);
    
    // Cache the sidebar element
    customerSidebar = sidebar;
    
    // Add event listeners to sidebar links
    const sidebarLinks = sidebar.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        navigateTo(tab);
        history.pushState(null, '', `#${tab}`);
      });
    });
  };
  
  // Set up hash-based navigation
  const setupHashNavigation = () => {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.substring(1);
      if (hash && ['customer-dashboard', 'customer-orders', 'customer-neworder', 'customer-feedback', 'customer-profile'].includes(hash)) {
        navigateTo(hash);
      }
    });
  };
  
  // Navigate to specific customer tab
  const navigateTo = (tab) => {
    // Update sidebar active link
    const links = customerSidebar.querySelectorAll('.sidebar-link');
    links.forEach(link => {
      if (link.getAttribute('data-tab') === tab) {
        link.parentElement.classList.add('active');
      } else {
        link.parentElement.classList.remove('active');
      }
    });
    
    // Update page title
    const pageTitles = {
      'customer-dashboard': 'Customer Dashboard',
      'customer-orders': 'My Orders',
      'customer-neworder': 'Place New Order',
      'customer-feedback': 'Provide Feedback',
      'customer-profile': 'My Profile'
    };
    document.getElementById('page-title').textContent = pageTitles[tab];
    
    // Load the appropriate content
    loadContent(tab);
  };
  
  // Load appropriate content based on the selected tab
  const loadContent = (tab) => {
    // Clear customer content
    customerContent.innerHTML = '';
    
    // Load different content based on tab
    switch(tab) {
      case 'customer-dashboard':
        loadDashboard();
        break;
      case 'customer-orders':
        loadOrders();
        break;
      case 'customer-neworder':
        loadNewOrder();
        break;
      case 'customer-feedback':
        loadFeedback();
        break;
      case 'customer-profile':
        loadProfile();
        break;
      default:
        loadDashboard();
    }
  };
  
  // Load customer dashboard content
  const loadDashboard = () => {
    customerContent.innerHTML = `
      <div class="customer-welcome">
        <h2>Welcome, ${Auth.getUser().name}!</h2>
        <p>Manage your orders and provide feedback on your purchases.</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-info">
            <h3>Total Orders</h3>
            <p class="stat-value" id="customer-total-orders">-</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-spinner"></i>
          </div>
          <div class="stat-info">
            <h3>Active Orders</h3>
            <p class="stat-value" id="customer-active-orders">-</p>
          </div>
        </div>
      </div>
      
      <div class="recent-orders">
        <h3>Recent Orders</h3>
        <div id="recent-orders-list">
          <div class="empty-state">
            <i class="fas fa-shopping-cart"></i>
            <p>No recent orders found</p>
          </div>
        </div>
      </div>
      
      <div class="customer-actions">
        <button id="new-order-btn" class="btn btn-primary">
          <i class="fas fa-plus"></i> Place New Order
        </button>
      </div>
    `;
    
    // Add event listener to new order button
    document.getElementById('new-order-btn').addEventListener('click', () => {
      navigateTo('customer-neworder');
      history.pushState(null, '', '#customer-neworder');
    });
    
    // Fetch dashboard data
    fetchDashboardData();
  };
  
  // Load customer orders list
  const loadOrders = () => {
    customerContent.innerHTML = `
      <div class="page-actions">
        <div class="search-container">
          <input type="text" id="customer-orders-search" placeholder="Search orders...">
          <button class="btn-icon">
            <i class="fas fa-search"></i>
          </button>
        </div>
        <div class="filter-container">
          <select id="customer-orders-status-filter">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input type="date" id="customer-orders-date-filter">
        </div>
      </div>
      
      <div id="customer-orders-list">
        <div class="empty-state">
          <i class="fas fa-shopping-cart"></i>
          <p>Loading orders...</p>
        </div>
      </div>
    `;
    
    // Fetch customer orders
    fetchCustomerOrders();
  };
  
  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.customerDashboard, {
        headers: {
          'Authorization': `Bearer ${Auth.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update stats
        document.getElementById('customer-total-orders').textContent = data.data.stats.totalOrders;
        document.getElementById('customer-active-orders').textContent = data.data.stats.activeOrders;
        
        // Render recent orders
        renderRecentOrders(data.data.recentOrders);
      } else {
        UI.showNotification(data.message || 'Failed to load dashboard data', 'error');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      UI.showNotification('Failed to load dashboard data. Please try again later.', 'error');
    }
  };
  
  // Render recent orders in dashboard
  const renderRecentOrders = (orders) => {
    const recentOrdersList = document.getElementById('recent-orders-list');
    
    if (!orders || orders.length === 0) {
      recentOrdersList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-shopping-cart"></i>
          <p>No recent orders found</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    orders.forEach(order => {
      html += `
        <div class="data-card ${order.status.toLowerCase()}">
          <div class="data-card-header">
            <div class="data-card-title">${order.orderNumber}</div>
            <span class="data-badge badge-${order.status.toLowerCase()}">${order.status}</span>
          </div>
          <div class="data-card-detail">Amount: ${Utils.formatCurrency(order.totalAmount)}</div>
          <div class="data-card-detail">Date: ${Utils.formatDate(order.orderDate)}</div>
          <div class="data-card-actions">
            <button class="btn-link view-order" data-id="${order._id}">View Details</button>
          </div>
        </div>
      `;
    });
    
    recentOrdersList.innerHTML = html;
    
    // Add event listeners to view buttons
    recentOrdersList.querySelectorAll('.view-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-id');
        // TODO: Implement order details view
        UI.showNotification('Order details view will be implemented soon', 'info');
      });
    });
  };
  
  // Load new order form
  const loadNewOrder = () => {
    customerContent.innerHTML = `
      <div class="page-actions">
        <h3>Place New Order</h3>
        <p>Browse our products and add them to your order.</p>
      </div>
      
      <div id="available-items" class="inventory-grid">
        <div class="empty-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading products...</p>
        </div>
      </div>
      
      <div id="order-summary" class="order-summary" style="display: none;">
        <h3>Order Summary</h3>
        <div id="selected-items"></div>
        <div class="summary-row">
          <span>Total:</span>
          <span id="order-total">₹0.00</span>
        </div>
        <div class="form-group">
          <label for="order-notes">Order Notes</label>
          <textarea id="order-notes" rows="3" placeholder="Any special instructions for your order?"></textarea>
        </div>
        <button id="place-order-btn" class="btn btn-primary">Place Order</button>
      </div>
    `;
    
    // Load available items
    loadAvailableItems();
    
    // Add event listener for place order button
    document.getElementById('place-order-btn').addEventListener('click', placeOrder);
  };
  
  // Load available items for ordering
  const loadAvailableItems = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.items, {
        headers: {
          'Authorization': `Bearer ${Auth.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        renderAvailableItems(data.data.filter(item => 
          // Only show items that are not ingredients and have stock
          item.category !== 'Ingredient' && item.stockQuantity > 0
        ));
      } else {
        document.getElementById('available-items').innerHTML = `
          <div class="empty-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>Failed to load products</p>
          </div>
        `;
        UI.showNotification(data.message || 'Failed to load products', 'error');
      }
    } catch (error) {
      console.error('Error loading available items:', error);
      document.getElementById('available-items').innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load products</p>
        </div>
      `;
    }
  };
  
  // Render available items
  const renderAvailableItems = (items) => {
    const itemsContainer = document.getElementById('available-items');
    
    if (!items || items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>No products available</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    items.forEach(item => {
      html += `
        <div class="inventory-card">
          <div class="inventory-card-header">
            <h3 class="inventory-card-title">${item.name}</h3>
            <span class="inventory-card-category">${item.category}</span>
          </div>
          <div class="inventory-card-info">
            <div class="info-item">
              <span class="info-label">Price</span>
              <span class="info-value">${Utils.formatCurrency(item.price)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Available</span>
              <span class="info-value">${item.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
            </div>
          </div>
          <div class="inventory-card-actions">
            <button class="btn btn-primary add-to-order" data-id="${item._id}" data-name="${item.name}" data-price="${item.price}" ${item.stockQuantity < 1 ? 'disabled' : ''}>
              Add to Order
            </button>
          </div>
        </div>
      `;
    });
    
    itemsContainer.innerHTML = html;
    
    // Show order summary
    document.getElementById('order-summary').style.display = 'block';
    
    // Add event listeners to add buttons
    itemsContainer.querySelectorAll('.add-to-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const price = parseFloat(btn.getAttribute('data-price'));
        
        addItemToOrder(id, name, price);
      });
    });
  };
  
  // Selected items for the order
  let selectedItems = [];
  
  // Add item to order
  const addItemToOrder = (id, name, price) => {
    // Check if item already in order, if so increment quantity
    const existingItem = selectedItems.find(item => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
      selectedItems.push({
        id,
        name,
        price,
        quantity: 1,
        subtotal: price
      });
    }
    
    // Update order summary
    updateOrderSummary();
    
    // Show notification
    UI.showNotification(`Added ${name} to your order`, 'success');
  };
  
  // Update order summary
  const updateOrderSummary = () => {
    const selectedItemsContainer = document.getElementById('selected-items');
    const orderTotal = document.getElementById('order-total');
    
    if (selectedItems.length === 0) {
      selectedItemsContainer.innerHTML = `
        <div class="empty-state" style="padding: 1rem;">
          <p>No items added to your order yet</p>
        </div>
      `;
      orderTotal.textContent = Utils.formatCurrency(0);
      return;
    }
    
    let html = '';
    let total = 0;
    
    selectedItems.forEach((item, index) => {
      html += `
        <div class="order-item-row">
          <div class="order-item-detail">
            <strong>${item.name}</strong>
            <div>
              <span>${Utils.formatCurrency(item.price)} × ${item.quantity}</span>
              <span style="float: right;">${Utils.formatCurrency(item.subtotal)}</span>
            </div>
          </div>
          <div class="order-item-actions">
            <button class="btn-icon decrease-item" data-index="${index}">
              <i class="fas fa-minus-circle"></i>
            </button>
            <button class="btn-icon increase-item" data-index="${index}">
              <i class="fas fa-plus-circle"></i>
            </button>
            <button class="btn-icon remove-item" data-index="${index}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      
      total += item.subtotal;
    });
    
    selectedItemsContainer.innerHTML = html;
    orderTotal.textContent = Utils.formatCurrency(total);
    
    // Add event listeners for quantity buttons
    selectedItemsContainer.querySelectorAll('.increase-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        selectedItems[index].quantity += 1;
        selectedItems[index].subtotal = selectedItems[index].quantity * selectedItems[index].price;
        updateOrderSummary();
      });
    });
    
    selectedItemsContainer.querySelectorAll('.decrease-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        if (selectedItems[index].quantity > 1) {
          selectedItems[index].quantity -= 1;
          selectedItems[index].subtotal = selectedItems[index].quantity * selectedItems[index].price;
          updateOrderSummary();
        }
      });
    });
    
    selectedItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        selectedItems.splice(index, 1);
        updateOrderSummary();
      });
    });
  };
  
  // Place order
  const placeOrder = async () => {
    try {
      if (selectedItems.length === 0) {
        UI.showNotification('Please add items to your order', 'error');
        return;
      }
      
      // Validate quantities
      for (const item of selectedItems) {
        if (item.quantity < 1) {
          UI.showNotification(`Invalid quantity for ${item.name}`, 'error');
          return;
        }
      }
      
      const orderData = {
        items: selectedItems.map(item => ({
          item: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        notes: document.getElementById('order-notes').value || ''
      };
      
      console.log('Sending order data:', orderData);
      
      const response = await fetch(API_ENDPOINTS.customerOrders, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Auth.getToken()}`
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Clear order items
        selectedItems = [];
        updateOrderSummary();
        
        // Show success message
        UI.showNotification('Order placed successfully!', 'success');
        
        // Reload recent orders
        fetchDashboardData();
        
        // Clear notes
        document.getElementById('order-notes').value = '';
        
        // Navigate to orders page
        setTimeout(() => {
          navigateTo('customer-orders');
          history.pushState(null, '', '#customer-orders');
        }, 1500);
      } else {
        UI.showNotification(data.message || 'Failed to place order', 'error');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      UI.showNotification('Failed to place order. Please try again.', 'error');
    }
  };
  
  const loadFeedback = () => {
    customerContent.innerHTML = `
      <div class="form-section">
        <h3>Provide Feedback</h3>
        <p>Select an order to provide feedback on.</p>
        
        <div id="feedback-orders-list">
          <div class="empty-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
      
      <div id="feedback-form" style="display: none;">
        <div class="form-section">
          <h3>Your Feedback</h3>
          <div class="form-group">
            <label>Order</label>
            <input type="text" id="feedback-order-number" readonly>
            <input type="hidden" id="feedback-order-id">
          </div>
          <div class="form-group">
            <label>Rating</label>
            <div class="rating-container">
              <div class="rating">
                <input type="radio" id="star5" name="rating" value="5">
                <label for="star5" title="5 stars"></label>
                <input type="radio" id="star4" name="rating" value="4">
                <label for="star4" title="4 stars"></label>
                <input type="radio" id="star3" name="rating" value="3">
                <label for="star3" title="3 stars"></label>
                <input type="radio" id="star2" name="rating" value="2">
                <label for="star2" title="2 stars"></label>
                <input type="radio" id="star1" name="rating" value="1">
                <label for="star1" title="1 star"></label>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label for="feedback-comment">Comments</label>
            <textarea id="feedback-comment" rows="4" placeholder="Share your experience with this order..."></textarea>
          </div>
          <div class="form-actions">
            <button id="submit-feedback-btn" class="btn btn-primary">Submit Feedback</button>
            <button id="cancel-feedback-btn" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    // Load customer orders for feedback
    loadOrdersForFeedback();
    
    // Add event listeners
    document.getElementById('cancel-feedback-btn').addEventListener('click', () => {
      document.getElementById('feedback-form').style.display = 'none';
      document.getElementById('feedback-orders-list').style.display = 'block';
    });
    
    document.getElementById('submit-feedback-btn').addEventListener('click', submitFeedbackForm);
  };
  
  // Load orders for feedback
  const loadOrdersForFeedback = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.customerOrders, {
        headers: {
          'Authorization': `Bearer ${Auth.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Filter for delivered orders without feedback
        const feedbackEligibleOrders = data.data.filter(order => 
          order.status === 'Delivered' && !order.feedback
        );
        
        renderOrdersForFeedback(feedbackEligibleOrders);
      } else {
        document.getElementById('feedback-orders-list').innerHTML = `
          <div class="empty-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>Failed to load orders</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading orders for feedback:', error);
      document.getElementById('feedback-orders-list').innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load orders</p>
        </div>
      `;
    }
  };
  
  // Render orders eligible for feedback
  const renderOrdersForFeedback = (orders) => {
    const container = document.getElementById('feedback-orders-list');
    
    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-info-circle"></i>
          <p>No orders eligible for feedback</p>
          <p class="form-hint">You can provide feedback for delivered orders that haven't been rated yet.</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    orders.forEach(order => {
      html += `
        <div class="data-card delivered">
          <div class="data-card-header">
            <div class="data-card-title">${order.orderNumber}</div>
            <span class="data-badge badge-delivered">Delivered</span>
          </div>
          <div class="data-card-detail">Amount: ${Utils.formatCurrency(order.totalAmount)}</div>
          <div class="data-card-detail">Date: ${Utils.formatDate(order.orderDate)}</div>
          <div class="data-card-actions">
            <button class="btn-link give-feedback" data-id="${order._id}" data-number="${order.orderNumber}">
              Give Feedback
            </button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    // Add event listeners to feedback buttons
    container.querySelectorAll('.give-feedback').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-id');
        const orderNumber = btn.getAttribute('data-number');
        
        // Set order details in feedback form
        document.getElementById('feedback-order-id').value = orderId;
        document.getElementById('feedback-order-number').value = orderNumber;
        
        // Show feedback form, hide orders list
        document.getElementById('feedback-orders-list').style.display = 'none';
        document.getElementById('feedback-form').style.display = 'block';
      });
    });
  };
  
  // Submit feedback form
  const submitFeedbackForm = async () => {
    const orderId = document.getElementById('feedback-order-id').value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const comment = document.getElementById('feedback-comment').value;
    
    if (!rating) {
      UI.showNotification('Please select a rating', 'error');
      return;
    }
    
    try {
      const response = await fetch(API_ENDPOINTS.customerFeedback, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Auth.getToken()}`
        },
        body: JSON.stringify({
          orderId,
          rating: parseInt(rating),
          comment
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        UI.showNotification('Thank you for your feedback!', 'success');
        
        // Reset and hide feedback form
        document.getElementById('feedback-form').style.display = 'none';
        document.getElementById('feedback-comment').value = '';
        document.querySelectorAll('input[name="rating"]').forEach(input => {
          input.checked = false;
        });
        
        // Reload orders for feedback
        loadOrdersForFeedback();
        document.getElementById('feedback-orders-list').style.display = 'block';
      } else {
        UI.showNotification(data.message || 'Failed to submit feedback', 'error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      UI.showNotification('Failed to submit feedback. Please try again later.', 'error');
    }
  };
  
  const loadProfile = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.customerProfile, {
        headers: {
          'Authorization': `Bearer ${Auth.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        displayProfileData(data.data);
      } else {
        // Fallback to stored user data if API fails
        displayProfileData(Auth.getUser());
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to stored user data if API fails
      displayProfileData(Auth.getUser());
    }
  };
  
  const displayProfileData = (user) => {
    customerContent.innerHTML = `
      <div class="form-section">
        <h3>My Profile</h3>
        <form id="profile-form">
          <div class="form-group">
            <label>Username</label>
            <input type="text" value="${user.username}" readonly>
          </div>
          <div class="form-group">
            <label for="profile-name">Full Name</label>
            <input type="text" id="profile-name" value="${user.name}">
          </div>
          <div class="form-group">
            <label for="profile-email">Email</label>
            <input type="email" id="profile-email" value="${user.email || ''}">
          </div>
          <div class="form-group">
            <label for="profile-phone">Phone</label>
            <input type="tel" id="profile-phone" value="${user.phone || ''}">
          </div>
          <div class="form-group">
            <label for="profile-address">Address</label>
            <textarea id="profile-address" rows="3">${user.address || ''}</textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Update Profile</button>
          </div>
        </form>
      </div>
    `;
    
    // Add event listener for profile form submission
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
  };
  
  const updateProfile = async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    const phone = document.getElementById('profile-phone').value;
    const address = document.getElementById('profile-address').value;
    
    if (!name) {
      UI.showNotification('Name is required', 'error');
      return;
    }
    
    try {
      const response = await fetch(API_ENDPOINTS.customerProfile, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Auth.getToken()}`
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          address
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update stored user data in localStorage directly
        const token = Auth.getToken();
        const updatedUser = data.data; // Use the user data returned from the server
        
        // Update localStorage directly
        localStorage.setItem('bakery_user', JSON.stringify(updatedUser));
        
        // Update user name in header
        document.getElementById('user-name').textContent = name;
        
        UI.showNotification('Profile updated successfully', 'success');
      } else {
        UI.showNotification(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      UI.showNotification('Failed to update profile. Please try again later.', 'error');
    }
  };
  
  // Fetch customer orders from API
  const fetchCustomerOrders = async () => {
    try {
      // Call the API to fetch customer orders
      const response = await fetch(API_ENDPOINTS.customerOrders, {
        headers: {
          'Authorization': `Bearer ${Auth.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        renderCustomerOrders(data.data);
      } else {
        document.getElementById('customer-orders-list').innerHTML = `
          <div class="empty-state">
            <i class="fas fa-shopping-cart"></i>
            <p>No orders found</p>
          </div>
        `;
        UI.showNotification(data.message || 'Failed to load orders', 'error');
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      UI.showNotification('Failed to load orders. Please try again later.', 'error');
      
      document.getElementById('customer-orders-list').innerHTML = `
        <div class="empty-state">
          <i class="fas fa-shopping-cart"></i>
          <p>No orders found</p>
        </div>
      `;
    }
  };
  
  // Render customer orders
  const renderCustomerOrders = (orders) => {
    const ordersList = document.getElementById('customer-orders-list');
    
    if (!orders || orders.length === 0) {
      ordersList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-shopping-cart"></i>
          <p>No orders found</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    orders.forEach(order => {
      html += `
        <div class="data-card ${order.status.toLowerCase()}">
          <div class="data-card-header">
            <div class="data-card-title">${order.orderNumber}</div>
            <span class="data-badge badge-${order.status.toLowerCase()}">${order.status}</span>
          </div>
          <div class="data-card-detail">Amount: ${Utils.formatCurrency(order.totalAmount)}</div>
          <div class="data-card-detail">Date: ${Utils.formatDate(order.orderDate)}</div>
          <div class="data-card-actions">
            <button class="btn-link view-order-details" data-id="${order._id}">View Details</button>
          </div>
        </div>
      `;
    });
    
    ordersList.innerHTML = html;
    
    // Add event listeners for view details buttons
    ordersList.querySelectorAll('.view-order-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-id');
        viewOrderDetails(orderId);
      });
    });
  };
  
  // View order details
  const viewOrderDetails = (orderId) => {
    // Implement order details view
    UI.showNotification('Order details view will be implemented soon', 'info');
  };
  
  // Return public methods and properties
  return {
    init,
    navigateTo
  };
})();