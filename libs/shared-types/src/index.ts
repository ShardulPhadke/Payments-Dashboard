export interface Payment {
  _id: string;
  tenantId: string;
  amount: number;
  method: string;
  status: 'success' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEvent {
  type: 'payment_received' | 'payment_failed' | 'payment_refunded';
  payment: Payment;
  timestamp: string;
}

export interface PaymentMetrics {
  totalVolume: number;
  successRate: number;
  averageAmount: number;
  peakHour: number;
  topPaymentMethod: string;
}

export interface TrendData {
  timestamp: string;
  amount: number;
  count: number;
  successRate: number;
}
