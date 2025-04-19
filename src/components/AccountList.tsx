import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Account, Customer } from '../types';
import api from '../services/api';
import { useApp } from '../contexts/AppContext';

const AccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const { theme, loading, setLoading, showNotification } = useApp();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all accounts
        const accountsResponse = await api.getAllAccounts();
        if (accountsResponse.success) {
          setAccounts(accountsResponse.data || []);
        } else {
          showNotification('error', 'Failed to load accounts');
        }

        // Fetch all customers to show names
        const customersResponse = await api.getAllCustomers();
        if (customersResponse.success && customersResponse.data) {
          // Convert array to map for easy lookup
          const customerMap: Record<string, Customer> = {};
          customersResponse.data.forEach(customer => {
            customerMap[customer.id] = customer;
          });
          setCustomers(customerMap);
        } else {
          showNotification('error', 'Failed to load customers');
        }
      } catch (error) {
        showNotification('error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setLoading, showNotification]);

  const handleDeleteAccount = async (accountId: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      setLoading(true);
      try {
        const response = await api.deleteAccount(accountId);
        if (response.success) {
          setAccounts(prevAccounts => prevAccounts.filter(account => account.id !== accountId));
          showNotification('success', 'Account deleted successfully');
        } else {
          showNotification('error', response.error || 'Failed to delete account');
        }
      } catch (error) {
        if (error instanceof Error) {
          showNotification('error', error.message);
        } else {
          showNotification('error', 'Failed to delete account');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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

  const getCustomerName = (customerId: string) => {
    const customer = customers[customerId];
    return customer
      ? `${customer.firstName} ${customer.lastName}`
      : 'Unknown Customer';
  };

  const containerStyle = {
    padding: '1rem',
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    minHeight: 'calc(100vh - 64px)',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
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
    marginLeft: '0.5rem',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '14px',
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
  };

  const balanceStyle = (balance: number) => ({
    ...tdStyle,
    color: balance < 0 ? '#dc3545' : balance === 0 ? '#6c757d' : '#28a745',
    fontWeight: 'bold',
  });

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Accounts</h1>
        <Link to="/accounts/new" style={{ ...buttonStyle, textDecoration: 'none' }}>
          New Account
        </Link>
      </div>

      {loading ? (
        <p>Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <p>No accounts found. Create your first account to get started.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Account Number</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Balance</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <tr key={account.id}>
                <td style={tdStyle}>{account.accountNumber}</td>
                <td style={tdStyle}>{getCustomerName(account.customerId)}</td>
                <td style={tdStyle}>{getAccountTypeLabel(account.type)}</td>
                <td style={balanceStyle(account.balance)}>
                  {formatCurrency(account.balance)}
                </td>
                <td style={tdStyle}>
                  <Link
                    to={`/accounts/${account.id}`}
                    style={buttonStyle}
                  >
                    View
                  </Link>
                  <Link
                    to={`/accounts/${account.id}/deposit`}
                    style={{...buttonStyle, backgroundColor: '#28a745'}}
                  >
                    Deposit
                  </Link>
                  <Link
                    to={`/accounts/${account.id}/withdraw`}
                    style={{...buttonStyle, backgroundColor: '#17a2b8'}}
                  >
                    Withdraw
                  </Link>
                  <button
                    style={dangerButtonStyle}
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AccountList; 