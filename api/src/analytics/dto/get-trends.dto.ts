import { IsEnum } from 'class-validator';

export class GetTrendsDto {
    @IsEnum(['day', 'week', 'month'])
    period!: 'day' | 'week' | 'month';
}
