import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaymentStatus, PaymentMethod } from '@payment/shared-types';

/**
 * Payment Document type
 * Extends Mongoose Document with our Payment fields
 */
export type PaymentDocument = Payment & Document;

/**
 * Payment Schema
 * 
 * Core payment entity with tenant isolation.
 * All queries MUST filter by tenantId for multi-tenancy.
 * 
 * Indexes:
 * 1. { tenantId: 1, createdAt: -1 } - Main query index
 * 2. { tenantId: 1, status: 1, createdAt: -1 } - Status filtering
 * 3. { tenantId: 1, method: 1 } - Payment method analytics
 */
@Schema({ 
  timestamps: true,
  collection: 'payments',
})
export class Payment {
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, type: Number })
  amount!: number;

  @Prop({ 
    required: true, 
    enum: Object.values(PaymentMethod),
    type: String,
  })
  method!: PaymentMethod;

  @Prop({ 
    required: true, 
    enum: Object.values(PaymentStatus),
    type: String,
  })
  status!: PaymentStatus;

  // Timestamps are auto-managed by Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

/**
 * Compound indexes for efficient queries
 * These match the indexes specified in the architecture document
 */
PaymentSchema.index({ tenantId: 1, createdAt: -1 });
PaymentSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
PaymentSchema.index({ tenantId: 1, method: 1 });