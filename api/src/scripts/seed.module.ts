import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../database/database.module';
import { PaymentsModule } from '../payments/payments.module';

/**
 * Seed Module
 * 
 * Lightweight module for running seed scripts.
 * Includes EventEmitter so PaymentsService can be instantiated.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    EventEmitterModule.forRoot(),  // <-- add this
    PaymentsModule,
  ],
})
export class SeedModule {}
