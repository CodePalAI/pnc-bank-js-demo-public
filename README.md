# PNC Bank JavaScript Demo

A modern banking operations simulator built with React, TypeScript, and Express.

## Features

- **Account Management**: Create, view, update, and delete customer accounts.
- **Transaction Processing**: Perform deposits, withdrawals, and transfers between accounts.
- **Balance Inquiry and History**: View account balances and transaction history reports.
- **Data Persistence**: Simple JSON file-based storage with RESTful API.
- **Interactive UI**: Modern, responsive interface with real-time notifications.
- **Demo Mode**: Pre-loaded sample data for quick demonstrations.
- **Theme Customization**: Toggle between different UI themes.

## Technology Stack

- **Frontend**: React, TypeScript, React Router, Formik/Yup
- **Backend**: Node.js, Express
- **Data Storage**: JSON file-based storage
- **Styling**: Inline styles for simplicity

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/pnc-bank-js-demo.git
   cd pnc-bank-js-demo
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the backend server
   ```
   npm run server
   ```

4. In a separate terminal, start the frontend development server
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Demo Mode

To quickly populate the application with sample data, click the "Load Demo Data" button on the dashboard. This will create:

- Sample customers with different profiles
- Various account types (Checking, Savings, Credit Card)
- Sample transactions including deposits, withdrawals, and transfers

## Application Structure

```
pnc-bank-js-demo/
├── public/             # Static files
├── server/             # Backend server code
│   ├── data/           # JSON data files
│   └── index.js        # Express server
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   └── index.tsx       # Application entry point
└── package.json        # Project dependencies and scripts
```

## API Endpoints

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Accounts
- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/:id` - Get account by ID
- `GET /api/customers/:customerId/accounts` - Get accounts for a customer
- `POST /api/accounts` - Create a new account
- `DELETE /api/accounts/:id` - Delete an account

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/accounts/:accountId/transactions` - Get transactions for an account
- `POST /api/accounts/:accountId/deposit` - Make a deposit
- `POST /api/accounts/:accountId/withdraw` - Make a withdrawal
- `POST /api/transfer` - Transfer between accounts

## Extension Points

This demo could be extended in the following ways:

1. **Authentication**: Add user authentication and authorization.
2. **Persistent Database**: Replace the JSON storage with a real database like MongoDB or PostgreSQL.
3. **Additional Account Types**: Add more account types such as investment accounts or loans.
4. **Transaction Categories**: Add categorization for transactions (groceries, utilities, etc.).
5. **Reporting**: Add more advanced reporting and analytics dashboards.
6. **Mobile App**: Create a React Native version for mobile devices.

## License

This project is open source and available under the [MIT License](LICENSE).
