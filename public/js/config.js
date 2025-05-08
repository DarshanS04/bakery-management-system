// API Configuration
const API_BASE_URL = '/api';

// API Endpoints
const API_ENDPOINTS = {
  // Auth
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  logout: `${API_BASE_URL}/auth/logout`,
  me: `${API_BASE_URL}/auth/me`,
  
  // Items
  items: `${API_BASE_URL}/items`,
  itemById: (id) => `${API_BASE_URL}/items/${id}`,
  updateItemStock: (id) => `${API_BASE_URL}/items/${id}/stock`,
  
  // Orders
  orders: `${API_BASE_URL}/orders`,
  orderById: (id) => `${API_BASE_URL}/orders/${id}`,
  updateOrderStatus: (id) => `${API_BASE_URL}/orders/${id}/status`,
  
  // Expenses
  expenses: `${API_BASE_URL}/expenses`,
  expenseById: (id) => `${API_BASE_URL}/expenses/${id}`,
  
  // Reports
  dashboardSummary: `${API_BASE_URL}/reports/dashboard`,
  dailyReport: `${API_BASE_URL}/reports/daily`,
  dateRangeReport: `${API_BASE_URL}/reports/range`,
  inventoryReport: `${API_BASE_URL}/reports/inventory`,
  
  // Customer
  customerDashboard: `${API_BASE_URL}/customer/dashboard`,
  customerOrders: `${API_BASE_URL}/customer/orders`,
  customerProfile: `${API_BASE_URL}/customer/profile`,
  customerFeedback: `${API_BASE_URL}/customer/feedback`
}; 