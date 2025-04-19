import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Account } from '../types';
import api from '../services/api';
import { useApp } from '../contexts/AppContext';

// Type for the transaction form type
type TransactionType = 'deposit' | 'withdraw' | 'transfer';

// Validation schema for transaction form
const TransactionSchema = (type: TransactionType) => {
  const baseSchema = {
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .typeError('Amount must be a number'),
    description: Yup.string().required('Description is required'),
  };

  if (type === 'transfer') {
    return Yup.object().shape({
      ...baseSchema,
      toAccountId: Yup.string().required('Destination account is required'),
    });
  }

  return Yup.object().shape(baseSchema);
};

const TransactionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setLoading, showNotification } = useApp();
  
  const [account, setAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Determine transaction type from URL
  const transactionType: TransactionType = 
    location.pathname.includes('/deposit') ? 'deposit' : 
    location.pathname.includes('/withdraw') ? 'withdraw' : 'transfer';

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Fetch the current account
        const accountResponse = await api.getAccount(id);
        if (accountResponse.success && accountResponse.data) {
          setAccount(accountResponse.data);
        } else {
          showNotification('error', 'Failed to load account');
          navigate('/accounts');
          return;
        }

        // If this is a transfer, fetch all accounts for the dropdown
        if (transactionType === 'transfer') {
          const accountsResponse = await api.getAllAccounts();
          if (accountsResponse.success && accountsResponse.data) {
            // Filter out the current account
            setAccounts(accountsResponse.data.filter(a => a.id !== id));
          } else {
            showNotification('error', 'Failed to load accounts');
          }
        }
      } catch (error) {
        showNotification('error', 'An error occurred while loading data');
        navigate('/accounts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, showNotification, transactionType]);

  const handleSubmit = async (values: any) => {
    if (!id || !account) return;

    setLoading(true);
    try {
      let response;
      if (transactionType === 'deposit') {
        response = await api.deposit(id, values.amount, values.description);
      } else if (transactionType === 'withdraw') {
        response = await api.withdraw(id, values.amount, values.description);
      } else {
        // Transfer
        response = await api.transfer({
          fromAccountId: id,
          toAccountId: values.toAccountId,
          amount: values.amount,
          description: values.description,
        });
      }

      if (response.success) {
        const action = transactionType === 'deposit' ? 'deposited' : 
                       transactionType === 'withdraw' ? 'withdrawn' : 'transferred';
        showNotification('success', `Successfully ${action} ${values.amount}`);
        navigate(`/accounts/${id}`);
      } else {
        showNotification('error', response.error || `Failed to ${transactionType}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        showNotification('error', error.message);
      } else {
        showNotification('error', `An error occurred during the ${transactionType}`);
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
    backgroundColor: 
      transactionType === 'deposit' ? '#28a745' : 
      transactionType === 'withdraw' ? '#17a2b8' : 
      theme.primaryColor,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading || !account) {
    return (
      <div style={containerStyle}>
        <h1>Loading account...</h1>
      </div>
    );
  }

  const initialValues = {
    amount: '',
    description: '',
    toAccountId: accounts.length > 0 ? accounts[0].id : '',
  };

  const getPageTitle = () => {
    const actionText = 
      transactionType === 'deposit' ? 'Deposit to' : 
      transactionType === 'withdraw' ? 'Withdraw from' : 
      'Transfer from';
    
    return `${actionText} Account ${account.accountNumber}`;
  };

  return (
    <div style={containerStyle}>
      <h1>{getPageTitle()}</h1>
      <div style={formStyle}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Account Details</h3>
          <p><strong>Account Number:</strong> {account.accountNumber}</p>
          <p><strong>Type:</strong> {account.type}</p>
          <p><strong>Current Balance:</strong> {formatCurrency(account.balance)}</p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={TransactionSchema(transactionType)}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div style={inputGroupStyle}>
                <label htmlFor="amount" style={labelStyle}>
                  Amount
                </label>
                <Field
                  id="amount"
                  name="amount"
                  type="number"
                  style={inputStyle}
                  min="0.01"
                  step="0.01"
                />
                <ErrorMessage
                  name="amount"
                  component="div"
                  style={errorStyle}
                />
              </div>

              <div style={inputGroupStyle}>
                <label htmlFor="description" style={labelStyle}>
                  Description
                </label>
                <Field
                  id="description"
                  name="description"
                  type="text"
                  style={inputStyle}
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  style={errorStyle}
                />
              </div>

              {transactionType === 'transfer' && (
                <div style={inputGroupStyle}>
                  <label htmlFor="toAccountId" style={labelStyle}>
                    Destination Account
                  </label>
                  <Field
                    id="toAccountId"
                    name="toAccountId"
                    as="select"
                    style={inputStyle}
                  >
                    {accounts.length === 0 ? (
                      <option value="">No accounts available</option>
                    ) : (
                      accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.accountNumber} ({account.type})
                        </option>
                      ))
                    )}
                  </Field>
                  <ErrorMessage
                    name="toAccountId"
                    component="div"
                    style={errorStyle}
                  />
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  style={buttonStyle}
                  disabled={isSubmitting || (transactionType === 'transfer' && accounts.length === 0)}
                >
                  {isSubmitting ? 'Processing...' : 
                    transactionType === 'deposit' ? 'Deposit' :
                    transactionType === 'withdraw' ? 'Withdraw' : 'Transfer'}
                </button>
                <button
                  type="button"
                  style={cancelButtonStyle}
                  onClick={() => navigate(`/accounts/${id}`)}
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

export default TransactionForm; 