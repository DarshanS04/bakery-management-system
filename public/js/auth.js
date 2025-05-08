// Authentication Module
const Auth = (() => {
  // Private variables and functions
  const TOKEN_KEY = 'bakery_auth_token';
  const USER_KEY = 'bakery_user';
  
  // Save authentication data
  const setAuth = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem(TOKEN_KEY);
  };
  
  // Get current user
  const getUser = () => {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  };
  
  // Get auth token
  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };
  
  // Clear authentication data
  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };
  
  // Public methods
  return {
    // Test auth connection
    testAuth: async () => {
      try {
        console.log('Testing auth connection...');
        
        const response = await fetch('/api/test-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: 'testuser', password: 'testpass' }),
          credentials: 'include'
        }).catch(error => {
          console.error('Test auth fetch error:', error);
          throw new Error('Network error during test');
        });
        
        if (!response) {
          throw new Error('No response from test endpoint');
        }
        
        const data = await response.json();
        console.log('Test auth response:', data);
        
        return {
          success: true,
          data
        };
      } catch (error) {
        console.error('Test auth error:', error);
        return {
          success: false,
          message: error.message
        };
      }
    },
    
    // Login function
    login: async (username, password) => {
      try {
        console.log('Attempting login with:', { username });
        
        const response = await fetch(API_ENDPOINTS.login, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password }),
          credentials: 'include'
        }).catch(error => {
          console.error('Fetch error during login:', error);
          throw new Error('Network error. Please check your connection and try again.');
        });
        
        if (!response) {
          throw new Error('No response from server. Please try again.');
        }
        
        const data = await response.json().catch(error => {
          console.error('JSON parse error during login:', error);
          throw new Error('Error processing server response. Please try again.');
        });
        
        console.log('Login response:', { status: response.status, success: data.success });
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        
        // Save auth data
        setAuth(data.token, data.user);
        
        return {
          success: true,
          user: data.user
        };
      } catch (error) {
        console.error('Login error:', error);
        return {
          success: false,
          message: error.message || 'An unexpected error occurred'
        };
      }
    },
    
    // Logout function
    logout: async () => {
      try {
        // Call the logout API endpoint
        await fetch(API_ENDPOINTS.logout, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        // Clear local storage
        clearAuth();
        
        return { success: true };
      } catch (error) {
        clearAuth();
        return { success: true };
      }
    },
    
    // Get current user profile
    getProfile: async () => {
      try {
        if (!isAuthenticated()) {
          throw new Error('Not authenticated');
        }
        
        const response = await fetch(API_ENDPOINTS.me, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to get user profile');
        }
        
        // Update stored user data
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        
        return {
          success: true,
          user: data.user
        };
      } catch (error) {
        return {
          success: false,
          message: error.message
        };
      }
    },
    
    // Register a new user
    register: async (userData) => {
      try {
        console.log('Attempting registration with:', { 
          username: userData.username, 
          name: userData.name,
          role: userData.role || 'staff'
        });
        
        const response = await fetch(API_ENDPOINTS.register, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData),
          credentials: 'include'
        }).catch(error => {
          console.error('Fetch error during registration:', error);
          throw new Error('Network error. Please check your connection and try again.');
        });
        
        if (!response) {
          throw new Error('No response from server. Please try again.');
        }
        
        const data = await response.json().catch(error => {
          console.error('JSON parse error during registration:', error);
          throw new Error('Error processing server response. Please try again.');
        });
        
        console.log('Registration response:', { status: response.status, success: data.success });
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }
        
        // Save auth data
        setAuth(data.token, data.user);
        
        return {
          success: true,
          user: data.user
        };
      } catch (error) {
        console.error('Registration error:', error);
        return {
          success: false,
          message: error.message || 'An unexpected error occurred'
        };
      }
    },
    
    // Show registration modal - this just uses global hideModal function
    showRegistrationModal: () => {
      const modal = document.getElementById('registration-modal');
      const overlay = document.getElementById('modal-overlay');
      if (modal && overlay) {
        overlay.classList.remove('hidden');
        modal.classList.remove('hidden');
      }
      
      // Clear previous form data
      const form = document.getElementById('registration-form');
      if (form) {
        form.reset();
        const errorMsg = document.getElementById('registration-error');
        if (errorMsg) {
          errorMsg.textContent = '';
        }
      }
    },
    
    // Utility methods
    isAuthenticated,
    getUser,
    getToken
  };
})(); 