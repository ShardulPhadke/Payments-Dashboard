import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';

/**
 * Tenant Guard
 * 
 * Validates that every request includes a valid X-Tenant-Id header.
 * This guard enforces multi-tenant isolation at the API level.
 * 
 * How it works:
 * 1. Extracts X-Tenant-Id from request headers
 * 2. Validates it exists and is not empty
 * 3. Attaches tenantId to request object for use in controllers
 * 4. Rejects requests without valid tenant ID
 * 
 * Usage:
 *   // Apply to entire controller
 *   @UseGuards(TenantGuard)
 *   @Controller('analytics')
 *   export class AnalyticsController { ... }
 * 
 *   // Or apply to specific route
 *   @UseGuards(TenantGuard)
 *   @Get('metrics')
 *   async getMetrics() { ... }
 * 
 * Security Notes:
 * - This is a simple header-based guard (MVP)
 * - For production, upgrade to JWT-based validation
 * - Currently trusts the X-Tenant-Id header (no cryptographic verification)
 */
@Injectable()
export class TenantGuard implements CanActivate {
    private readonly logger = new Logger(TenantGuard.name);

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        // Extract tenant ID from header
        const tenantId = request.headers['x-tenant-id'] as string;

        // Validate tenant ID exists
        if (!tenantId || tenantId.trim() === '') {
            this.logger.warn(
                `Request rejected: Missing or empty X-Tenant-Id header | Path: ${request.path}`
            );
            throw new UnauthorizedException(
                'X-Tenant-Id header is required. Please provide a valid tenant identifier.'
            );
        }

        // Additional validation: check format (optional)
        // For example, ensure it follows a pattern like "tenant-*"
        if (!this.isValidTenantIdFormat(tenantId)) {
            this.logger.warn(
                `Request rejected: Invalid X-Tenant-Id format: ${tenantId} | Path: ${request.path}`
            );
            throw new UnauthorizedException(
                'X-Tenant-Id header has invalid format. Expected format: tenant-{name}'
            );
        }

        // Attach tenant ID to request for controller access
        request.tenantId = tenantId;

        // Log successful validation (debug level)
        this.logger.debug(
            `Request authorized: Tenant ${tenantId} | Path: ${request.path}`
        );

        return true;
    }

    /**
     * Validate tenant ID format
     * 
     * Current rule: Must start with "tenant-" followed by alphanumeric characters
     * Adjust this regex based on your tenant naming convention
     */
    private isValidTenantIdFormat(tenantId: string): boolean {
        // Pattern: tenant-{alphanumeric}
        const pattern = /^tenant-[a-zA-Z0-9-]+$/;
        return pattern.test(tenantId);
    }
}
