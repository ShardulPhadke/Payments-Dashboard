import { IsOptional, IsDateString } from 'class-validator';

/**
 * DTO for GET /api/analytics/metrics
 * 
 * Note: tenantId is no longer in the DTO because it comes from
 * the X-Tenant-Id header (validated by TenantGuard)
 */
export class GetMetricsDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}
