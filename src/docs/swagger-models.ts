import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** --- Events --- */

export class EarthquakeEventItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Server-generated UUID' })
  id!: string;

  @ApiProperty({ example: '2026-01-15T04:12:33.000Z', description: 'ISO 8601 event time' })
  time!: string;

  @ApiProperty({ example: 2.1, description: 'Magnitude (Richter-style / project convention)' })
  magnitude!: number;

  @ApiProperty({ enum: ['mild', 'moderate', 'strong'], example: 'mild' })
  level!: 'mild' | 'moderate' | 'strong';

  @ApiProperty({ example: 'Awash Valley', description: 'Human-readable region' })
  location!: string;

  @ApiProperty({ example: '8.2', description: 'Depth in km (string or number in API contract)' })
  depth!: string;

  @ApiProperty({ example: '8.921', description: 'Latitude (decimal degrees, string or number)' })
  lat!: string;

  @ApiProperty({ example: '40.102', description: 'Longitude (decimal degrees)' })
  lon!: string;
}

export class EventsRecentResponseDto {
  @ApiProperty({
    type: [EarthquakeEventItemDto],
    description: 'Newest first',
    example: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        time: '2026-01-15T04:12:33.000Z',
        magnitude: 2.1,
        level: 'mild',
        location: 'Awash Valley',
        depth: '8.2',
        lat: '8.921',
        lon: '40.102',
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        time: '2026-01-14T18:00:00.000Z',
        magnitude: 4.2,
        level: 'moderate',
        location: 'Central Rift Valley',
        depth: '12',
        lat: '9.03',
        lon: '38.75',
      },
    ],
  })
  data!: EarthquakeEventItemDto[];
}

/** --- Predict --- */

export class PredictFeaturesDto {
  @ApiProperty({ example: 1.42, description: 'STA/LTA-style ratio (heuristic feature)' })
  stalta!: number;

  @ApiProperty({ example: 0.31, description: 'P-wave proxy (0–1 scale)' })
  pWave!: number;

  @ApiProperty({ example: 0.87, description: 'Normalized energy' })
  energy!: number;

  @ApiProperty({ example: 4.2, description: 'Dominant frequency peak (Hz)' })
  freqPeak!: number;
}

export class PredictRunDataDto {
  @ApiProperty({ example: 'pred_01' })
  id!: string;

  @ApiProperty({ example: '2026-01-15T04:12:33.000Z' })
  timestamp!: string;

  @ApiProperty({ example: 34, description: 'Relative risk / probability 0–100' })
  probability!: number;

  @ApiProperty({ example: 3.8, description: 'Estimated magnitude' })
  magnitude!: number;

  @ApiProperty({ example: 81, description: 'Model confidence 0–100' })
  confidence!: number;

  @ApiProperty({ example: 'Central Rift Valley' })
  region!: string;

  @ApiProperty({ example: '9.1°N, 40.5°E ± 25km' })
  coords!: string;

  @ApiProperty({ enum: ['low', 'moderate', 'high'], example: 'moderate' })
  risk!: 'low' | 'moderate' | 'high';

  @ApiProperty({ type: PredictFeaturesDto })
  features!: PredictFeaturesDto;
}

export class PredictRunResponseDto {
  @ApiProperty({ example: true })
  ok!: true;

  @ApiProperty({ type: PredictRunDataDto })
  data!: PredictRunDataDto;
}

export class PredictHistoryItemDto {
  @ApiProperty({ example: '101' })
  id!: string;

  @ApiProperty({ example: '2026-01-15T03:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: 3.8 })
  magnitude!: number;

  @ApiProperty({ example: 34 })
  probability!: number;

  @ApiProperty({ example: 'Central Rift Valley' })
  region!: string;

  @ApiProperty({ enum: ['low', 'moderate', 'high'], example: 'moderate' })
  risk!: 'low' | 'moderate' | 'high';

  @ApiProperty({ example: 81 })
  confidence!: number;
}

export class PredictHistoryResponseDto {
  @ApiProperty({
    type: [PredictHistoryItemDto],
    example: [
      {
        id: '101',
        timestamp: '2026-01-15T03:00:00.000Z',
        magnitude: 3.8,
        probability: 34,
        region: 'Central Rift Valley',
        risk: 'moderate',
        confidence: 81,
      },
    ],
  })
  data!: PredictHistoryItemDto[];
}

/** --- Ingest --- */

export class IngestSingleOkDto {
  @ApiProperty({ example: true })
  ok!: true;

  @ApiProperty({
    example: '7b291e77-b31a-4c2d-9f0e-123456789abc',
    description: 'Created `SensorSample` id',
  })
  id!: string;
}

export class IngestBatchOkDto {
  @ApiProperty({ example: true })
  ok!: true;

  @ApiProperty({ example: 2, description: 'Number of rows inserted' })
  accepted!: number;
}

/** --- Errors (HTTP 4xx / 5xx from global filter + validation) --- */

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  ok!: false;

  @ApiProperty({
    example: 'deviceId must be a string',
    description: 'Human-readable message (validation may join multiple errors)',
  })
  error!: string;

  @ApiPropertyOptional({
    example: 'INTERNAL_ERROR',
    description: 'Optional machine-oriented code (e.g. internal errors)',
  })
  code?: string;
}
