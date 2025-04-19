export type AccountType = 'checking' | 'savings' | 'creditCard';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface Account {
  id: string;
  accountNumber: string;
  customerId: string;
  type: AccountType;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description: string;
  timestamp: Date;
  toAccountId?: string; // For transfers
}

export interface TransferParams {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AppTheme {
  name: 'default' | 'dark' | 'pnc';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface DemoMode {
  enabled: boolean;
  sampleDataLoaded: boolean;
} 