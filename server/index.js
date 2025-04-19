const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data storage
const DATA_DIR = path.join(__dirname, 'data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
const initializeDataFile = (filePath, initialData = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
  }
};

initializeDataFile(ACCOUNTS_FILE);
initializeDataFile(CUSTOMERS_FILE);
initializeDataFile(TRANSACTIONS_FILE);

// Helper functions
const readData = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// API Routes

// Customer endpoints
app.get('/api/customers', (req, res) => {
  try {
    const customers = readData(CUSTOMERS_FILE);
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customers/:id', (req, res) => {
  try {
    const customers = readData(CUSTOMERS_FILE);
    const customer = customers.find(c => c.id === req.params.id);
    
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/customers', (req, res) => {
  try {
    const customers = readData(CUSTOMERS_FILE);
    const newCustomer = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    customers.push(newCustomer);
    writeData(CUSTOMERS_FILE, customers);
    
    res.status(201).json({ success: true, data: newCustomer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/customers/:id', (req, res) => {
  try {
    const customers = readData(CUSTOMERS_FILE);
    const customerIndex = customers.findIndex(c => c.id === req.params.id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    const updatedCustomer = {
      ...customers[customerIndex],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };
    
    customers[customerIndex] = updatedCustomer;
    writeData(CUSTOMERS_FILE, customers);
    
    res.json({ success: true, data: updatedCustomer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    const customers = readData(CUSTOMERS_FILE);
    const accounts = readData(ACCOUNTS_FILE);
    
    // Check if customer has accounts
    const customerAccounts = accounts.filter(a => a.customerId === req.params.id);
    if (customerAccounts.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete customer with active accounts' 
      });
    }
    
    const updatedCustomers = customers.filter(c => c.id !== req.params.id);
    
    if (updatedCustomers.length === customers.length) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    writeData(CUSTOMERS_FILE, updatedCustomers);
    
    res.json({ success: true, data: { message: 'Customer deleted successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Account endpoints
app.get('/api/accounts', (req, res) => {
  try {
    const accounts = readData(ACCOUNTS_FILE);
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/accounts/:id', (req, res) => {
  try {
    const accounts = readData(ACCOUNTS_FILE);
    const account = accounts.find(a => a.id === req.params.id);
    
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }
    
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customers/:customerId/accounts', (req, res) => {
  try {
    const accounts = readData(ACCOUNTS_FILE);
    const customerAccounts = accounts.filter(a => a.customerId === req.params.customerId);
    
    res.json({ success: true, data: customerAccounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/accounts', (req, res) => {
  try {
    const { customerId, type, initialBalance = 0 } = req.body;
    
    if (!customerId || !type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Customer ID and account type are required' 
      });
    }
    
    // Verify customer exists
    const customers = readData(CUSTOMERS_FILE);
    const customerExists = customers.some(c => c.id === customerId);
    
    if (!customerExists) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    const accounts = readData(ACCOUNTS_FILE);
    
    // Generate account number
    const accountNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    const newAccount = {
      id: uuidv4(),
      accountNumber,
      customerId,
      type,
      balance: initialBalance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    accounts.push(newAccount);
    writeData(ACCOUNTS_FILE, accounts);
    
    // Create initial deposit transaction if balance > 0
    if (initialBalance > 0) {
      const transactions = readData(TRANSACTIONS_FILE);
      const depositTransaction = {
        id: uuidv4(),
        accountId: newAccount.id,
        type: 'deposit',
        amount: initialBalance,
        description: 'Initial deposit',
        timestamp: new Date().toISOString()
      };
      
      transactions.push(depositTransaction);
      writeData(TRANSACTIONS_FILE, transactions);
    }
    
    res.status(201).json({ success: true, data: newAccount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/accounts/:id', (req, res) => {
  try {
    const accounts = readData(ACCOUNTS_FILE);
    const account = accounts.find(a => a.id === req.params.id);
    
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }
    
    // Check if account has balance
    if (account.balance > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete account with positive balance' 
      });
    }
    
    const updatedAccounts = accounts.filter(a => a.id !== req.params.id);
    writeData(ACCOUNTS_FILE, updatedAccounts);
    
    res.json({ success: true, data: { message: 'Account deleted successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transaction endpoints
app.get('/api/transactions', (req, res) => {
  try {
    const transactions = readData(TRANSACTIONS_FILE);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/accounts/:accountId/transactions', (req, res) => {
  try {
    const transactions = readData(TRANSACTIONS_FILE);
    const accountTransactions = transactions.filter(
      t => t.accountId === req.params.accountId || t.toAccountId === req.params.accountId
    );
    
    res.json({ success: true, data: accountTransactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deposit transaction
app.post('/api/accounts/:accountId/deposit', (req, res) => {
  try {
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid amount is required' 
      });
    }
    
    const accounts = readData(ACCOUNTS_FILE);
    const accountIndex = accounts.findIndex(a => a.id === req.params.accountId);
    
    if (accountIndex === -1) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }
    
    // Update account balance
    accounts[accountIndex].balance += amount;
    accounts[accountIndex].updatedAt = new Date().toISOString();
    writeData(ACCOUNTS_FILE, accounts);
    
    // Record transaction
    const transactions = readData(TRANSACTIONS_FILE);
    const newTransaction = {
      id: uuidv4(),
      accountId: req.params.accountId,
      type: 'deposit',
      amount,
      description: description || 'Deposit',
      timestamp: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    writeData(TRANSACTIONS_FILE, transactions);
    
    res.status(201).json({ 
      success: true, 
      data: { 
        transaction: newTransaction, 
        newBalance: accounts[accountIndex].balance 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Withdrawal transaction
app.post('/api/accounts/:accountId/withdraw', (req, res) => {
  try {
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid amount is required' 
      });
    }
    
    const accounts = readData(ACCOUNTS_FILE);
    const accountIndex = accounts.findIndex(a => a.id === req.params.accountId);
    
    if (accountIndex === -1) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }
    
    // Check sufficient funds
    if (accounts[accountIndex].balance < amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient funds' 
      });
    }
    
    // Update account balance
    accounts[accountIndex].balance -= amount;
    accounts[accountIndex].updatedAt = new Date().toISOString();
    writeData(ACCOUNTS_FILE, accounts);
    
    // Record transaction
    const transactions = readData(TRANSACTIONS_FILE);
    const newTransaction = {
      id: uuidv4(),
      accountId: req.params.accountId,
      type: 'withdrawal',
      amount,
      description: description || 'Withdrawal',
      timestamp: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    writeData(TRANSACTIONS_FILE, transactions);
    
    res.status(201).json({ 
      success: true, 
      data: { 
        transaction: newTransaction, 
        newBalance: accounts[accountIndex].balance 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transfer transaction
app.post('/api/transfer', (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;
    
    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'From account, to account, and valid amount are required' 
      });
    }
    
    if (fromAccountId === toAccountId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot transfer to the same account' 
      });
    }
    
    const accounts = readData(ACCOUNTS_FILE);
    const fromAccountIndex = accounts.findIndex(a => a.id === fromAccountId);
    const toAccountIndex = accounts.findIndex(a => a.id === toAccountId);
    
    if (fromAccountIndex === -1 || toAccountIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'One or both accounts not found' 
      });
    }
    
    // Check sufficient funds
    if (accounts[fromAccountIndex].balance < amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient funds' 
      });
    }
    
    // Update account balances
    accounts[fromAccountIndex].balance -= amount;
    accounts[fromAccountIndex].updatedAt = new Date().toISOString();
    
    accounts[toAccountIndex].balance += amount;
    accounts[toAccountIndex].updatedAt = new Date().toISOString();
    
    writeData(ACCOUNTS_FILE, accounts);
    
    // Record transaction
    const transactions = readData(TRANSACTIONS_FILE);
    const newTransaction = {
      id: uuidv4(),
      accountId: fromAccountId,
      toAccountId,
      type: 'transfer',
      amount,
      description: description || 'Transfer',
      timestamp: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    writeData(TRANSACTIONS_FILE, transactions);
    
    res.status(201).json({ 
      success: true, 
      data: { 
        transaction: newTransaction, 
        fromAccount: {
          id: fromAccountId,
          newBalance: accounts[fromAccountIndex].balance
        },
        toAccount: {
          id: toAccountId,
          newBalance: accounts[toAccountIndex].balance
        }
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Demo data endpoint
app.post('/api/demo/load', (req, res) => {
  try {
    // Sample customers
    const customers = [
      {
        id: uuidv4(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '412-555-1234',
        address: '123 Main St, Pittsburgh, PA 15222',
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '412-555-5678',
        address: '456 Oak Ave, Pittsburgh, PA 15213',
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert.johnson@example.com',
        phone: '412-555-9012',
        address: '789 Pine Blvd, Pittsburgh, PA 15206',
        createdAt: new Date().toISOString()
      }
    ];
    
    writeData(CUSTOMERS_FILE, customers);
    
    // Sample accounts
    const accounts = [
      {
        id: uuidv4(),
        accountNumber: '10000001',
        customerId: customers[0].id,
        type: 'checking',
        balance: 5000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        accountNumber: '10000002',
        customerId: customers[0].id,
        type: 'savings',
        balance: 10000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        accountNumber: '10000003',
        customerId: customers[1].id,
        type: 'checking',
        balance: 3500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        accountNumber: '10000004',
        customerId: customers[2].id,
        type: 'savings',
        balance: 15000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        accountNumber: '10000005',
        customerId: customers[2].id,
        type: 'creditCard',
        balance: -2500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    writeData(ACCOUNTS_FILE, accounts);
    
    // Sample transactions
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const transactions = [
      {
        id: uuidv4(),
        accountId: accounts[0].id,
        type: 'deposit',
        amount: 5000,
        description: 'Initial deposit',
        timestamp: new Date(now - 30 * oneDay).toISOString()
      },
      {
        id: uuidv4(),
        accountId: accounts[0].id,
        type: 'withdrawal',
        amount: 1000,
        description: 'ATM withdrawal',
        timestamp: new Date(now - 20 * oneDay).toISOString()
      },
      {
        id: uuidv4(),
        accountId: accounts[0].id,
        toAccountId: accounts[1].id,
        type: 'transfer',
        amount: 2000,
        description: 'Transfer to savings',
        timestamp: new Date(now - 10 * oneDay).toISOString()
      },
      {
        id: uuidv4(),
        accountId: accounts[1].id,
        type: 'deposit',
        amount: 8000,
        description: 'Initial deposit',
        timestamp: new Date(now - 25 * oneDay).toISOString()
      },
      {
        id: uuidv4(),
        accountId: accounts[2].id,
        type: 'deposit',
        amount: 3500,
        description: 'Initial deposit',
        timestamp: new Date(now - 15 * oneDay).toISOString()
      },
      {
        id: uuidv4(),
        accountId: accounts[3].id,
        type: 'deposit',
        amount: 15000,
        description: 'Initial deposit',
        timestamp: new Date(now - 45 * oneDay).toISOString()
      },
      {
        id: uuidv4(),
        accountId: accounts[4].id,
        type: 'withdrawal',
        amount: 2500,
        description: 'Credit card purchase',
        timestamp: new Date(now - 5 * oneDay).toISOString()
      }
    ];
    
    writeData(TRANSACTIONS_FILE, transactions);
    
    res.json({ 
      success: true, 
      data: { 
        message: 'Demo data loaded successfully',
        stats: {
          customers: customers.length,
          accounts: accounts.length,
          transactions: transactions.length
        }
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 