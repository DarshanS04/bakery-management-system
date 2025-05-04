// Utility Functions
const Utils = (() => {
  // Format currency (Indian Rupees)
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };
  
  // Format date to display format
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };
  
  // Format date and time
  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };
  
  // Get today's date in ISO format (YYYY-MM-DD)
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  // Make authenticated API request
  const fetchApi = async (url, options = {}) => {
    try {
      // Set default options
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Auth.getToken()}`
        }
      };
      
      // Merge options
      const fetchOptions = {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers
        }
      };
      
      // Make request
      const response = await fetch(url, fetchOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle unauthorized errors
      if (error.message === 'Not authorized to access this route') {
        Auth.clearAuth();
        showLoginPage();
        return { success: false, message: 'Session expired. Please login again.' };
      }
      
      return { success: false, message: error.message };
    }
  };
  
  // Show loading spinner
  const showLoading = (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    `;
  };
  
  // Show alert modal
  const showAlert = (title, message) => {
    document.getElementById('alert-modal-title').textContent = title;
    document.getElementById('alert-modal-message').textContent = message;
    
    // Show modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('alert-modal').classList.remove('hidden');
  };
  
  // Show confirm modal
  const showConfirm = (title, message, onConfirm) => {
    document.getElementById('confirm-modal-title').textContent = title;
    document.getElementById('confirm-modal-message').textContent = message;
    
    // Set confirm button action
    const confirmBtn = document.getElementById('confirm-modal-yes');
    confirmBtn.onclick = () => {
      onConfirm();
      hideModal('confirm-modal');
    };
    
    // Show modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('confirm-modal').classList.remove('hidden');
  };
  
  // Hide a modal
  const hideModal = (modalId) => {
    document.getElementById(modalId).classList.add('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');
  };
  
  // Debounce function for search inputs
  const debounce = (func, delay = 300) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };
  
  // Generate a simple order number (for demo purposes)
  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `ORD${year}${month}${day}${random}`;
  };
  
  // Return public methods
  return {
    formatCurrency,
    formatDate,
    formatDateTime,
    getTodayDate,
    fetchApi,
    showLoading,
    showAlert,
    showConfirm,
    hideModal,
    debounce,
    generateOrderNumber
  };
})(); 