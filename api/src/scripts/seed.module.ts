import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { PaymentsModule } from '../payments/payments.module';

/**
 * Seed Module
 * 
 * Lightweight module for running seed scripts.
 * Only imports what's needed for database operations.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    PaymentsModule,
  ],
})
export class SeedModule {}
