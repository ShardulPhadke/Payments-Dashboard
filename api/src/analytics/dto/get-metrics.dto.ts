import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class GetMetricsDto {
    @IsString()
    @IsNotEmpty()
    tenantId!: string;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;
}