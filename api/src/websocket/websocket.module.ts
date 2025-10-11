import { Module } from '@nestjs/common';
import { PaymentsGateway } from './payment.gateway';

/**
 * WebSocket Module
 * 
 * Provides WebSocket gateway for real-time payment events.
 * 
 * The gateway listens to 'payment.created' events emitted by
 * PaymentsService and broadcasts them to connected clients.
 */
@Module({
  providers: [PaymentsGateway],
  exports: [PaymentsGateway],
})
export class WebsocketModule {}