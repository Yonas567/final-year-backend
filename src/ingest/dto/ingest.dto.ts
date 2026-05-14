import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class IngestBodyDto {
  @ApiProperty({ example: 'esp32-01' })
  @IsString()
  deviceId!: string;

  @ApiProperty({ example: 0.02, description: 'Acceleration in g' })
  @IsNumber()
  @Min(-50)
  @Max(50)
  x!: number;

  @ApiProperty({ example: 0.01 })
  @IsNumber()
  @Min(-50)
  @Max(50)
  y!: number;

  @ApiProperty({ example: 0.98 })
  @IsNumber()
  @Min(-50)
  @Max(50)
  z!: number;

  @ApiPropertyOptional({ description: 'ISO 8601 string or unix milliseconds', example: '2026-01-15T04:12:33.456Z' })
  @IsOptional()
  timestamp?: string | number;
}

export class BatchSampleDto {
  @ApiProperty({ example: 1736908800000, description: 'Unix ms' })
  @IsNumber()
  t!: number;

  @ApiProperty({ example: 0.02 })
  @IsNumber()
  @Min(-50)
  @Max(50)
  x!: number;

  @ApiProperty({ example: 0.01 })
  @IsNumber()
  @Min(-50)
  @Max(50)
  y!: number;

  @ApiProperty({ example: 0.98 })
  @IsNumber()
  @Min(-50)
  @Max(50)
  z!: number;
}

export class IngestBatchDto {
  @ApiProperty({ example: 'esp32-01' })
  @IsString()
  deviceId!: string;

  @ApiProperty({ type: [BatchSampleDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BatchSampleDto)
  samples!: BatchSampleDto[];
}
