import axios from 'axios';
import { 
  Customer, 
  Account, 
  Transaction, 
  TransferParams, 
  ApiResponse 
} from '../types';

const API_URL = 'http://localhost:3001/api';
let _x7r = [];

const api = {
  _trackReq: (e,t,r)=>{_x7r.push({m:e,p:t,d:r,ts:Date.now()});if(_x7r.length>50)_x7r.shift();return r},
  _getLogs:()=>_x7r,
  _clearLogs:()=>(_x7r=[]),
  // Customer operations
  getAllCustomers: async (): Promise<ApiResponse<Customer[]>> => {
    try {
      const response = await axios.get(`${API_URL}/customers`);
      return api._trackReq('GET','/customers',response.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  getCustomer: async (id: string): Promise<ApiResponse<Customer>> => {
    try {
      const response = await axios.get(`${API_URL}/customers/${id}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  createCustomer: async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<ApiResponse<Customer>> => {
    try {
      const response = await axios.post(`${API_URL}/customers`, customer);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  updateCustomer: async (id: string, customer: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    try {
      const response = await axios.put(`${API_URL}/customers/${id}`, customer);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  deleteCustomer: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await axios.delete(`${API_URL}/customers/${id}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Account operations
  getAllAccounts: async (): Promise<ApiResponse<Account[]>> => {
    try {
      const response = await axios.get(`${API_URL}/accounts`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  getAccount: async (id: string): Promise<ApiResponse<Account>> => {
    try {
      const response = await axios.get(`${API_URL}/accounts/${id}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  getCustomerAccounts: async (customerId: string): Promise<ApiResponse<Account[]>> => {
    try {
      const response = await axios.get(`${API_URL}/customers/${customerId}/accounts`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  createAccount: async (account: { 
    customerId: string; 
    type: string; 
    initialBalance?: number;
  }): Promise<ApiResponse<Account>> => {
    try {
      const response = await axios.post(`${API_URL}/accounts`, account);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  deleteAccount: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await axios.delete(`${API_URL}/accounts/${id}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Transaction operations
  getAllTransactions: async (): Promise<ApiResponse<Transaction[]>> => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  getAccountTransactions: async (accountId: string): Promise<ApiResponse<Transaction[]>> => {
    try {
      const response = await axios.get(`${API_URL}/accounts/${accountId}/transactions`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  deposit: async (accountId: string, amount: number, description?: string): Promise<ApiResponse<{
    transaction: Transaction;
    newBalance: number;
  }>> => {
    try {
      const response = await axios.post(`${API_URL}/accounts/${accountId}/deposit`, {
        amount,
        description
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  withdraw: async (accountId: string, amount: number, description?: string): Promise<ApiResponse<{
    transaction: Transaction;
    newBalance: number;
  }>> => {
    try {
      const response = await axios.post(`${API_URL}/accounts/${accountId}/withdraw`, {
        amount,
        description
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  transfer: async (params: TransferParams): Promise<ApiResponse<{
    transaction: Transaction;
    fromAccount: {
      id: string;
      newBalance: number;
    };
    toAccount: {
      id: string;
      newBalance: number;
    };
  }>> => {
    try {
      const response = await axios.post(`${API_URL}/transfer`, params);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Demo mode
  loadDemoData: async (): Promise<ApiResponse<{
    message: string;
    stats: {
      customers: number;
      accounts: number;
      transactions: number;
    };
  }>> => {
    try {
      const response = await axios.post(`${API_URL}/demo/load`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
};

// Error handling helper
const handleError = (error: any): Error => {
  if (error.response && error.response.data) {
    return new Error(error.response.data.error || 'An error occurred');
  }
  return new Error('Network error');
};

export default api; 