import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Customer, AccountType } from '../types';
import api from '../services/api';
import { useApp } from '../contexts/AppContext';

// Validation schema for the account form
const AccountSchema = Yup.object().shape({
  customerId: Yup.string().required('Customer is required'),
  type: Yup.string().required('Account type is required'),
  initialBalance: Yup.number()
    .min(0, 'Initial balance must be at least 0')
    .typeError('Initial balance must be a number'),
});

const AccountForm: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setLoading, showNotification } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await api.getAllCustomers();
        if (response.success && response.data) {
          setCustomers(response.data);
        } else {
          showNotification('error', 'Failed to load customers');
        }
      } catch (error) {
        showNotification('error', 'Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [showNotification]);

  const handleSubmit = async (values: {
    customerId: string;
    type: AccountType;
    initialBalance: number;
  }) => {
    setLoading(true);
    try {
      const response = await api.createAccount({
        customerId: values.customerId,
        type: values.type,
        initialBalance: values.initialBalance,
      });

      if (response.success) {
        showNotification('success', 'Account created successfully');
        navigate('/accounts');
      } else {
        showNotification('error', response.error || 'Failed to create account');
      }
    } catch (error) {
      if (error instanceof Error) {
        showNotification('error', error.message);
      } else {
        showNotification('error', 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    padding: '1rem',
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    minHeight: 'calc(100vh - 64px)',
  };

  const formStyle = {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '700px',
    margin: '0 auto',
  };

  const inputGroupStyle = {
    marginBottom: '1rem',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold' as const,
    color: theme.textColor,
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  };

  const errorStyle = {
    color: '#dc3545',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  };

  const buttonStyle = {
    backgroundColor: theme.primaryColor,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
    marginRight: '0.5rem',
  };

  const cancelButtonStyle = {
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <h1>Loading customers...</h1>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div style={containerStyle}>
        <h1>Create Account</h1>
        <div style={formStyle}>
          <p>
            No customers found. Please create a customer first before creating an account.
          </p>
          <button
            style={buttonStyle}
            onClick={() => navigate('/customers/new')}
          >
            Create a Customer
          </button>
          <button
            style={cancelButtonStyle}
            onClick={() => navigate('/accounts')}
          >
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1>Create Account</h1>
      <div style={formStyle}>
        <Formik
          initialValues={{
            customerId: customers[0].id,
            type: 'checking' as AccountType,
            initialBalance: 0,
          }}
          validationSchema={AccountSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div style={inputGroupStyle}>
                <label htmlFor="customerId" style={labelStyle}>
                  Customer
                </label>
                <Field
                  id="customerId"
                  name="customerId"
                  as="select"
                  style={inputStyle}
                >
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} ({customer.email})
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="customerId"
                  component="div"
                  style={errorStyle}
                />
              </div>

              <div style={inputGroupStyle}>
                <label htmlFor="type" style={labelStyle}>
                  Account Type
                </label>
                <Field
                  id="type"
                  name="type"
                  as="select"
                  style={inputStyle}
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="creditCard">Credit Card</option>
                </Field>
                <ErrorMessage
                  name="type"
                  component="div"
                  style={errorStyle}
                />
              </div>

              <div style={inputGroupStyle}>
                <label htmlFor="initialBalance" style={labelStyle}>
                  Initial Balance
                </label>
                <Field
                  id="initialBalance"
                  name="initialBalance"
                  type="number"
                  style={inputStyle}
                  min="0"
                  step="0.01"
                />
                <ErrorMessage
                  name="initialBalance"
                  component="div"
                  style={errorStyle}
                />
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  style={buttonStyle}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
                <button
                  type="button"
                  style={cancelButtonStyle}
                  onClick={() => navigate('/accounts')}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AccountForm; 