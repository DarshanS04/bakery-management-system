// Orders Module
const Orders = (() => {
  // Cache DOM elements
  const ordersList = document.getElementById('orders-list');
  const addOrderBtn = document.getElementById('add-order-btn');
  const orderForm = document.getElementById('order-form');
  const orderModal = document.getElementById('order-modal');
  const orderModalTitle = document.getElementById('order-modal-title');
  const orderItemsContainer = document.getElementById('order-items-container');
  const addOrderItemBtn = document.getElementById('add-order-item');
  const orderTotalItems = document.getElementById('order-total-items');
  const orderTotalAmount = document.getElementById('order-total-amount');
  const searchInput = document.getElementById('orders-search');
  const statusFilter = document.getElementById('orders-status-filter');
  const dateFilter = document.getElementById('orders-date-filter');
  const toggleOptions = document.querySelectorAll('.toggle-option');
  
  // Order form elements
  const orderIdInput = document.getElementById('order-id');
  const customerNameInput = document.getElementById('customer-name');
  const customerPhoneInput = document.getElementById('customer-phone');
  const customerAddressInput = document.getElementById('customer-address');
  const deliveryDateInput = document.getElementById('delivery-date');
  const paymentMethodSelect = document.getElementById('payment-method');
  const paymentStatusSelect = document.getElementById('payment-status');
  const orderNotesInput = document.getElementById('order-notes');
  
  // Order item template
  const orderItemTemplate = document.getElementById('order-item-template');
  
  // Current orders data
  let orders = [];
  // Current items data for selection
  let items = [];
  // Current view (all/today)
  let currentView = 'all';
  
  // Initialize orders module
  const init = () => {
    loadOrders();
    loadItems();
    setupEventListeners();
  };
  
  // Set up event listeners
  const setupEventListeners = () => {
    // Add order button
    addOrderBtn.addEventListener('click', openAddOrderModal);
    
    // Order form submission
    orderForm.addEventListener('submit', handleOrderFormSubmit);
    
    // Add order item button
    addOrderItemBtn.addEventListener('click', addOrderItemField);
    
    // Search input
    searchInput.addEventListener('input', Utils.debounce(filterOrders, 300));
    
    // Status filter
    statusFilter.addEventListener('change', filterOrders);
    
    // Date filter
    dateFilter.addEventListener('change', filterOrders);
    
    // Toggle options (All/Today's Orders)
    toggleOptions.forEach(option => {
      option.addEventListener('click', () => {
        const view = option.getAttribute('data-view');
        setCurrentView(view);
      });
    });
  };
  
  // Load all orders
  const loadOrders = async () => {
    try {
      Utils.showLoading('orders-list');
      
      // Prepare API URL with query parameters
      let url = API_ENDPOINTS.orders;
      
      // Add today filter if needed
      if (currentView === 'today') {
        url += '?today=true';
      }
      
      const result = await Utils.fetchApi(url);
      
      if (result.success) {
        orders = result.data.data;
        renderOrders(orders);
      } else {
        Utils.showAlert('Error', 'Failed to load orders');
      }
    } catch (error) {
      console.error('Orders error:', error);
      Utils.showAlert('Error', 'Failed to load orders');
    }
  };
  
  // Load items for selection in order form
  const loadItems = async () => {
    try {
      const result = await Utils.fetchApi(API_ENDPOINTS.items);
      
      if (result.success) {
        items = result.data.data;
      } else {
        console.error('Failed to load items');
      }
    } catch (error) {
      console.error('Items error:', error);
    }
  };
  
  // Render orders to the orders list
  const renderOrders = (ordersToRender) => {
    if (!ordersToRender || ordersToRender.length === 0) {
      ordersList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-shopping-cart"></i>
          <p>No orders found</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    ordersToRender.forEach(order => {
      // Determine status class
      let statusClass = '';
      switch (order.status) {
        case 'Pending': 
          statusClass = 'pending'; 
          break;
        case 'Processing': 
          statusClass = 'processing'; 
          break;
        case 'Delivered': 
          statusClass = 'delivered'; 
          break;
        case 'Cancelled': 
          statusClass = 'cancelled'; 
          break;
      }
      
      html += `
        <div class="data-card ${statusClass}" data-id="${order._id}">
          <div class="data-card-header">
            <div class="data-card-title">${order.orderNumber}</div>
            <span class="data-badge badge-${order.status.toLowerCase()}">${order.status}</span>
          </div>
          
          <div class="data-card-detail">Customer: ${order.customer.name}</div>
          <div class="data-card-detail">Items: ${order.items.length}</div>
          <div class="data-card-detail">Amount: ${Utils.formatCurrency(order.totalAmount)}</div>
          <div class="data-card-detail">Payment: ${order.paymentStatus} (${order.paymentMethod})</div>
          <div class="data-card-detail">Date: ${Utils.formatDate(order.orderDate)}</div>
          
          <div class="data-card-actions">
            <button class="btn-icon view-order" data-id="${order._id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon edit-order" data-id="${order._id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-order" data-id="${order._id}">
              <i class="fas fa-trash"></i>
            </button>
            <button class="btn-icon update-status" data-id="${order._id}">
              <i class="fas fa-check-circle"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    ordersList.innerHTML = html;
    
    // Add event listeners to buttons
    ordersList.querySelectorAll('.view-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-id');
        viewOrder(orderId);
      });
    });
    
    ordersList.querySelectorAll('.edit-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-id');
        openEditOrderModal(orderId);
      });
    });
    
    ordersList.querySelectorAll('.delete-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-id');
        confirmDeleteOrder(orderId);
      });
    });
    
    ordersList.querySelectorAll('.update-status').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-id');
        openUpdateStatusModal(orderId);
      });
    });
  };
  
  // Filter orders based on search, status, and date
  const filterOrders = () => {
    const searchQuery = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const dateValue = dateFilter.value;
    
    const filteredOrders = orders.filter(order => {
      // Filter by search query (order number or customer name)
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchQuery) ||
        order.customer.name.toLowerCase().includes(searchQuery);
      
      // Filter by status
      const matchesStatus = !statusValue || order.status === statusValue;
      
      // Filter by date
      let matchesDate = true;
      if (dateValue) {
        const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
        matchesDate = orderDate === dateValue;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    renderOrders(filteredOrders);
  };
  
  // Set current view (all/today)
  const setCurrentView = (view) => {
    currentView = view;
    
    // Update active toggle
    toggleOptions.forEach(option => {
      if (option.getAttribute('data-view') === view) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
    
    // Reload orders with the new view
    loadOrders();
  };
  
  // Open add order modal
  const openAddOrderModal = () => {
    // Reset form
    orderForm.reset();
    orderIdInput.value = '';
    orderItemsContainer.innerHTML = '';
    
    // Set today's date as default for delivery date
    deliveryDateInput.min = Utils.getTodayDate();
    deliveryDateInput.value = Utils.getTodayDate();
    
    // Add one empty order item field
    addOrderItemField();
    
    // Reset totals
    updateOrderTotals();
    
    // Update modal title
    orderModalTitle.textContent = 'Create New Order';
    
    // Show modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    orderModal.classList.remove('hidden');
  };
  
  // Open edit order modal
  const openEditOrderModal = (orderId) => {
    // Find the order
    const order = orders.find(o => o._id === orderId);
    
    if (!order) {
      Utils.showAlert('Error', 'Order not found');
      return;
    }
    
    // Fill form with order data
    orderIdInput.value = order._id;
    customerNameInput.value = order.customer.name;
    customerPhoneInput.value = order.customer.phone || '';
    customerAddressInput.value = order.customer.address || '';
    
    // Set delivery date
    if (order.deliveryDate) {
      const deliveryDate = new Date(order.deliveryDate).toISOString().split('T')[0];
      deliveryDateInput.value = deliveryDate;
    } else {
      deliveryDateInput.value = '';
    }
    
    paymentMethodSelect.value = order.paymentMethod;
    paymentStatusSelect.value = order.paymentStatus;
    orderNotesInput.value = order.notes || '';
    
    // Clear existing order items
    orderItemsContainer.innerHTML = '';
    
    // Add order items
    order.items.forEach(item => {
      addOrderItemField(item);
    });
    
    // Update totals
    updateOrderTotals();
    
    // Update modal title
    orderModalTitle.textContent = 'Edit Order';
    
    // Show modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    orderModal.classList.remove('hidden');
  };
  
  // Open update status modal
  const openUpdateStatusModal = (orderId) => {
    // Find the order
    const order = orders.find(o => o._id === orderId);
    
    if (!order) {
      Utils.showAlert('Error', 'Order not found');
      return;
    }
    
    // Ask for new status
    const newStatus = prompt(
      `Update status for Order ${order.orderNumber}\nCurrent status: ${order.status}\n\nSelect new status:\n- Pending\n- Processing\n- Delivered\n- Cancelled`
    );
    
    if (!newStatus) {
      return; // User cancelled
    }
    
    // Validate status
    const validStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(newStatus)) {
      Utils.showAlert('Error', 'Invalid status. Please choose from the provided options.');
      return;
    }
    
    // Update status
    updateOrderStatus(orderId, newStatus);
  };
  
  // Add order item field
  const addOrderItemField = (itemData = null) => {
    // Clone template
    const template = orderItemTemplate.content.cloneNode(true);
    const orderItem = template.querySelector('.order-item');
    
    // Get form elements
    const selectElement = orderItem.querySelector('.order-item-select');
    const quantityInput = orderItem.querySelector('.order-item-quantity');
    const priceInput = orderItem.querySelector('.order-item-price');
    const subtotalInput = orderItem.querySelector('.order-item-subtotal');
    const removeButton = orderItem.querySelector('.remove-order-item');
    
    // Populate item options
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item._id;
      option.textContent = `${item.name} (${Utils.formatCurrency(item.price)})`;
      option.dataset.price = item.price;
      selectElement.appendChild(option);
    });
    
    // Fill item data if provided
    if (itemData) {
      selectElement.value = itemData.item;
      quantityInput.value = itemData.quantity;
      priceInput.value = itemData.price;
      subtotalInput.value = itemData.subtotal;
    }
    
    // Item selection change event
    selectElement.addEventListener('change', () => {
      const selectedOption = selectElement.options[selectElement.selectedIndex];
      const price = selectedOption.dataset.price || 0;
      
      priceInput.value = price;
      updateItemSubtotal(orderItem);
      updateOrderTotals();
    });
    
    // Quantity change event
    quantityInput.addEventListener('input', () => {
      updateItemSubtotal(orderItem);
      updateOrderTotals();
    });
    
    // Remove button event
    removeButton.addEventListener('click', () => {
      orderItem.remove();
      updateOrderTotals();
    });
    
    // Add to container
    orderItemsContainer.appendChild(orderItem);
    
    // Calculate subtotal
    updateItemSubtotal(orderItem);
    updateOrderTotals();
  };
  
  // Update item subtotal
  const updateItemSubtotal = (orderItem) => {
    const quantityInput = orderItem.querySelector('.order-item-quantity');
    const priceInput = orderItem.querySelector('.order-item-price');
    const subtotalInput = orderItem.querySelector('.order-item-subtotal');
    
    const quantity = parseInt(quantityInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    const subtotal = quantity * price;
    
    subtotalInput.value = Utils.formatCurrency(subtotal);
  };
  
  // Update order totals
  const updateOrderTotals = () => {
    const orderItems = orderItemsContainer.querySelectorAll('.order-item');
    
    // Count items
    orderTotalItems.textContent = orderItems.length;
    
    // Calculate total amount
    let totalAmount = 0;
    orderItems.forEach(item => {
      const subtotalText = item.querySelector('.order-item-subtotal').value;
      const subtotal = parseFloat(subtotalText.replace('₹', '')) || 0;
      totalAmount += subtotal;
    });
    
    orderTotalAmount.textContent = Utils.formatCurrency(totalAmount);
  };
  
  // Confirm delete order
  const confirmDeleteOrder = (orderId) => {
    // Find the order
    const order = orders.find(o => o._id === orderId);
    
    if (!order) {
      Utils.showAlert('Error', 'Order not found');
      return;
    }
    
    Utils.showConfirm(
      'Delete Order',
      `Are you sure you want to delete order ${order.orderNumber}?`,
      () => deleteOrder(orderId)
    );
  };
  
  // Handle order form submission
  const handleOrderFormSubmit = async (e) => {
    e.preventDefault();
    
    // Get customer data
    const customerData = {
      name: customerNameInput.value,
      phone: customerPhoneInput.value,
      address: customerAddressInput.value
    };
    
    // Get order items
    const orderItems = [];
    const itemElements = orderItemsContainer.querySelectorAll('.order-item');
    
    itemElements.forEach(item => {
      const selectElement = item.querySelector('.order-item-select');
      const quantityInput = item.querySelector('.order-item-quantity');
      const priceInput = item.querySelector('.order-item-price');
      
      const itemId = selectElement.value;
      const quantity = parseInt(quantityInput.value);
      const price = parseFloat(priceInput.value);
      
      // Skip empty items
      if (!itemId || !quantity) return;
      
      const subtotal = price * quantity;
      
      // Find the selected item to get its name
      const selectedItem = items.find(i => i._id === itemId);
      
      orderItems.push({
        item: itemId,
        name: selectedItem ? selectedItem.name : 'Unknown Item',
        quantity,
        price,
        subtotal
      });
    });
    
    // Calculate total amount
    const totalAmount = orderItems.reduce((total, item) => total + item.subtotal, 0);
    
    // Get other order data
    const orderData = {
      customer: customerData,
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethodSelect.value,
      paymentStatus: paymentStatusSelect.value,
      notes: orderNotesInput.value
    };
    
    // Add delivery date if provided
    if (deliveryDateInput.value) {
      orderData.deliveryDate = deliveryDateInput.value;
    }
    
    // Validate data
    if (!customerData.name) {
      Utils.showAlert('Error', 'Please enter customer name');
      return;
    }
    
    if (orderItems.length === 0) {
      Utils.showAlert('Error', 'Please add at least one item');
      return;
    }
    
    try {
      let result;
      
      if (orderIdInput.value) {
        // Update existing order
        result = await Utils.fetchApi(
          API_ENDPOINTS.orderById(orderIdInput.value),
          {
            method: 'PUT',
            body: JSON.stringify(orderData)
          }
        );
      } else {
        // Create new order
        result = await Utils.fetchApi(
          API_ENDPOINTS.orders,
          {
            method: 'POST',
            body: JSON.stringify(orderData)
          }
        );
      }
      
      if (result.success) {
        // Close modal
        Utils.hideModal('order-modal');
        
        // Reload orders
        loadOrders();
        
        // Show success message
        Utils.showAlert(
          'Success', 
          orderIdInput.value ? 'Order updated successfully' : 'Order created successfully'
        );
      } else {
        Utils.showAlert('Error', result.message);
      }
    } catch (error) {
      console.error('Order form error:', error);
      Utils.showAlert('Error', 'Failed to save order');
    }
  };
  
  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      const result = await Utils.fetchApi(
        API_ENDPOINTS.updateOrderStatus(orderId),
        {
          method: 'PATCH',
          body: JSON.stringify({ status })
        }
      );
      
      if (result.success) {
        // Reload orders
        loadOrders();
        
        // Show success message
        Utils.showAlert('Success', 'Order status updated successfully');
      } else {
        Utils.showAlert('Error', result.message);
      }
    } catch (error) {
      console.error('Status update error:', error);
      Utils.showAlert('Error', 'Failed to update order status');
    }
  };
  
  // Delete order
  const deleteOrder = async (orderId) => {
    try {
      const result = await Utils.fetchApi(
        API_ENDPOINTS.orderById(orderId),
        {
          method: 'DELETE'
        }
      );
      
      if (result.success) {
        // Reload orders
        loadOrders();
        
        // Show success message
        Utils.showAlert('Success', 'Order deleted successfully');
      } else {
        Utils.showAlert('Error', result.message);
      }
    } catch (error) {
      console.error('Delete order error:', error);
      Utils.showAlert('Error', 'Failed to delete order');
    }
  };
  
  // View order details
  const viewOrder = (orderId) => {
    // For now, just open edit modal in readonly mode
    openEditOrderModal(orderId);
  };
  
  // Public methods
  return {
    init,
    loadOrders,
    viewOrder
  };
})(); 