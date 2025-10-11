import { IsOptional, IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class StartSimulationDto {
    @IsString()
    @IsNotEmpty()
    tenantId!: string;

    @IsNumber()
    @IsOptional()
    paymentsPerMinute?: number;
} 