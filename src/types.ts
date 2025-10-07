export type Product = {
  name: string;
  quantity: number;
  cost: number;
  unitPrice: number;
  photo?: string; // URL da foto do produto
};

export type Sale = {
  dateISO: string; // ISO date string
  product: string;
  quantity: number;
  totalValue: number;
  totalCost: number;
  profit: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: string;
  installments?: Installment[];
  status?: 'paid' | 'pending' | 'partial';
};

export type SaleItem = {
  product: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  totalCost: number;
  profit: number;
};

export type MultiSale = {
  dateISO: string;
  items: SaleItem[];
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: string;
  installments?: Installment[];
  status?: 'paid' | 'pending' | 'partial';
};

export type DashboardSummary = {
  totalSalesValue: number;
  totalProfit: number;
  series: { label: string; value: number }[];
};

export type Installment = {
  id: string;
  number: number;
  value: number;
  dueDate: string; // ISO date string
  paidDate?: string; // ISO date string
  status: 'paid' | 'pending' | 'overdue';
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  totalValue: number;
  pendingAmount: number;
  lastPurchase?: string; // ISO date string
  notes?: string;
};



