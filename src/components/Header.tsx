import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const Header: React.FC = () => {
  const { theme, setTheme, demoMode, toggleDemoMode } = useApp();

  const toggleTheme = () => {
    if (theme.name === 'default') {
      setTheme({
        name: 'dark',
        primaryColor: '#f58220',
        secondaryColor: '#2c3e50',
        backgroundColor: '#121212',
        textColor: '#f5f5f5',
      });
    } else if (theme.name === 'dark') {
      setTheme({
        name: 'pnc',
        primaryColor: '#f58220',
        secondaryColor: '#1d2329',
        backgroundColor: '#f7f7f7',
        textColor: '#333333',
      });
    } else {
      setTheme({
        name: 'default',
        primaryColor: '#f58220',
        secondaryColor: '#1d2329',
        backgroundColor: '#ffffff',
        textColor: '#333333',
      });
    }
  };

  const headerStyle = {
    backgroundColor: theme.secondaryColor,
    color: '#fff',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const navStyle = {
    display: 'flex',
    gap: '1.5rem',
  };

  const logoStyle = {
    color: '#f58220',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    textDecoration: 'none',
  };

  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
  };

  const buttonStyle = {
    backgroundColor: theme.primaryColor,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    marginLeft: '0.5rem',
  };

  return (
    <header style={headerStyle}>
      <div>
        <Link to="/" style={logoStyle}>
          PNC BANK
        </Link>
      </div>
      <nav style={navStyle}>
        <Link to="/customers" style={linkStyle}>
          Customers
        </Link>
        <Link to="/accounts" style={linkStyle}>
          Accounts
        </Link>
        <Link to="/transactions" style={linkStyle}>
          Transactions
        </Link>
        <div>
          <button
            style={buttonStyle}
            onClick={toggleTheme}
            title={`Current theme: ${theme.name}`}
          >
            Theme
          </button>
          <button
            style={{
              ...buttonStyle,
              backgroundColor: demoMode.enabled ? '#28a745' : '#6c757d',
            }}
            onClick={toggleDemoMode}
          >
            {demoMode.enabled ? 'Demo Mode: ON' : 'Demo Mode: OFF'}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header; 