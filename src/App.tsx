import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import Notification from './components/Notification';
import Dashboard from './pages/Dashboard';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import AccountList from './components/AccountList';
import AccountForm from './components/AccountForm';
import AccountDetail from './components/AccountDetail';
import TransactionForm from './components/TransactionForm';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Header />
          <Notification />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              
              {/* Customer Routes */}
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />
              
              {/* Account Routes */}
              <Route path="/accounts" element={<AccountList />} />
              <Route path="/accounts/new" element={<AccountForm />} />
              <Route path="/accounts/:id" element={<AccountDetail />} />
              
              {/* Transaction Routes */}
              <Route path="/accounts/:id/deposit" element={<TransactionForm />} />
              <Route path="/accounts/:id/withdraw" element={<TransactionForm />} />
              <Route path="/accounts/:id/transfer" element={<TransactionForm />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
