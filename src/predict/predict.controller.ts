import { Body, Controller, DefaultValuePipe, Get, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiStandardErrors } from '../docs/swagger-common.decorator';
import { PredictHistoryResponseDto, PredictRunResponseDto } from '../docs/swagger-models';
import { PredictBodyDto } from './dto/predict-body.dto';
import { PredictService } from './predict.service';

@ApiTags('predict')
@ApiProduces('application/json')
@Controller('predict')
export class PredictController {
  constructor(private readonly predict: PredictService) {}

  @Post()
  @ApiOperation({
    summary: 'Run one prediction (heuristic)',
    description:
      'Reads recent `SensorSample` rows (optionally filtered by `deviceId`) inside `windowSeconds`, computes heuristic features, persists a `PredictionRun`, returns it. **Body may be `{}`.** If there are no samples yet, the service still returns a plausible synthetic-ish row for demos.',
  })
  @ApiBody({
    type: PredictBodyDto,
    required: false,
    examples: {
      empty: {
        summary: 'Empty body (defaults)',
        description: 'Uses all devices, window 60s',
        value: {},
      },
      defaults: {
        summary: 'Explicit defaults',
        value: { windowSeconds: 60 },
      },
      deviceWindow: {
        summary: 'One device + longer window',
        value: { deviceId: 'esp32-01', windowSeconds: 120 },
      },
      shortWindow: {
        summary: 'Minimum window (10s)',
        value: { deviceId: 'esp32-01', windowSeconds: 10 },
      },
    },
  })
  @ApiOkResponse({
    description: 'Heuristic prediction saved and returned',
    type: PredictRunResponseDto,
    content: {
      'application/json': {
        examples: {
          sample: {
            summary: 'Typical 200',
            value: {
              ok: true,
              data: {
                id: 'pred_01',
                timestamp: '2026-01-15T04:12:33.000Z',
                probability: 34,
                magnitude: 3.8,
                confidence: 81,
                region: 'Central Rift Valley',
                coords: '9.1°N, 40.5°E ± 25km',
                risk: 'moderate',
                features: {
                  stalta: 1.42,
                  pWave: 0.31,
                  energy: 0.87,
                  freqPeak: 4.2,
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiStandardErrors()
  run(@Body(new DefaultValuePipe({})) body: PredictBodyDto) {
    return this.predict.run(body.deviceId, body.windowSeconds ?? 60);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Recent prediction runs',
    description: 'Newest `PredictionRun` rows first (subset of fields for list UIs).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Max rows (default **10**, capped at **100**)',
    example: 10,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
  })
  @ApiOkResponse({
    description: 'History list',
    type: PredictHistoryResponseDto,
    content: {
      'application/json': {
        examples: {
          oneRow: {
            summary: 'Single row',
            value: {
              data: [
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
            },
          },
          empty: {
            summary: 'No predictions yet',
            value: { data: [] },
          },
        },
      },
    },
  })
  @ApiStandardErrors()
  history(@Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 10;
    return this.predict.history(Number.isFinite(n) ? n : 10);
  }
}
