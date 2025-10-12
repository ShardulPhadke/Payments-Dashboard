import { IsOptional, IsNumber, Min, Max } from 'class-validator';

/**
 * DTO for POST /api/simulator/start
 * 
 * the X-Tenant-Id header (validated by TenantGuard)
 */
export class StartSimulationDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(60)
    paymentsPerMinute?: number;
}
