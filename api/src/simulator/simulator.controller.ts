import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { SimulatorService } from './simulator.service';
import { StartSimulationDto } from './dto/start-simulation.dto';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

/**
 * Simulator Controller
 * 
 * REST endpoints to control payment simulation.
 * All endpoints require X-Tenant-Id header.
 * 
 * Endpoints:
 * - POST /api/simulator/start  - Start generating payments
 * - POST /api/simulator/stop   - Stop generating payments
 * - POST /api/simulator/stop-all - Stop all simulations (no guard)
 * - GET  /api/simulator/status - Get simulation status (no guard)
 * 
 * Example usage:
 *   curl -X POST http://localhost:3333/api/simulator/start \
 *     -H "Content-Type: application/json" \
 *     -H "X-Tenant-Id: tenant-alpha" \
 *     -d '{"paymentsPerMinute":10}'
 */
@Controller('api/simulator')
export class SimulatorController {
    constructor(private readonly simulatorService: SimulatorService) { }

    /**
     * POST /api/simulator/start
     * 
     * Start payment simulation for the authenticated tenant
     * 
     * Headers (required):
     * - X-Tenant-Id: Tenant identifier
     * 
     * Body:
     * {
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
    @UseGuards(TenantGuard)
    startSimulation(
        @TenantId() tenantId: string,  // Extracted from X-Tenant-Id header
        @Body() dto: StartSimulationDto
    ) {
        const { paymentsPerMinute = 10 } = dto;

        // Start simulation for the authenticated tenant
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
     * Stop payment simulation for the authenticated tenant
     * 
     * Headers (required):
     * - X-Tenant-Id: Tenant identifier
     * 
     * Response:
     * {
     *   "message": "Simulation stopped",
     *   "tenantId": "tenant-alpha",
     *   "wasStopped": true
     * }
     */
    @Post('stop')
    @UseGuards(TenantGuard)
    stopSimulation(@TenantId() tenantId: string) {
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
     * Stop all running simulations (admin operation - no tenant guard)
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
     * Get status of all running simulations (admin operation - no tenant guard)
     * 
     * Response:
     * {
     *   "activeSimulations": 2,
     *   "simulations": [...]
     * }
     */
    @Get('status')
    getStatus() {
        return this.simulatorService.getStatus();
    }
}