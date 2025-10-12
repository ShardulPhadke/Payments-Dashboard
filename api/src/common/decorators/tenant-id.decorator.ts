import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * TenantId Decorator
 * 
 * Extracts the validated tenantId from the request.
 * Must be used with TenantGuard to ensure tenantId is validated.
 * 
 * Usage:
 *   @UseGuards(TenantGuard)
 *   @Get('metrics')
 *   async getMetrics(@TenantId() tenantId: string) {
 *     // tenantId is already validated by guard
 *   }
 * 
 * How it works:
 * 1. TenantGuard validates the tenant and attaches it to request.tenantId
 * 2. This decorator extracts request.tenantId
 * 3. Controller method receives validated tenantId
 */
export const TenantId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.tenantId;
    },
);
