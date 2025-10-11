import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { PaymentsModule } from '../payments/payments.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { SimulatorModule } from '../simulator/simulator.module';

/**
 * Main Application Module
 * 
 * Imports:
 * - ConfigModule: Loads .env files
 * - EventEmitterModule: Internal event system for decoupled architecture
 * - DatabaseModule: MongoDB connection
 * - PaymentsModule: Payment domain logic
 * - AnalyticsModule: Analytics endpoints
 * - WebsocketModule: WebSocket gateway for real-time events
 * - SimulatorModule: Payment simulator for testing
 * 
 * Architecture:
 * PaymentsService.create() 
 *   → emits 'payment.created' event
 *   → PaymentsGateway listens and broadcasts via WebSocket
 *   → Frontend receives real-time updates
 */
@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Event emitter for decoupled event-driven architecture
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    DatabaseModule,
    PaymentsModule,
    AnalyticsModule,
    WebsocketModule,
    SimulatorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }