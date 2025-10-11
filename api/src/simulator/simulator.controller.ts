import { Controller, Post, Get, Body, BadRequestException } from '@nestjs/common';
import { SimulatorService } from './simulator.service';
import { StartSimulationDto } from './dto/start-simulation.dto';
import { StopSimulationDto } from './dto/stop-simulation.dto';

/**
 * Simulator Controller
 * 
 * REST endpoints to control payment simulation.
 * 
 * Endpoints:
 * - POST /api/simulator/start  - Start generating payments
 * - POST /api/simulator/stop   - Stop generating payments
 * - POST /api/simulator/stop-all - Stop all simulations
 * - GET  /api/simulator/status - Get simulation status
 * 
 * Example usage:
 *   curl -X POST http://localhost:3000/api/simulator/start \
 *     -H "Content-Type: application/json" \
 *     -d '{"tenantId":"tenant-alpha","paymentsPerMinute":10}'
 */
@Controller('api/simulator')
export class SimulatorController {
    constructor(private readonly simulatorService: SimulatorService) { }

    /**
     * POST /api/simulator/start
     * 
     * Start payment simulation for a tenant
     * 
     * Body:
     * {
     *   "tenantId": "tenant-alpha",
     *   "paymentsPerMinute": 10  // Optional, default: 10
     * }
     * 
     * Response:
     * {
     *   "message": "Simulation started",
     *   "tenantId": "tenant-alpha",
     *   "paymentsPerMinute": 10,
     *   "startedAt": "2024-10-11T01:30:00.000Z"
     * }
     */
    @Post('start')
    startSimulation(@Body() dto: StartSimulationDto) {
        const { tenantId, paymentsPerMinute = 10 } = dto;

        // Validate input
        if (!tenantId) {
            throw new BadRequestException('tenantId is required');
        }

        if (paymentsPerMinute && (paymentsPerMinute < 1 || paymentsPerMinute > 60)) {
            throw new BadRequestException('paymentsPerMinute must be between 1 and 60');
        }

        // Start simulation
        const config = this.simulatorService.startSimulation(tenantId, paymentsPerMinute);

        return {
            message: 'Simulation started',
            tenantId: config.tenantId,
            paymentsPerMinute: config.paymentsPerMinute,
            startedAt: config.startedAt,
        };
    }

    /**
     * POST /api/simulator/stop
     * 
     * Stop payment simulation for a tenant
     * 
     * Body:
     * {
     *   "tenantId": "tenant-alpha"
     * }
     * 
     * Response:
     * {
     *   "message": "Simulation stopped",
     *   "tenantId": "tenant-alpha",
     *   "wasStopped": true
     * }
     */
    @Post('stop')
    stopSimulation(@Body() dto: StopSimulationDto) {
        const { tenantId } = dto;

        if (!tenantId) {
            throw new BadRequestException('tenantId is required');
        }

        const wasStopped = this.simulatorService.stopSimulation(tenantId);

        return {
            message: wasStopped ? 'Simulation stopped' : 'No simulation was running',
            tenantId,
            wasStopped,
        };
    }

    /**
     * POST /api/simulator/stop-all
     * 
     * Stop all running simulations
     * 
     * Response:
     * {
     *   "message": "All simulations stopped",
     *   "count": 3
     * }
     */
    @Post('stop-all')
    stopAllSimulations() {
        const count = this.simulatorService.stopAllSimulations();

        return {
            message: 'All simulations stopped',
            count,
        };
    }

    /**
     * GET /api/simulator/status
     * 
     * Get status of all running simulations
     * 
     * Response:
     * {
     *   "activeSimulations": 2,
     *   "simulations": [
     *     {
     *       "tenantId": "tenant-alpha",
     *       "paymentsPerMinute": 10,
     *       "paymentsSent": 150,
     *       "startedAt": "2024-10-11T01:30:00.000Z",
     *       "runtimeMinutes": 15,
     *       "isRunning": true
     *     }
     *   ]
     * }
     */
    @Get('status')
    getStatus() {
        return this.simulatorService.getStatus();
    }
}