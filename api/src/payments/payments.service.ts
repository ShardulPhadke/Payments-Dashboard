import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { PaymentStatus, PaymentMethod } from '@payment/shared-types';

/**
 * DTO for creating a payment
 */
export interface CreatePaymentDto {
  tenantId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
}

/**
 * Payments Service
 * 
 * Handles all payment-related database operations.
 * All methods enforce tenant isolation.
 */
@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  /**
   * Create a new payment
   */
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = new this.paymentModel(createPaymentDto);
    return payment.save();
  }

  /**
   * Create multiple payments (bulk insert for seeding)
   */
  async createMany(payments: CreatePaymentDto[]): Promise<Payment[]> {
    return this.paymentModel.insertMany(payments);
  }

  /**
   * Find all payments for a tenant with optional filters
   */
  async findAll(
    tenantId: string,
    options?: {
      status?: PaymentStatus;
      method?: PaymentMethod;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      skip?: number;
    }
  ): Promise<Payment[]> {
    const query: any = { tenantId };

    if (options?.status) query.status = options.status;
    if (options?.method) query.method = options.method;
    if (options?.startDate || options?.endDate) {
      query.createdAt = {};
      if (options.startDate) query.createdAt.$gte = options.startDate;
      if (options.endDate) query.createdAt.$lte = options.endDate;
    }

    return this.paymentModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(options?.limit || 100)
      .skip(options?.skip || 0)
      .exec();
  }

  /**
   * Find a single payment by ID (with tenant check)
   */
  async findOne(id: string, tenantId: string): Promise<Payment | null> {
    return this.paymentModel.findOne({ _id: id, tenantId }).exec();
  }

  /**
   * Count payments for a tenant
   */
  async count(tenantId: string, status?: PaymentStatus): Promise<number> {
    const query: any = { tenantId };
    if (status) query.status = status;
    return this.paymentModel.countDocuments(query).exec();
  }

  /**
   * Delete all payments for a tenant (useful for testing)
   */
  async deleteAll(tenantId: string): Promise<number> {
    const result = await this.paymentModel.deleteMany({ tenantId }).exec();
    return result.deletedCount;
  }
}