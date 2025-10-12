import { Injectable, Logger } from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';
import { PaymentMethod, PaymentStatus } from '@payment/shared-types';

/**
 * Configuration for a running simulation
 */
interface SimulationConfig {
    tenantId: string;
    paymentsPerMinute: number;
    intervalId: NodeJS.Timeout;
    startedAt: Date;
    paymentsSent: number;
}

/**
 * Simulator Service
 * 
 * Generates fake payment events at configurable rates for testing.
 * Useful for:
 * - Testing WebSocket real-time updates
 * - Demonstrating the dashboard
 * - Load testing
 * - Development without external payment gateway
 * 
 * Usage:
 *   POST /api/simulator/start { tenantId, paymentsPerMinute }
 *   POST /api/simulator/stop  { tenantId }
 *   GET  /api/simulator/status
 */
@Injectable()
export class SimulatorService {
    private readonly logger = new Logger(SimulatorService.name);

    /**
     * Active simulations by tenantId
     */
    private simulations: Map<string, SimulationConfig> = new Map();

    constructor(private readonly paymentsService: PaymentsService) { }

    /**
     * Start payment simulation for a tenant
     * 
     * @param tenantId - Tenant to generate payments for
     * @param paymentsPerMinute - Rate of payment generation (1-60)
     * @returns Simulation configuration
     */
    startSimulation(tenantId: string, paymentsPerMinute: number = 10): SimulationConfig {
        // Stop existing simulation if running
        if (this.simulations.has(tenantId)) {
            this.logger.warn(`Stopping existing simulation for ${tenantId}`);
            this.stopSimulation(tenantId);
        }

        // Validate rate
        if (paymentsPerMinute < 1 || paymentsPerMinute > 60) {
            throw new Error('paymentsPerMinute must be between 1 and 60');
        }

        // Calculate interval (milliseconds between payments)
        const intervalMs = Math.floor(60000 / paymentsPerMinute);

        // Create simulation config
        const config: SimulationConfig = {
            tenantId,
            paymentsPerMinute,
            startedAt: new Date(),
            paymentsSent: 0,
            intervalId: null as any, // Set below
        };

        // Start interval timer
        config.intervalId = setInterval(async () => {
            try {
                const payment = this.generateRandomPayment(tenantId);
                await this.paymentsService.create(payment);
                config.paymentsSent++;

                this.logger.debug(
                    `[${tenantId}] Generated payment #${config.paymentsSent}: $${payment.amount} (${payment.method})`
                );
            } catch (error) {
                this.logger.error(`Failed to generate payment for ${tenantId}:`, error);
            }
        }, intervalMs);

        // Store simulation
        this.simulations.set(tenantId, config);

        this.logger.log(
            `Started simulation for ${tenantId}: ${paymentsPerMinute} payments/min (every ${intervalMs}ms)`
        );

        return config;
    }

    /**
     * Stop payment simulation for a tenant
     * 
     * @param tenantId - Tenant to stop simulation for
     * @returns True if simulation was stopped, false if none was running
     */
    stopSimulation(tenantId: string): boolean {
        const config = this.simulations.get(tenantId);

        if (!config) {
            this.logger.warn(`No simulation running for ${tenantId}`);
            return false;
        }

        // Clear interval
        clearInterval(config.intervalId);

        // Remove from map
        this.simulations.delete(tenantId);

        const duration = Date.now() - config.startedAt.getTime();
        const durationMinutes = Math.floor(duration / 60000);

        this.logger.log(
            `Stopped simulation for ${tenantId}: Generated ${config.paymentsSent} payments in ${durationMinutes} minutes`
        );

        return true;
    }

    /**
     * Stop all running simulations
     */
    stopAllSimulations(): number {
        let count = 0;
        for (const tenantId of this.simulations.keys()) {
            this.stopSimulation(tenantId);
            count++;
        }
        return count;
    }

    /**
     * Get status of all running simulations
     */
    getStatus() {
        const simulations = [];

        for (const [tenantId, config] of this.simulations.entries()) {
            const runtimeMs = Date.now() - config.startedAt.getTime();
            const runtimeMinutes = Math.floor(runtimeMs / 60000);

            simulations.push({
                tenantId,
                paymentsPerMinute: config.paymentsPerMinute,
                paymentsSent: config.paymentsSent,
                startedAt: config.startedAt,
                runtimeMinutes,
                isRunning: true,
            });
        }

        return {
            activeSimulations: simulations.length,
            simulations,
        };
    }

    /**
     * Generate a random payment with realistic distribution
     */
    private generateRandomPayment(tenantId: string) {
        return {
            tenantId,
            amount: this.randomAmount(),
            method: this.randomMethod(),
            status: this.randomStatus(),
        };
    }

    /**
     * Generate random amount between $10 and $10,000
     * Skewed towards lower amounts (more realistic)
     */
    private randomAmount(): number {
        // Use exponential distribution for realistic amounts
        const random = Math.random();
        const skewed = Math.pow(random, 2); // Skew towards lower values
        return Math.floor(10 + skewed * 9990);
    }

    /**
     * Random payment method with realistic distribution
     * UPI: 35%, Credit Card: 25%, Debit: 20%, Net Banking: 10%, Wallet: 10%
     */
    private randomMethod(): PaymentMethod {
        const rand = Math.random();
        if (rand < 0.35) return PaymentMethod.UPI;
        if (rand < 0.60) return PaymentMethod.CREDIT_CARD;
        if (rand < 0.80) return PaymentMethod.DEBIT_CARD;
        if (rand < 0.90) return PaymentMethod.NET_BANKING;
        return PaymentMethod.WALLET;
    }

    /**
     * Random payment status with realistic distribution
     * Success: 85%, Failed: 12%, Refunded: 3%
     */
    private randomStatus(): PaymentStatus {
        const rand = Math.random();
        if (rand < 0.85) return PaymentStatus.SUCCESS;
        if (rand < 0.97) return PaymentStatus.FAILED;
        return PaymentStatus.REFUNDED;
    }

    /**
     * Cleanup on service destruction
     */
    onModuleDestroy() {
        this.stopAllSimulations();
    }
}