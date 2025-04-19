import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Customer } from '../types';
import api from '../services/api';
import { useApp } from '../contexts/AppContext';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { theme, loading, setLoading, showNotification } = useApp();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await api.getAllCustomers();
        if (response.success) {
          setCustomers(response.data || []);
        } else {
          showNotification('error', 'Failed to load customers');
        }
      } catch (error) {
        showNotification('error', 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [setLoading, showNotification]);

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setLoading(true);
      try {
        const response = await api.deleteCustomer(customerId);
        if (response.success) {
          setCustomers(prevCustomers => 
            prevCustomers.filter(customer => customer.id !== customerId)
          );
          showNotification('success', 'Customer deleted successfully');
        } else {
          showNotification('error', response.error || 'Failed to delete customer');
        }
      } catch (error) {
        if (error instanceof Error) {
          showNotification('error', error.message);
        } else {
          showNotification('error', 'Failed to delete customer');
        }
      } finally {
        setLoading(false);
      }
    }
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

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Customers</h1>
        <Link to="/customers/new" style={{ ...buttonStyle, textDecoration: 'none' }}>
          New Customer
        </Link>
      </div>

      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <p>No customers found. Create your first customer to get started.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Address</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td style={tdStyle}>
                  {customer.firstName} {customer.lastName}
                </td>
                <td style={tdStyle}>{customer.email}</td>
                <td style={tdStyle}>{customer.phone}</td>
                <td style={tdStyle}>{customer.address}</td>
                <td style={tdStyle}>
                  <Link
                    to={`/customers/${customer.id}`}
                    style={buttonStyle}
                  >
                    View
                  </Link>
                  <Link
                    to={`/customers/${customer.id}/edit`}
                    style={buttonStyle}
                  >
                    Edit
                  </Link>
                  <button
                    style={dangerButtonStyle}
                    onClick={() => handleDeleteCustomer(customer.id)}
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

export default CustomerList; 