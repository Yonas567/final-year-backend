import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class PredictBodyDto {
  @ApiPropertyOptional({ example: 'esp32-01' })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional({ description: 'Analysis window in seconds', example: 60, minimum: 10, maximum: 600 })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(600)
  windowSeconds?: number;
}
