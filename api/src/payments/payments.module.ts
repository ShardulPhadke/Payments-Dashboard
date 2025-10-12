import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentsService } from './payments.service';

/**
 * Payments Module
 * 
 * Provides:
 * - Payment schema and model registration
 * - PaymentsService for business logic
 * 
 * Exports PaymentsService so other modules can use it:
 * - AnalyticsModule (for metrics calculation)
 * - WebSocketModule (implicit via events)
 * - SimulatorModule (for generating test payments)
 * - Seed scripts
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema }
    ]),
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule { }