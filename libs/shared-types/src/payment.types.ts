/**
 * Payment status enum
 */
export enum PaymentStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Payment methods enum
 */
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  UPI = 'upi',
  NET_BANKING = 'net_banking',
  WALLET = 'wallet',
}

/**
 * Core Payment interface
 */
export interface Payment {
  _id?: string;
  tenantId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Payment event types for WebSocket
 */
export type PaymentEventType = 
  | 'payment_received' 
  | 'payment_failed' 
  | 'payment_refunded';

/**
 * WebSocket payment event
 */
export interface PaymentEvent {
  type: PaymentEventType;
  payment: Payment;
  timestamp: Date;
}

/**
 * WebSocket connection status event
 */
export interface ConnectionStatusEvent {
  status: 'connected' | 'disconnected' | 'error';
  message?: string;
  timestamp: Date;
}

/**
 * Analytics metrics
 */
export interface PaymentMetrics {
  totalVolume: number;
  successRate: number;
  averageAmount: number;
  peakHour: number;
  topPaymentMethod: PaymentMethod;
  totalCount: number;
  successCount: number;
  failedCount: number;
  refundedCount: number;
}

/**
 * Trend data point
 */
export interface TrendData {
  timestamp: Date;
  amount: number;
  count: number;
  successRate: number;
}

/**
 * Analytics query periods
 */
export enum TrendPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export interface StatusCountResult {
  _id: string;
  count: number;
}