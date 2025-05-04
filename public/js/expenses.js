// Expenses Module
const Expenses = (() => {
  // Cache DOM elements
  const expensesList = document.getElementById('expenses-list');
  const addExpenseBtn = document.getElementById('add-expense-btn');
  const expenseForm = document.getElementById('expense-form');
  const expenseModal = document.getElementById('expense-modal');
  const expenseModalTitle = document.getElementById('expense-modal-title');
  const searchInput = document.getElementById('expenses-search');
  const categoryFilter = document.getElementById('expenses-category-filter');
  const dateFilter = document.getElementById('expenses-date-filter');
  const toggleOptions = document.querySelectorAll('.toggle-option');
  
  // Expense form elements
  const expenseIdInput = document.getElementById('expense-id');
  const expenseTitleInput = document.getElementById('expense-title');
  const expenseAmountInput = document.getElementById('expense-amount');
  const expenseDateInput = document.getElementById('expense-date');
  const expenseCategorySelect = document.getElementById('expense-category');
  const expensePaymentSelect = document.getElementById('expense-payment');
  const expensePaidToInput = document.getElementById('expense-paid-to');
  const expenseDescriptionInput = document.getElementById('expense-description');
  
  // Current expenses data
  let expenses = [];
  // Current view (all/today)
  let currentView = 'all';
  
  // Initialize expenses module
  const init = () => {
    loadExpenses();
    setupEventListeners();
  };
  
  // Set up event listeners
  const setupEventListeners = () => {
    // Add expense button
    addExpenseBtn.addEventListener('click', openAddExpenseModal);
    
    // Expense form submission
    expenseForm.addEventListener('submit', handleExpenseFormSubmit);
    
    // Search input
    searchInput.addEventListener('input', Utils.debounce(filterExpenses, 300));
    
    // Category filter
    categoryFilter.addEventListener('change', filterExpenses);
    
    // Date filter
    dateFilter.addEventListener('change', filterExpenses);
    
    // Toggle options (All/Today's Expenses)
    toggleOptions.forEach(option => {
      option.addEventListener('click', () => {
        const view = option.getAttribute('data-view');
        setCurrentView(view);
      });
    });
  };
  
  // Load all expenses
  const loadExpenses = async () => {
    try {
      Utils.showLoading('expenses-list');
      
      // Prepare API URL with query parameters
      let url = API_ENDPOINTS.expenses;
      
      // Add today filter if needed
      if (currentView === 'today') {
        url += '?today=true';
      }
      
      const result = await Utils.fetchApi(url);
      
      if (result.success) {
        expenses = result.data.data;
        renderExpenses(expenses);
      } else {
        Utils.showAlert('Error', 'Failed to load expenses');
      }
    } catch (error) {
      console.error('Expenses error:', error);
      Utils.showAlert('Error', 'Failed to load expenses');
    }
  };
  
  // Render expenses to the expenses list
  const renderExpenses = (expensesToRender) => {
    if (!expensesToRender || expensesToRender.length === 0) {
      expensesList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-money-bill-wave"></i>
          <p>No expenses found</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    expensesToRender.forEach(expense => {
      html += `
        <div class="data-card" data-id="${expense._id}">
          <div class="data-card-header">
            <div class="data-card-title">${expense.title}</div>
            <span class="data-badge">${expense.category}</span>
          </div>
          
          <div class="data-card-detail">Amount: ${Utils.formatCurrency(expense.amount)}</div>
          <div class="data-card-detail">Date: ${Utils.formatDate(expense.date)}</div>
          <div class="data-card-detail">Payment: ${expense.paymentMethod}</div>
          ${expense.paidTo ? `<div class="data-card-detail">Paid to: ${expense.paidTo}</div>` : ''}
          
          <div class="data-card-actions">
            <button class="btn-icon edit-expense" data-id="${expense._id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-expense" data-id="${expense._id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    expensesList.innerHTML = html;
    
    // Add event listeners to buttons
    expensesList.querySelectorAll('.edit-expense').forEach(btn => {
      btn.addEventListener('click', () => {
        const expenseId = btn.getAttribute('data-id');
        openEditExpenseModal(expenseId);
      });
    });
    
    expensesList.querySelectorAll('.delete-expense').forEach(btn => {
      btn.addEventListener('click', () => {
        const expenseId = btn.getAttribute('data-id');
        confirmDeleteExpense(expenseId);
      });
    });
  };
  
  // Filter expenses based on search, category, and date
  const filterExpenses = () => {
    const searchQuery = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;
    const dateValue = dateFilter.value;
    
    const filteredExpenses = expenses.filter(expense => {
      // Filter by search query (title or paid to)
      const matchesSearch = 
        expense.title.toLowerCase().includes(searchQuery) ||
        (expense.paidTo && expense.paidTo.toLowerCase().includes(searchQuery));
      
      // Filter by category
      const matchesCategory = !categoryValue || expense.category === categoryValue;
      
      // Filter by date
      let matchesDate = true;
      if (dateValue) {
        const expenseDate = new Date(expense.date).toISOString().split('T')[0];
        matchesDate = expenseDate === dateValue;
      }
      
      return matchesSearch && matchesCategory && matchesDate;
    });
    
    renderExpenses(filteredExpenses);
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
    
    // Reload expenses with the new view
    loadExpenses();
  };
  
  // Open add expense modal
  const openAddExpenseModal = () => {
    // Reset form
    expenseForm.reset();
    expenseIdInput.value = '';
    
    // Set today's date as default
    expenseDateInput.value = Utils.getTodayDate();
    
    // Update modal title
    expenseModalTitle.textContent = 'Add New Expense';
    
    // Show modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    expenseModal.classList.remove('hidden');
  };
  
  // Open edit expense modal
  const openEditExpenseModal = (expenseId) => {
    // Find the expense
    const expense = expenses.find(e => e._id === expenseId);
    
    if (!expense) {
      Utils.showAlert('Error', 'Expense not found');
      return;
    }
    
    // Fill form with expense data
    expenseIdInput.value = expense._id;
    expenseTitleInput.value = expense.title;
    expenseAmountInput.value = expense.amount;
    
    // Set date (format: YYYY-MM-DD)
    const expenseDate = new Date(expense.date).toISOString().split('T')[0];
    expenseDateInput.value = expenseDate;
    
    expenseCategorySelect.value = expense.category;
    expensePaymentSelect.value = expense.paymentMethod;
    expensePaidToInput.value = expense.paidTo || '';
    expenseDescriptionInput.value = expense.description || '';
    
    // Update modal title
    expenseModalTitle.textContent = 'Edit Expense';
    
    // Show modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    expenseModal.classList.remove('hidden');
  };
  
  // Confirm delete expense
  const confirmDeleteExpense = (expenseId) => {
    // Find the expense
    const expense = expenses.find(e => e._id === expenseId);
    
    if (!expense) {
      Utils.showAlert('Error', 'Expense not found');
      return;
    }
    
    Utils.showConfirm(
      'Delete Expense',
      `Are you sure you want to delete the expense "${expense.title}"?`,
      () => deleteExpense(expenseId)
    );
  };
  
  // Handle expense form submission
  const handleExpenseFormSubmit = async (e) => {
    e.preventDefault();
    
    // Get expense data
    const expenseData = {
      title: expenseTitleInput.value,
      amount: parseFloat(expenseAmountInput.value),
      date: expenseDateInput.value,
      category: expenseCategorySelect.value,
      paymentMethod: expensePaymentSelect.value,
      paidTo: expensePaidToInput.value,
      description: expenseDescriptionInput.value
    };
    
    // Validate data
    if (!expenseData.title || !expenseData.amount || !expenseData.category) {
      Utils.showAlert('Error', 'Please fill all required fields');
      return;
    }
    
    try {
      let result;
      
      if (expenseIdInput.value) {
        // Update existing expense
        result = await Utils.fetchApi(
          API_ENDPOINTS.expenseById(expenseIdInput.value),
          {
            method: 'PUT',
            body: JSON.stringify(expenseData)
          }
        );
      } else {
        // Create new expense
        result = await Utils.fetchApi(
          API_ENDPOINTS.expenses,
          {
            method: 'POST',
            body: JSON.stringify(expenseData)
          }
        );
      }
      
      if (result.success) {
        // Close modal
        Utils.hideModal('expense-modal');
        
        // Reload expenses
        loadExpenses();
        
        // Show success message
        Utils.showAlert(
          'Success', 
          expenseIdInput.value ? 'Expense updated successfully' : 'Expense added successfully'
        );
      } else {
        Utils.showAlert('Error', result.message);
      }
    } catch (error) {
      console.error('Expense form error:', error);
      Utils.showAlert('Error', 'Failed to save expense');
    }
  };
  
  // Delete expense
  const deleteExpense = async (expenseId) => {
    try {
      const result = await Utils.fetchApi(
        API_ENDPOINTS.expenseById(expenseId),
        {
          method: 'DELETE'
        }
      );
      
      if (result.success) {
        // Reload expenses
        loadExpenses();
        
        // Show success message
        Utils.showAlert('Success', 'Expense deleted successfully');
      } else {
        Utils.showAlert('Error', result.message);
      }
    } catch (error) {
      console.error('Delete expense error:', error);
      Utils.showAlert('Error', 'Failed to delete expense');
    }
  };
  
  // Public methods
  return {
    init,
    loadExpenses
  };
})(); 