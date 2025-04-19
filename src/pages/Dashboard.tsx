import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Account, Customer, Transaction } from '../types';
import api from '../services/api';
import { useApp } from '../contexts/AppContext';

const Dashboard: React.FC = () => {
  const { theme, loading, setLoading, showNotification, demoMode, loadDemoData } = useApp();
  const [stats, setStats] = useState({
    customerCount: 0,
    accountCount: 0,
    totalBalance: 0,
    recentTransactions: [] as Transaction[],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch customers
        const customersResponse = await api.getAllCustomers();
        const customerCount = customersResponse.success ? (customersResponse.data?.length || 0) : 0;

        // Fetch accounts
        const accountsResponse = await api.getAllAccounts();
        const accounts = accountsResponse.success ? (accountsResponse.data || []) : [];
        const accountCount = accounts.length;
        
        // Calculate total balance
        const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

        // Fetch recent transactions
        const transactionsResponse = await api.getAllTransactions();
        const transactions = transactionsResponse.success ? (transactionsResponse.data || []) : [];
        
        // Sort transactions by date (newest first) and take top 5
        const recentTransactions = [...transactions]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);

        setStats({
          customerCount,
          accountCount,
          totalBalance,
          recentTransactions,
        });
      } catch (error) {
        showNotification('error', 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [setLoading, showNotification]);

  const handleLoadDemoData = async () => {
    try {
      await loadDemoData();
      // Refresh data after loading demo data
      window.location.reload();
    } catch (error) {
      showNotification('error', 'Failed to load demo data');
    }
  };

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
    });
  };

  const containerStyle = {
    padding: '1rem',
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    minHeight: 'calc(100vh - 64px)',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  };

  const statCardsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>PNC Bank Dashboard</h1>
        {!demoMode.sampleDataLoaded && (
          <button 
            style={buttonStyle} 
            onClick={handleLoadDemoData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load Demo Data'}
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <>
          <div style={statCardsStyle}>
            <div style={cardStyle}>
              <h3>Total Customers</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.primaryColor }}>
                {stats.customerCount}
              </p>
              <Link to="/customers" style={{ color: theme.primaryColor }}>
                View all customers →
              </Link>
            </div>

            <div style={cardStyle}>
              <h3>Total Accounts</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.primaryColor }}>
                {stats.accountCount}
              </p>
              <Link to="/accounts" style={{ color: theme.primaryColor }}>
                View all accounts →
              </Link>
            </div>

            <div style={cardStyle}>
              <h3>Total Balance</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.primaryColor }}>
                {formatCurrency(stats.totalBalance)}
              </p>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Recent Transactions</h2>
              <Link to="/transactions" style={{ color: theme.primaryColor }}>
                View all transactions →
              </Link>
            </div>

            {stats.recentTransactions.length === 0 ? (
              <p>No transactions found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.5rem', textAlign: 'left' as const, borderBottom: '1px solid #ddd' }}>Date</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' as const, borderBottom: '1px solid #ddd' }}>Type</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' as const, borderBottom: '1px solid #ddd' }}>Description</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' as const, borderBottom: '1px solid #ddd' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                        {formatDate(transaction.timestamp.toString())}
                      </td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                        {transaction.description}
                      </td>
                      <td style={{ 
                        padding: '0.5rem', 
                        borderBottom: '1px solid #ddd', 
                        textAlign: 'right' as const,
                        color: transaction.type === 'deposit' ? '#28a745' : '#dc3545',
                        fontWeight: 'bold',
                      }}>
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/customers/new"
              style={{
                ...buttonStyle,
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
              }}
            >
              Add New Customer
            </Link>
            <Link
              to="/accounts/new"
              style={{
                ...buttonStyle,
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
              }}
            >
              Create New Account
            </Link>
            <Link
              to="/transactions"
              style={{
                ...buttonStyle,
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#17a2b8',
              }}
            >
              View All Transactions
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 