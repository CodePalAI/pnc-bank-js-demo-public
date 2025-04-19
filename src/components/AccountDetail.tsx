import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Account, Transaction, Customer } from '../types';
import api from '../services/api';
import { useApp } from '../contexts/AppContext';

const AccountDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, setLoading, showNotification } = useApp();
  
  const [account, setAccount] = useState<Account | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Fetch account details
        const accountResponse = await api.getAccount(id);
        if (!accountResponse.success || !accountResponse.data) {
          showNotification('error', 'Failed to load account');
          navigate('/accounts');
          return;
        }
        
        setAccount(accountResponse.data);
        
        // Fetch customer details
        const customerResponse = await api.getCustomer(accountResponse.data.customerId);
        if (customerResponse.success && customerResponse.data) {
          setCustomer(customerResponse.data);
        }
        
        // Fetch account transactions
        const transactionsResponse = await api.getAccountTransactions(id);
        if (transactionsResponse.success && transactionsResponse.data) {
          // Sort transactions by date (newest first)
          const sortedTransactions = [...transactionsResponse.data].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setTransactions(sortedTransactions);
        }
      } catch (error) {
        showNotification('error', 'An error occurred while loading account data');
        navigate('/accounts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, showNotification]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking':
        return 'Checking';
      case 'savings':
        return 'Savings';
      case 'creditCard':
        return 'Credit Card';
      default:
        return type;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'transfer':
        return 'Transfer';
      default:
        return type;
    }
  };

  const containerStyle = {
    padding: '1rem',
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    minHeight: 'calc(100vh - 64px)',
  };

  const sectionStyle = {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '1.5rem',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '1rem',
  };

  const thStyle = {
    backgroundColor: theme.secondaryColor,
    color: '#fff',
    padding: '0.75rem',
    textAlign: 'left' as const,
  };

  const tdStyle = {
    padding: '0.75rem',
    borderBottom: '1px solid #ddd',
  };

  const buttonStyle = {
    backgroundColor: theme.primaryColor,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    marginRight: '0.5rem',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '14px',
  };

  const amountStyle = (transactionType: string, amount: number) => {
    let color = '#333';
    if (transactionType === 'deposit') {
      color = '#28a745';
    } else if (transactionType === 'withdrawal' || transactionType === 'transfer') {
      color = '#dc3545';
    }
    
    return {
      ...tdStyle,
      color,
      fontWeight: 'bold',
    };
  };

  if (isLoading || !account) {
    return (
      <div style={containerStyle}>
        <h1>Loading account...</h1>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Account Details</h1>
        <div>
          <Link
            to={`/accounts/${id}/deposit`}
            style={{
              ...buttonStyle,
              backgroundColor: '#28a745',
            }}
          >
            Deposit
          </Link>
          <Link
            to={`/accounts/${id}/withdraw`}
            style={{
              ...buttonStyle,
              backgroundColor: '#17a2b8',
            }}
          >
            Withdraw
          </Link>
          <Link
            to={`/accounts/${id}/transfer`}
            style={buttonStyle}
          >
            Transfer
          </Link>
          <button
            style={{
              ...buttonStyle,
              backgroundColor: '#6c757d',
            }}
            onClick={() => navigate('/accounts')}
          >
            Back to Accounts
          </button>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2>Account Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p><strong>Account Number:</strong> {account.accountNumber}</p>
            <p><strong>Type:</strong> {getAccountTypeLabel(account.type)}</p>
            <p><strong>Balance:</strong> <span style={{ 
              color: account.balance < 0 ? '#dc3545' : account.balance === 0 ? '#6c757d' : '#28a745',
              fontWeight: 'bold'
            }}>
              {formatCurrency(account.balance)}
            </span></p>
          </div>
          <div>
            <p><strong>Customer:</strong> {customer ? `${customer.firstName} ${customer.lastName}` : 'Loading...'}</p>
            <p><strong>Created:</strong> {formatDate(account.createdAt.toString())}</p>
            <p><strong>Last Updated:</strong> {formatDate(account.updatedAt.toString())}</p>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2>Transaction History</h2>
        {transactions.length === 0 ? (
          <p>No transactions found for this account.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td style={tdStyle}>{formatDate(transaction.timestamp.toString())}</td>
                  <td style={tdStyle}>{getTransactionTypeLabel(transaction.type)}</td>
                  <td style={tdStyle}>{transaction.description}</td>
                  <td style={amountStyle(
                    transaction.type, 
                    transaction.amount
                  )}>
                    {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AccountDetail; 