import { Module } from '@nestjs/common';
import { SimulatorService } from './simulator.service';
import { SimulatorController } from './simulator.controller';
import { PaymentsModule } from '../payments/payments.module';

/**
 * Simulator Module
 * 
 * Provides payment simulation for testing and demonstration.
 * 
 * Imports:
 * - PaymentsModule: To access PaymentsService for creating payments
 * 
 * Provides:
 * - SimulatorService: Payment generation logic
 * - SimulatorController: REST endpoints to control simulation
 */
@Module({
    imports: [PaymentsModule],
    controllers: [SimulatorController],
    providers: [SimulatorService],
    exports: [SimulatorService],
})
export class SimulatorModule { }