// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI
  UI.init();
  
  // Hash navigation handler
  function handleHash() {
    const hash = window.location.hash.substring(1); // Remove the # character
    if (hash && Auth.isAuthenticated()) {
      // Map hash to a page if it exists
      switch(hash) {
        case 'inventory':
        case 'orders':
        case 'expenses':
        case 'reports':
          UI.navigateTo(hash);
          break;
        default:
          UI.navigateTo('dashboard');
      }
    }
  }
  
  // Handle hash change
  window.addEventListener('hashchange', handleHash);
  
  // Handle hash on initial page load
  handleHash();
  
  // Enter key for login
  document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('login-btn').click();
    }
  });
  
  // Enter key for registration form (on last field)
  document.getElementById('reg-admin-code').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const registrationForm = document.getElementById('registration-form');
      const submitButton = registrationForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.click();
      }
    }
  });
  
  // Page Visibility API - Handle when user returns to the page
  document.addEventListener('visibilitychange', () => {
    // If user is returning to the page and is authenticated, reinitialize modules
    if (document.visibilityState === 'visible' && Auth.isAuthenticated()) {
      console.log('User returned to the page, reinitializing modules...');
      // Reinitialize all modules to restore event listeners
      UI.initializeModules();
    }
  });
  
  // Test auth connection
  const testAuthBtn = document.getElementById('test-auth-btn');
  if (testAuthBtn) {
    testAuthBtn.addEventListener('click', async () => {
      const testResult = document.getElementById('test-result');
      testResult.textContent = 'Testing connection...';
      testResult.style.color = '#666';
      
      try {
        const result = await Auth.testAuth();
        if (result.success) {
          testResult.textContent = 'Connection successful! Server is responding.';
          testResult.style.color = 'green';
        } else {
          testResult.textContent = `Test failed: ${result.message}`;
          testResult.style.color = 'red';
        }
      } catch (error) {
        testResult.textContent = `Error: ${error.message}`;
        testResult.style.color = 'red';
      }
    });
  }
  
  // Initialize event listeners for modal close
  const closeButtons = document.querySelectorAll('.modal-close');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Find the closest modal parent
      const modal = button.closest('.modal');
      if (modal) {
        modal.classList.add('hidden');
        document.getElementById('modal-overlay').classList.add('hidden');
      }
    });
  });
}); 