import { IsNotEmpty, IsString } from "class-validator";


export class StopSimulationDto {
    @IsNotEmpty()
    @IsString()
    tenantId!: string;
}