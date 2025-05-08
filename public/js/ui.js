// UI Controller
const UI = (() => {
  // Cache DOM elements
  const loginPage = document.getElementById('login-page');
  const mainApp = document.getElementById('main-app');
  const loginForm = {
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    loginBtn: document.getElementById('login-btn'),
    errorMsg: document.getElementById('login-error')
  };
  const registrationForm = {
    form: document.getElementById('registration-form'),
    username: document.getElementById('reg-username'),
    name: document.getElementById('reg-name'),
    password: document.getElementById('reg-password'),
    confirmPassword: document.getElementById('reg-confirm-password'),
    adminCode: document.getElementById('reg-admin-code'),
    errorMsg: document.getElementById('registration-error')
  };
  const header = {
    pageTitle: document.getElementById('page-title'),
    userName: document.getElementById('user-name'),
    menuToggle: document.getElementById('menu-toggle'),
    logoutBtn: document.getElementById('logout-btn')
  };
  const sidebar = document.getElementById('sidebar');
  const sidebarItems = document.querySelectorAll('.sidebar-menu li');
  const contentPages = document.querySelectorAll('.content-page');
  const modalOverlay = document.getElementById('modal-overlay');
  const modals = document.querySelectorAll('.modal');
  const closeButtons = document.querySelectorAll('.modal-close');
  const showRegisterBtn = document.getElementById('show-register-btn');
  
  // Initialize UI
  const init = () => {
    // Check if user is logged in
    if (Auth.isAuthenticated()) {
      showMainApp();
      updateUserInfo();
    } else {
      showLoginPage();
    }
    
    // Add event listeners
    setupEventListeners();
  };
  
  // Setup event listeners
  const setupEventListeners = () => {
    // Login form
    loginForm.loginBtn.addEventListener('click', handleLogin);
    
    // Show registration form button
    showRegisterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showModal('registration-modal');
    });
    
    // Registration form
    if (registrationForm.form) {
      registrationForm.form.addEventListener('submit', handleRegistration);
    }
    
    // Logout button
    header.logoutBtn.addEventListener('click', handleLogout);
    
    // Menu toggle
    header.menuToggle.addEventListener('click', toggleSidebar);
    
    // Sidebar navigation
    sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        navigateTo(page);
      });
    });
    
    // "View All" buttons on dashboard
    document.querySelectorAll('.btn-link[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.getAttribute('data-page');
        window.location.hash = page; // This will trigger the hashchange event
      });
    });
    
    // Modal close buttons
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        hideModal(modal.id);
      });
    });
    
    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        hideAllModals();
      }
    });
  };
  
  // Show login page
  const showLoginPage = () => {
    mainApp.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginForm.username.focus();
  };
  
  // Show main app
  const showMainApp = () => {
    loginPage.classList.add('hidden');
    mainApp.classList.remove('hidden');
  };
  
  // Handle login
  const handleLogin = async () => {
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value.trim();
    
    // Validate input
    if (!username || !password) {
      loginForm.errorMsg.textContent = 'Please enter both username and password';
      return;
    }
    
    // Disable login button and show loading
    loginForm.loginBtn.disabled = true;
    loginForm.loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginForm.errorMsg.textContent = '';
    
    // Attempt login
    const result = await Auth.login(username, password);
    
    // Re-enable login button
    loginForm.loginBtn.disabled = false;
    loginForm.loginBtn.textContent = 'Login';
    
    if (result.success) {
      // Show main app
      showMainApp();
      updateUserInfo();
      // Initialize modules
      initializeModules();
    } else {
      // Show error
      loginForm.errorMsg.textContent = result.message;
    }
  };
  
  // Handle registration
  const handleRegistration = async (e) => {
    e.preventDefault();
    
    // Get form data
    const username = registrationForm.username.value.trim();
    const name = registrationForm.name.value.trim();
    const password = registrationForm.password.value.trim();
    const confirmPassword = registrationForm.confirmPassword.value.trim();
    const adminCode = registrationForm.adminCode.value.trim();
    
    // Validate input
    if (!username || !name || !password || !confirmPassword) {
      registrationForm.errorMsg.textContent = 'Please fill all required fields';
      return;
    }
    
    if (password !== confirmPassword) {
      registrationForm.errorMsg.textContent = 'Passwords do not match';
      return;
    }
    
    if (password.length < 6) {
      registrationForm.errorMsg.textContent = 'Password must be at least 6 characters';
      return;
    }
    
    // Prepare registration data
    const userData = {
      username,
      name,
      password
    };
    
    // Add role if admin code provided
    if (adminCode) {
      userData.role = 'admin';
      userData.adminCode = adminCode;
    }
    
    // Disable submit button and show loading
    const submitBtn = registrationForm.form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    registrationForm.errorMsg.textContent = '';
    
    // Attempt registration
    const result = await Auth.register(userData);
    
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register';
    
    if (result.success) {
      // Hide modal
      hideModal('registration-modal');
      
      // Show main app
      showMainApp();
      updateUserInfo();
      
      // Initialize modules
      initializeModules();
      
      // Show success message
      showNotification('Registration successful! Welcome to Bakery Management System.', 'success');
    } else {
      // Show error
      registrationForm.errorMsg.textContent = result.message;
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    await Auth.logout();
    showLoginPage();
  };
  
  // Update user info in the UI
  const updateUserInfo = () => {
    const user = Auth.getUser();
    if (user) {
      header.userName.textContent = user.name;
    }
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    sidebar.classList.toggle('open');
  };
  
  // Add a new method to show specific tabs
  const showTab = (tabId) => {
    // Hide all content pages
    document.querySelectorAll('.content-page').forEach(page => {
      page.classList.add('hidden');
    });
    
    // Show the requested tab
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
      tabElement.classList.remove('hidden');
      
      // Update page title
      const title = tabId.split('-').map(capitalizeFirstLetter).join(' ');
      header.pageTitle.textContent = title;
      
      // Update active state in sidebar
      document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-tab') === tabId) {
          link.classList.add('active');
        }
      });
    }
  };
  
  // Update the navigateTo method to use showTab
  const navigateTo = (page) => {
    // Update URL hash without triggering hashchange event
    const currentHash = window.location.hash.substring(1);
    if (currentHash !== page) {
      history.pushState(null, '', `#${page}`);
    }
    
    showTab(page + '-page');
    
    // Handle special case initializations
    if (page === 'inventory' && typeof Inventory !== 'undefined') {
      Inventory.refreshItemsList();
    } else if (page === 'orders' && typeof Orders !== 'undefined') {
      Orders.refreshOrdersList();
    } else if (page === 'expenses' && typeof Expenses !== 'undefined') {
      Expenses.refreshExpensesList();
    }
  };
  
  // Initialize all modules
  const initializeModules = () => {
    try {
      // Load dashboard data
      Dashboard.init();
      Inventory.init();
      Orders.init();
      Expenses.init();
      Reports.init();
    } catch (error) {
      console.error('Error initializing modules:', error);
    }
  };
  
  // Hide all modals
  const hideAllModals = () => {
    modalOverlay.classList.add('hidden');
    modals.forEach(modal => {
      modal.classList.add('hidden');
    });
  };
  
  // Hide specific modal
  const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modalOverlay.classList.add('hidden');
    }
  };
  
  // Show modal
  const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modalOverlay.classList.remove('hidden');
      modal.classList.remove('hidden');
    }
  };
  
  // Show notification
  const showNotification = (message, type = 'info') => {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.className = 'notification';
      document.body.appendChild(notification);
      
      // Add styles if not already in CSS
      const style = document.createElement('style');
      style.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px 15px;
          border-radius: 4px;
          color: white;
          font-weight: 500;
          z-index: 9999;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(-10px);
        }
        .notification.show {
          opacity: 1;
          transform: translateY(0);
        }
        .notification.success { background-color: #4caf50; }
        .notification.error { background-color: #f44336; }
        .notification.info { background-color: #2196f3; }
        .notification.warning { background-color: #ff9800; }
      `;
      document.head.appendChild(style);
    }
    
    // Set notification type and message
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };
  
  // Confirm action with a dialog
  const confirmAction = (title, message, callback) => {
    // Set confirm modal content
    document.getElementById('confirm-modal-title').textContent = title;
    document.getElementById('confirm-modal-message').textContent = message;
    
    // Show confirm modal
    showModal('confirm-modal');
    
    // Set up yes button event
    const yesBtn = document.getElementById('confirm-modal-yes');
    const existingHandler = yesBtn._clickHandler;
    
    // Remove existing handler if present
    if (existingHandler) {
      yesBtn.removeEventListener('click', existingHandler);
    }
    
    // Add new handler
    yesBtn._clickHandler = () => {
      hideModal('confirm-modal');
      callback();
    };
    
    yesBtn.addEventListener('click', yesBtn._clickHandler);
  };
  
  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  // Public methods
  return {
    init,
    showLoginPage,
    showMainApp,
    navigateTo,
    showTab,
    showModal,
    hideModal,
    hideAllModals,
    showNotification,
    initializeModules,
    confirmAction
  };
})();

// Add the hideModal function globally to fix the error
function hideModal(modalId) {
  UI.hideModal(modalId);
} 