import React from 'react';
import { useApp } from '../contexts/AppContext';

const Notification: React.FC = () => {
  const { notification, hideNotification } = useApp();

  if (!notification.show) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return '#28a745';
      case 'error':
        return '#dc3545';
      case 'info':
      default:
        return '#17a2b8';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const notificationStyle = {
    position: 'fixed' as const,
    top: '20px',
    right: '20px',
    padding: '1rem',
    backgroundColor: getBackgroundColor(),
    color: '#fff',
    borderRadius: '4px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: '300px',
    maxWidth: '500px',
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer',
    marginLeft: '1rem',
  };

  const iconStyle = {
    marginRight: '0.75rem',
    fontSize: '1.2rem',
    fontWeight: 'bold' as const,
  };

  return (
    <div style={notificationStyle}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={iconStyle}>{getIcon()}</span>
        <div>{notification.message}</div>
      </div>
      <button style={closeButtonStyle} onClick={hideNotification}>
        ×
      </button>
    </div>
  );
};

export default Notification; 