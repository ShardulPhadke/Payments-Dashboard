import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class GetTrendsDto {
    @IsNotEmpty()
    @IsString()
    tenantId!: string;

    @IsEnum(['day', 'week', 'month'])
    period!: 'day' | 'week' | 'month';
}
