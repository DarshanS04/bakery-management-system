// Inventory Module
const Inventory = (() => {
  // Cache DOM elements
  const inventoryList = document.getElementById('inventory-list');
  const addItemBtn = document.getElementById('add-item-btn');
  const itemForm = document.getElementById('item-form');
  const itemModal = document.getElementById('item-modal');
  const itemModalTitle = document.getElementById('item-modal-title');
  const searchInput = document.getElementById('inventory-search');
  const categoryFilter = document.getElementById('inventory-category-filter');
  
  // Item form elements
  const itemIdInput = document.getElementById('item-id');
  const itemNameInput = document.getElementById('item-name');
  const itemCategorySelect = document.getElementById('item-category');
  const itemPriceInput = document.getElementById('item-price');
  const itemCostInput = document.getElementById('item-cost');
  const itemStockInput = document.getElementById('item-stock');
  const itemUnitSelect = document.getElementById('item-unit');
  const itemMinStockInput = document.getElementById('item-min-stock');
  const itemDescriptionInput = document.getElementById('item-description');
  
  // Current items data
  let items = [];
  
  // Initialize inventory module
  const init = () => {
    loadItems();
    setupEventListeners();
  };
  
  // Set up event listeners
  const setupEventListeners = () => {
    // Add item button
    addItemBtn.addEventListener('click', openAddItemModal);
    
    // Item form submission
    itemForm.addEventListener('submit', handleItemFormSubmit);
    
    // Search input
    searchInput.addEventListener('input', Utils.debounce(filterItems, 300));
    
    // Category filter
    categoryFilter.addEventListener('change', filterItems);
  };
  
  // Load all items
  const loadItems = async () => {
    try {
      Utils.showLoading('inventory-list');
      
      const result = await Utils.fetchApi(API_ENDPOINTS.items);
      
      if (result.success) {
        items = result.data.data;
        renderItems(items);
      } else {
        Utils.showAlert('Error', 'Failed to load inventory items');
      }
    } catch (error) {
      console.error('Inventory error:', error);
      Utils.showAlert('Error', 'Failed to load inventory items');
    }
  };
  
  // Render items to the inventory list
  const renderItems = (itemsToRender) => {
    if (!itemsToRender || itemsToRender.length === 0) {
      inventoryList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>No items found</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    itemsToRender.forEach(item => {
      // Check if stock is low
      const isLowStock = item.stockQuantity <= item.minStockLevel;
      
      html += `
        <div class="inventory-card" data-id="${item._id}">
          <div class="inventory-card-header">
            <div>
              <div class="inventory-card-title">${item.name}</div>
              <span class="inventory-card-category">${item.category}</span>
            </div>
          </div>
          
          <div class="inventory-card-info">
            <div class="info-item">
              <span class="info-label">Price</span>
              <span class="info-value">${Utils.formatCurrency(item.price)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cost</span>
              <span class="info-value">${Utils.formatCurrency(item.cost)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Stock</span>
              <span class="info-value ${isLowStock ? 'stock-low' : ''}">
                ${item.stockQuantity} ${item.unit}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Min Stock</span>
              <span class="info-value">${item.minStockLevel} ${item.unit}</span>
            </div>
          </div>
          
          <div class="inventory-card-actions">
            <button class="btn-icon edit-item" data-id="${item._id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-item" data-id="${item._id}">
              <i class="fas fa-trash"></i>
            </button>
            <button class="btn-icon update-stock" data-id="${item._id}">
              <i class="fas fa-plus-minus"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    inventoryList.innerHTML = html;
    
    // Add event listeners to buttons
    inventoryList.querySelectorAll('.edit-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-id');
        openEditItemModal(itemId);
      });
    });
    
    inventoryList.querySelectorAll('.delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-id');
        confirmDeleteItem(itemId);
      });
    });
    
    inventoryList.querySelectorAll('.update-stock').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-id');
        openStockUpdateModal(itemId);
      });
    });
  };
  
  // Filter items based on search and category
  const filterItems = () => {
    const searchQuery = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;
    
    const filteredItems = items.filter(item => {
      // Filter by search query
      const matchesSearch = item.name.toLowerCase().includes(searchQuery);
      
      // Filter by category
      const matchesCategory = !categoryValue || item.category === categoryValue;
      
      return matchesSearch && matchesCategory;
    });
    
    renderItems(filteredItems);
  };
  
  // Open add item modal
  const openAddItemModal = () => {
    // Reset form
    itemForm.reset();
    itemIdInput.value = '';
    
    // Update modal title
    itemModalTitle.textContent = 'Add New Item';
    
    // Show modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    itemModal.classList.remove('hidden');
  };
  
  // Open edit item modal
  const openEditItemModal = (itemId) => {
    // Find the item
    const item = items.find(i => i._id === itemId);
    
    if (!item) {
      Utils.showAlert('Error', 'Item not found');
      return;
    }
    
    // Fill form with item data
    itemIdInput.value = item._id;
    itemNameInput.value = item.name;
    itemCategorySelect.value = item.category;
    itemPriceInput.value = item.price;
    itemCostInput.value = item.cost;
    itemStockInput.value = item.stockQuantity;
    itemUnitSelect.value = item.unit;
    itemMinStockInput.value = item.minStockLevel;
    itemDescriptionInput.value = item.description || '';
    
    // Update modal title
    itemModalTitle.textContent = 'Edit Item';
    
    // Show modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    itemModal.classList.remove('hidden');
  };
  
  // Open stock update modal
  const openStockUpdateModal = (itemId) => {
    // Find the item
    const item = items.find(i => i._id === itemId);
    
    if (!item) {
      Utils.showAlert('Error', 'Item not found');
      return;
    }
    
    // Prompt for stock adjustment
    const adjustment = prompt(`Update stock for ${item.name}\nCurrent stock: ${item.stockQuantity} ${item.unit}\n\nEnter adjustment (positive or negative):`);
    
    if (adjustment === null) {
      return; // User cancelled
    }
    
    // Validate input
    const adjNumber = parseInt(adjustment);
    if (isNaN(adjNumber)) {
      Utils.showAlert('Error', 'Please enter a valid number');
      return;
    }
    
    // Calculate new stock
    const newStock = item.stockQuantity + adjNumber;
    if (newStock < 0) {
      Utils.showAlert('Error', 'Stock cannot be negative');
      return;
    }
    
    // Update stock
    updateItemStock(itemId, adjNumber);
  };
  
  // Confirm delete item
  const confirmDeleteItem = (itemId) => {
    // Find the item
    const item = items.find(i => i._id === itemId);
    
    if (!item) {
      Utils.showAlert('Error', 'Item not found');
      return;
    }
    
    Utils.showConfirm(
      'Delete Item',
      `Are you sure you want to delete ${item.name}?`,
      () => deleteItem(itemId)
    );
  };
  
  // Handle item form submission
  const handleItemFormSubmit = async (e) => {
    e.preventDefault();
    
    // Get form data
    const itemData = {
      name: itemNameInput.value,
      category: itemCategorySelect.value,
      price: parseFloat(itemPriceInput.value),
      cost: parseFloat(itemCostInput.value),
      stockQuantity: parseInt(itemStockInput.value),
      unit: itemUnitSelect.value,
      minStockLevel: parseInt(itemMinStockInput.value),
      description: itemDescriptionInput.value
    };
    
    // Validate data
    if (!itemData.name || !itemData.category || !itemData.unit) {
      Utils.showAlert('Error', 'Please fill all required fields');
      return;
    }
    
    try {
      let result;
      
      if (itemIdInput.value) {
        // Update existing item
        result = await Utils.fetchApi(
          API_ENDPOINTS.itemById(itemIdInput.value),
          {
            method: 'PUT',
            body: JSON.stringify(itemData)
          }
        );
      } else {
        // Create new item
        result = await Utils.fetchApi(
          API_ENDPOINTS.items,
          {
            method: 'POST',
            body: JSON.stringify(itemData)
          }
        );
      }
      
      if (result.success) {
        // Close modal
        Utils.hideModal('item-modal');
        
        // Reload items
        loadItems();
        
        // Show success message
        Utils.showAlert(
          'Success', 
          itemIdInput.value ? 'Item updated successfully' : 'Item added successfully'
        );
      } else {
        Utils.showAlert('Error', result.message);
      }
    } catch (error) {
      console.error('Item form error:', error);
      Utils.showAlert('Error', 'Failed to save item');
    }
  };
  
  // Update item stock
  const updateItemStock = async (itemId, adjustment) => {
    try {
      const result = await Utils.fetchApi(
        API_ENDPOINTS.updateItemStock(itemId),
        {
          method: 'PATCH',
          body: JSON.stringify({ adjustment })
        }
      );
      
      if (result.success) {
        // Reload items
        loadItems();
        
        // Show success message
        Utils.showAlert('Success', 'Stock updated successfully');
      } else {
        Utils.showAlert('Error', result.message);
      }
    } catch (error) {
      console.error('Stock update error:', error);
      Utils.showAlert('Error', 'Failed to update stock');
    }
  };
  
  // Delete item
  const deleteItem = async (itemId) => {
    try {
      const result = await Utils.fetchApi(
        API_ENDPOINTS.itemById(itemId),
        {
          method: 'DELETE'
        }
      );
      
      if (result.success) {
        // Reload items
        loadItems();
        
        // Show success message
        Utils.showAlert('Success', 'Item deleted successfully');
      } else {
        Utils.showAlert('Error', result.message);
      }
    } catch (error) {
      console.error('Delete item error:', error);
      Utils.showAlert('Error', 'Failed to delete item');
    }
  };
  
  // View item details
  const viewItem = (itemId) => {
    // Find the item and open edit modal
    openEditItemModal(itemId);
  };
  
  // Public methods
  return {
    init,
    loadItems,
    viewItem,
    openStockUpdateModal
  };
})(); 