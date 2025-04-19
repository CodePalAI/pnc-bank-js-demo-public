import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AppTheme, DemoMode } from '../types';

interface AppContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  demoMode: DemoMode;
  setDemoMode: (demoMode: DemoMode) => void;
  toggleDemoMode: () => void;
  loadDemoData: () => Promise<void>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  notification: {
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  };
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  hideNotification: () => void;
}

// Default theme values
const defaultTheme: AppTheme = {
  name: 'default',
  primaryColor: '#f58220', // PNC Orange
  secondaryColor: '#1d2329', // PNC Dark Blue
  backgroundColor: '#ffffff',
  textColor: '#333333',
};

// Dark theme
const darkTheme: AppTheme = {
  name: 'dark',
  primaryColor: '#f58220', // PNC Orange
  secondaryColor: '#2c3e50',
  backgroundColor: '#121212',
  textColor: '#f5f5f5',
};

// PNC theme
const pncTheme: AppTheme = {
  name: 'pnc',
  primaryColor: '#f58220', // PNC Orange
  secondaryColor: '#1d2329', // PNC Dark Blue
  backgroundColor: '#f7f7f7',
  textColor: '#333333',
};

const themes = {
  default: defaultTheme,
  dark: darkTheme,
  pnc: pncTheme,
};

// Default demo mode values
const defaultDemoMode: DemoMode = {
  enabled: false,
  sampleDataLoaded: false,
};

// Create the context with default values
const AppContext = createContext<AppContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  demoMode: defaultDemoMode,
  setDemoMode: () => {},
  toggleDemoMode: () => {},
  loadDemoData: async () => {},
  loading: false,
  setLoading: () => {},
  notification: {
    show: false,
    type: 'info',
    message: '',
  },
  showNotification: () => {},
  hideNotification: () => {},
});

interface AppProviderProps {
  children: ReactNode;
}

// Create provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(defaultTheme);
  const [demoMode, setDemoMode] = useState<DemoMode>(defaultDemoMode);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState({
    show: false,
    type: 'info' as 'success' | 'error' | 'info',
    message: '',
  });

  const toggleDemoMode = () => {
    setDemoMode(prev => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  const loadDemoData = async () => {
    setLoading(true);
    try {
      // Will be implemented to call the API
      setDemoMode(prev => ({
        ...prev,
        sampleDataLoaded: true,
      }));
      
      showNotification('success', 'Demo data loaded successfully');
    } catch (error) {
      showNotification('error', 'Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({
      show: true,
      type,
      message,
    });

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      hideNotification();
    }, 5000);
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      show: false,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        demoMode,
        setDemoMode,
        toggleDemoMode,
        loadDemoData,
        loading,
        setLoading,
        notification,
        showNotification,
        hideNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useApp = () => useContext(AppContext);

export default AppContext; 