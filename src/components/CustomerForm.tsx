import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Customer } from '../types';
import api from '../services/api';
import { useApp } from '../contexts/AppContext';

// Validation schema for the customer form
const CustomerSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Address is required'),
});

const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, setLoading, showNotification } = useApp();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const fetchCustomer = async () => {
        setIsLoading(true);
        try {
          const response = await api.getCustomer(id);
          if (response.success && response.data) {
            setCustomer(response.data);
          } else {
            showNotification('error', 'Failed to load customer');
            navigate('/customers');
          }
        } catch (error) {
          showNotification('error', 'Failed to load customer');
          navigate('/customers');
        } finally {
          setIsLoading(false);
        }
      };

      fetchCustomer();
    }
  }, [id, isEditMode, navigate, showNotification]);

  const handleSubmit = async (values: Omit<Customer, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      if (isEditMode && customer) {
        const response = await api.updateCustomer(id, values);
        if (response.success) {
          showNotification('success', 'Customer updated successfully');
          navigate(`/customers/${id}`);
        } else {
          showNotification('error', response.error || 'Failed to update customer');
        }
      } else {
        const response = await api.createCustomer(values);
        if (response.success) {
          showNotification('success', 'Customer created successfully');
          navigate('/customers');
        } else {
          showNotification('error', response.error || 'Failed to create customer');
        }
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

  if (isEditMode && isLoading) {
    return (
      <div style={containerStyle}>
        <h1>Loading customer...</h1>
      </div>
    );
  }

  const initialValues = isEditMode && customer
    ? {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      }
    : {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
      };

  return (
    <div style={containerStyle}>
      <h1>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h1>
      <div style={formStyle}>
        <Formik
          initialValues={initialValues}
          validationSchema={CustomerSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form>
              <div style={inputGroupStyle}>
                <label htmlFor="firstName" style={labelStyle}>
                  First Name
                </label>
                <Field
                  id="firstName"
                  name="firstName"
                  type="text"
                  style={inputStyle}
                />
                <ErrorMessage
                  name="firstName"
                  component="div"
                  style={errorStyle}
                />
              </div>

              <div style={inputGroupStyle}>
                <label htmlFor="lastName" style={labelStyle}>
                  Last Name
                </label>
                <Field
                  id="lastName"
                  name="lastName"
                  type="text"
                  style={inputStyle}
                />
                <ErrorMessage
                  name="lastName"
                  component="div"
                  style={errorStyle}
                />
              </div>

              <div style={inputGroupStyle}>
                <label htmlFor="email" style={labelStyle}>
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  style={inputStyle}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  style={errorStyle}
                />
              </div>

              <div style={inputGroupStyle}>
                <label htmlFor="phone" style={labelStyle}>
                  Phone
                </label>
                <Field
                  id="phone"
                  name="phone"
                  type="text"
                  style={inputStyle}
                />
                <ErrorMessage
                  name="phone"
                  component="div"
                  style={errorStyle}
                />
              </div>

              <div style={inputGroupStyle}>
                <label htmlFor="address" style={labelStyle}>
                  Address
                </label>
                <Field
                  id="address"
                  name="address"
                  type="text"
                  style={inputStyle}
                />
                <ErrorMessage
                  name="address"
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
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
                <button
                  type="button"
                  style={cancelButtonStyle}
                  onClick={() => navigate('/customers')}
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

export default CustomerForm; 