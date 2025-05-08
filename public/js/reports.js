// Reports Module
const Reports = (() => {
  // Private variables
  let currentReport = null;
  let reportData = null;
  
  // Cache DOM elements
  const reportTypes = document.querySelectorAll('.report-card');
  const reportContent = document.getElementById('report-content');
  
  // Initialize module
  const init = () => {
    // Add event listeners to report types
    reportTypes.forEach(reportType => {
      reportType.addEventListener('click', () => {
        const reportName = reportType.getAttribute('data-report');
        loadReport(reportName);
      });
    });
  };
  
  // Load report data
  const loadReport = async (reportName) => {
    currentReport = reportName;
    
    // Show loading state
    reportContent.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading report data...</p>
      </div>
    `;
    
    try {
      switch (reportName) {
        case 'daily':
          await loadDailyReport();
          break;
        case 'range':
          showDateRangeSelector();
          break;
        case 'inventory':
          await loadInventoryReport();
          break;
        default:
          reportContent.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-chart-bar"></i>
              <p>Select a report type to view</p>
            </div>
          `;
      }
    } catch (error) {
      console.error('Error loading report:', error);
      reportContent.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to load report. Please try again.</p>
        </div>
      `;
    }
  };
  
  // Load daily report
  const loadDailyReport = async () => {
    // Get today's date formatted as YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    // Create date input for selecting day
    reportContent.innerHTML = `
      <div class="report-header">
        <h2>Daily Sales Report</h2>
        <div class="report-filters">
          <input type="date" id="daily-report-date" value="${today}">
          <button id="generate-daily-report" class="btn btn-primary">Generate Report</button>
        </div>
      </div>
      <div id="daily-report-content">
        <div class="empty-state">
          <i class="fas fa-calendar-day"></i>
          <p>Select a date and generate the report</p>
        </div>
      </div>
    `;
    
    // Add event listener to the generate button
    document.getElementById('generate-daily-report').addEventListener('click', async () => {
      const date = document.getElementById('daily-report-date').value;
      await generateDailyReport(date);
    });
  };
  
  // Generate daily report
  const generateDailyReport = async (date) => {
    const dailyReportContent = document.getElementById('daily-report-content');
    
    // Show loading state
    dailyReportContent.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Generating report...</p>
      </div>
    `;
    
    try {
      // Fetch report data
      const response = await fetch(`${API_ENDPOINTS.dailyReport}?date=${date}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Auth.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error generating report');
      }
      
      reportData = data.data;
      
      // Render the report
      renderDailyReport(reportData, date);
    } catch (error) {
      console.error('Error generating daily report:', error);
      dailyReportContent.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to generate report. Please try again.</p>
        </div>
      `;
    }
  };
  
  // Render daily report
  const renderDailyReport = (data, date) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const dailyReportContent = document.getElementById('daily-report-content');
    
    // Format currency for display
    const formatCurrency = (amount) => {
      return '₹' + amount.toFixed(2);
    };
    
    // Create HTML content
    let html = `
      <div class="report-date">
        <h3>${formattedDate}</h3>
      </div>
      
      <div class="report-summary">
        <div class="summary-card">
          <div class="summary-title">Total Sales</div>
          <div class="summary-value">${formatCurrency(data.totalSales)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">Total Orders</div>
          <div class="summary-value">${data.totalOrders}</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">Total Expenses</div>
          <div class="summary-value">${formatCurrency(data.totalExpenses)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">Net Profit</div>
          <div class="summary-value">${formatCurrency(data.netProfit)}</div>
        </div>
      </div>
    `;
    
    // Add sales by category if available
    if (data.salesByCategory && data.salesByCategory.length > 0) {
      html += `
        <div class="report-section">
          <div class="report-section-header">
            <h3>Sales by Category</h3>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Items Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${data.salesByCategory.map(category => `
                  <tr>
                    <td>${category.name}</td>
                    <td>${category.count}</td>
                    <td>${formatCurrency(category.revenue)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
    
    // Add popular items if available
    if (data.popularItems && data.popularItems.length > 0) {
      html += `
        <div class="report-section">
          <div class="report-section-header">
            <h3>Popular Items</h3>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${data.popularItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.revenue)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
    
    // Render HTML
    dailyReportContent.innerHTML = html;
  };
  
  // Show date range selector
  const showDateRangeSelector = () => {
    // Create date inputs for selecting range
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().split('T')[0];
    
    reportContent.innerHTML = `
      <div class="report-header">
        <h2>Date Range Report</h2>
        <div class="report-filters">
          <div class="filter-group">
            <label for="range-start-date">Start Date</label>
            <input type="date" id="range-start-date" value="${lastMonthStr}">
          </div>
          <div class="filter-group">
            <label for="range-end-date">End Date</label>
            <input type="date" id="range-end-date" value="${today}">
          </div>
          <button id="generate-range-report" class="btn btn-primary">Generate Report</button>
        </div>
      </div>
      <div id="range-report-content">
        <div class="empty-state">
          <i class="fas fa-calendar-week"></i>
          <p>Select a date range and generate the report</p>
        </div>
      </div>
    `;
    
    // Add event listener to the generate button
    document.getElementById('generate-range-report').addEventListener('click', async () => {
      const startDate = document.getElementById('range-start-date').value;
      const endDate = document.getElementById('range-end-date').value;
      await generateRangeReport(startDate, endDate);
    });
  };
  
  // Generate date range report
  const generateRangeReport = async (startDate, endDate) => {
    // Implementation similar to generateDailyReport
    const rangeReportContent = document.getElementById('range-report-content');
    
    // Show loading state
    rangeReportContent.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Generating report...</p>
      </div>
    `;
    
    try {
      // Fetch report data
      const response = await fetch(`${API_ENDPOINTS.dateRangeReport}?startDate=${startDate}&endDate=${endDate}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Auth.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error generating report');
      }
      
      reportData = data.data;
      
      // Render the report (implementation would be similar to renderDailyReport)
      rangeReportContent.innerHTML = `
        <div class="success-state">
          <i class="fas fa-check-circle"></i>
          <p>Report generated successfully</p>
        </div>
      `;
    } catch (error) {
      console.error('Error generating range report:', error);
      rangeReportContent.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to generate report. Please try again.</p>
        </div>
      `;
    }
  };
  
  // Load inventory report
  const loadInventoryReport = async () => {
    // Implementation for inventory report
    reportContent.innerHTML = `
      <div class="report-header">
        <h2>Inventory Status Report</h2>
        <div class="report-filters">
          <select id="inventory-status-filter">
            <option value="all">All Items</option>
            <option value="low">Low Stock Items</option>
            <option value="out">Out of Stock Items</option>
          </select>
          <button id="generate-inventory-report" class="btn btn-primary">Generate Report</button>
        </div>
      </div>
      <div id="inventory-report-content">
        <div class="empty-state">
          <i class="fas fa-boxes"></i>
          <p>Select a filter and generate the report</p>
        </div>
      </div>
    `;
    
    // Add event listener to the generate button
    document.getElementById('generate-inventory-report').addEventListener('click', async () => {
      const statusFilter = document.getElementById('inventory-status-filter').value;
      await generateInventoryReport(statusFilter);
    });
  };
  
  // Generate inventory report
  const generateInventoryReport = async (statusFilter) => {
    // Implementation similar to other report generators
    const inventoryReportContent = document.getElementById('inventory-report-content');
    
    // Show loading state
    inventoryReportContent.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Generating report...</p>
      </div>
    `;
    
    try {
      // Fetch report data
      const response = await fetch(`${API_ENDPOINTS.inventoryReport}?status=${statusFilter}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Auth.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error generating report');
      }
      
      reportData = data.data;
      
      // For now, just show a success message
      inventoryReportContent.innerHTML = `
        <div class="success-state">
          <i class="fas fa-check-circle"></i>
          <p>Inventory report generated successfully</p>
        </div>
      `;
    } catch (error) {
      console.error('Error generating inventory report:', error);
      inventoryReportContent.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to generate report. Please try again.</p>
        </div>
      `;
    }
  };
  
  // Export public methods
  return {
    init,
    loadReport
  };
})(); 