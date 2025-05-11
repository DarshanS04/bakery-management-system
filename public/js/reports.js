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
        case 'feedback':
          await loadFeedbackReport();
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
  
  // Load feedback report
  const loadFeedbackReport = async () => {
    // Create date inputs for filtering feedback
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const todayFormatted = today.toISOString().split('T')[0];
    const oneMonthAgoFormatted = oneMonthAgo.toISOString().split('T')[0];
    
    reportContent.innerHTML = `
      <div class="report-header">
        <h2>Customer Feedback Report</h2>
        <div class="report-filters">
          <div class="filter-group">
            <label>Date Range:</label>
            <input type="date" id="feedback-start-date" value="${oneMonthAgoFormatted}">
            <span>to</span>
            <input type="date" id="feedback-end-date" value="${todayFormatted}">
          </div>
          <div class="filter-group">
            <label>Rating:</label>
            <select id="feedback-rating-filter">
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <button id="generate-feedback-report" class="btn btn-primary">Generate Report</button>
        </div>
      </div>
      <div id="feedback-report-content">
        <div class="empty-state">
          <i class="fas fa-star"></i>
          <p>Select filters and generate the feedback report</p>
        </div>
      </div>
    `;
    
    // Add event listener to the generate button
    document.getElementById('generate-feedback-report').addEventListener('click', async () => {
      const startDate = document.getElementById('feedback-start-date').value;
      const endDate = document.getElementById('feedback-end-date').value;
      const ratingFilter = document.getElementById('feedback-rating-filter').value;
      
      await generateFeedbackReport(startDate, endDate, ratingFilter);
    });
  };
  
  // Generate feedback report
  const generateFeedbackReport = async (startDate, endDate, ratingFilter) => {
    const feedbackReportContent = document.getElementById('feedback-report-content');
    
    // Show loading state
    feedbackReportContent.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Generating feedback report...</p>
      </div>
    `;
    
    try {
      // Build query parameters
      let queryParams = [];
      if (startDate) queryParams.push(`startDate=${startDate}`);
      if (endDate) queryParams.push(`endDate=${endDate}`);
      if (ratingFilter) {
        queryParams.push(`minRating=${ratingFilter}`);
        queryParams.push(`maxRating=${ratingFilter}`);
      }
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      
      // Fetch report data
      const response = await fetch(`${API_ENDPOINTS.feedbackReport}${queryString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Auth.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback data');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error generating feedback report');
      }
      
      reportData = data.data;
      
      // Render the feedback report
      renderFeedbackReport(reportData);
    } catch (error) {
      console.error('Error generating feedback report:', error);
      feedbackReportContent.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to generate feedback report. Please try again.</p>
        </div>
      `;
    }
  };
  
  // Render feedback report
  const renderFeedbackReport = (data) => {
    const feedbackReportContent = document.getElementById('feedback-report-content');
    
    // Check if we have any feedback
    if (data.totalFeedback === 0) {
      feedbackReportContent.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-star"></i>
          <p>No feedback found for the selected criteria</p>
        </div>
      `;
      return;
    }
    
    // Create rating stars HTML
    const renderStars = (rating) => {
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
          starsHtml += '<i class="fas fa-star text-warning"></i>';
        } else {
          starsHtml += '<i class="far fa-star"></i>';
        }
      }
      return starsHtml;
    };
    
    // Create HTML for the summary section
    let html = `
      <div class="report-summary">
        <div class="summary-card">
          <div class="summary-title">Total Feedback</div>
          <div class="summary-value">${data.totalFeedback}</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">Average Rating</div>
          <div class="summary-value">
            ${renderStars(Math.round(data.averageRating))}
            <span class="ml-2">${data.averageRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div class="rating-distribution">
        <h3>Rating Distribution</h3>
        <div class="rating-bars">
    `;
    
    // Add rating distribution bars
    for (let i = 5; i >= 1; i--) {
      const count = data.ratingCounts[i] || 0;
      const percent = data.ratingPercentages[i] || 0;
      
      html += `
        <div class="rating-bar-container">
          <div class="rating-label">${i} ${i === 1 ? 'Star' : 'Stars'}</div>
          <div class="rating-bar">
            <div class="rating-bar-fill" style="width: ${percent}%"></div>
          </div>
          <div class="rating-count">${count} (${percent.toFixed(1)}%)</div>
        </div>
      `;
    }
    
    html += `
        </div>
      </div>
      
      <div class="feedback-list">
        <h3>Customer Feedback</h3>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order #</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // Add each feedback entry
    data.recentFeedback.forEach(feedback => {
      const date = new Date(feedback.date).toLocaleDateString();
      
      html += `
        <tr>
          <td>${date}</td>
          <td>${feedback.order.orderNumber}</td>
          <td>${feedback.customer.name}</td>
          <td>${renderStars(feedback.rating)}</td>
          <td>${feedback.comment || 'No comment provided'}</td>
        </tr>
      `;
    });
    
    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    feedbackReportContent.innerHTML = html;
  };
  
  // Export public methods
  return {
    init,
    loadReport
  };
})(); 