# Bakery Management System

A full-stack web application for managing a bakery business, including inventory, orders, expenses, and reports.

## Features

- **User Authentication**: Secure login system with role-based access control
- **Dashboard**: Overview of daily sales, orders, expenses, and low stock alerts
- **Inventory Management**: Add, edit, and track bakery items and ingredients
- **Order Management**: Create and manage customer orders with status tracking
- **Expense Tracking**: Record and categorize business expenses
- **Reports**: Generate daily, date range, and inventory reports

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or cloud instance)

### Installation

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
   NODE_ENV=development
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

### Default Admin Account

After starting the server for the first time, you can create an admin account using the registration API or by using the MongoDB shell to insert a user document.

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