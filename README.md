# Bakery Management System

A full-stack MERN application for managing bakery operations including inventory, orders, expenses, and reports.

## Features

- Dashboard with daily sales and metrics
- Inventory management with stock tracking
- Order processing and status updates
- Expense tracking and categorization
- Reports and analytics

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Web browser (Chrome, Firefox, Edge)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd bakery-management-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/bakery-management
   JWT_SECRET=your_jwt_secret_key_here
   ```

## Running the Application

### Option 1: Using npm

```
npm run dev
```

### Option 2: Using the batch file (Windows)

Simply double-click the `start.bat` file in the root directory.

## Accessing the Application

Once the server is running, open your web browser and navigate to:

```
http://localhost:5000
```

**Important:** Do not open the HTML files directly from the file system, as this will cause CORS and API connection errors. Always access the application through the server URL.

## Default Login

Username: admin  
Password: admin123

## Troubleshooting

- If you encounter database connection issues, ensure MongoDB is running
- If you see CORS errors, make sure you're accessing the app through the server URL
- For any missing dependencies, run `npm install` again

## Project Structure

```
bakery-management/
├── controllers/        # API controllers
├── middleware/         # Middleware functions
├── models/             # MongoDB models
├── public/             # Frontend assets
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   └── images/         # Image assets
├── routes/             # API routes
├── .env                # Environment variables
├── package.json        # Project dependencies
├── server.js           # Main server file
└── README.md           # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/logout` - Logout and clear cookie
- `GET /api/auth/me` - Get current user info

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create a new item
- `GET /api/items/:id` - Get a specific item
- `PUT /api/items/:id` - Update a specific item
- `DELETE /api/items/:id` - Delete a specific item
- `PATCH /api/items/:id/stock` - Update item stock

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get a specific order
- `PUT /api/orders/:id` - Update a specific order
- `DELETE /api/orders/:id` - Delete a specific order
- `PATCH /api/orders/:id/status` - Update order status

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/:id` - Get a specific expense
- `PUT /api/expenses/:id` - Update a specific expense
- `DELETE /api/expenses/:id` - Delete a specific expense

### Reports
- `GET /api/reports/dashboard` - Get dashboard summary
- `GET /api/reports/daily` - Get daily report
- `GET /api/reports/range` - Get date range report
- `GET /api/reports/inventory` - Get inventory report

## License

MIT License

## Contact

For any questions or feedback, please contact:
- Email: your-email@example.com 