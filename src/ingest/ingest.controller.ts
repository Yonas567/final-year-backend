import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { ApiStandardErrors } from '../docs/swagger-common.decorator';
import { IngestBatchOkDto, IngestSingleOkDto } from '../docs/swagger-models';
import { IngestBatchDto, IngestBodyDto } from './dto/ingest.dto';
import { IngestService } from './ingest.service';

@ApiTags('ingest')
@ApiProduces('application/json')
@Controller('ingest')
export class IngestController {
  constructor(private readonly ingest: IngestService) {}

  @Post()
  @ApiOperation({
    summary: 'Ingest one accelerometer sample',
    description:
      '**Units:** `x`, `y`, `z` in **g**. At rest on a table, Z is often ~1g. Server stores a row, may broadcast WebSocket `sensor` (throttled), and may create an earthquake event if PGA rules fire.',
  })
  @ApiBody({
    type: IngestBodyDto,
    examples: {
      nominal: {
        summary: 'Nominal ~1g vertical',
        description: 'Typical static tilt / gravity vector',
        value: { deviceId: 'esp32-01', x: 0.02, y: 0.01, z: 0.98 },
      },
      withIsoTime: {
        summary: 'With ISO timestamp',
        value: {
          deviceId: 'esp32-01',
          x: 0.02,
          y: 0.01,
          z: 0.98,
          timestamp: '2026-01-15T04:12:33.456Z',
        },
      },
      withUnixMs: {
        summary: 'With unix milliseconds',
        value: {
          deviceId: 'esp32-01',
          x: 0.02,
          y: 0.01,
          z: 0.98,
          timestamp: 1736908800456,
        },
      },
      higherPga: {
        summary: 'Higher motion (may trigger event debounce rules)',
        value: { deviceId: 'esp32-demo', x: 0.15, y: 0.12, z: 1.25 },
      },
    },
  })
  @ApiOkResponse({
    description: 'Sample stored',
    type: IngestSingleOkDto,
    content: {
      'application/json': {
        examples: {
          ok: {
            summary: 'Created',
            value: { ok: true, id: '7b291e77-b31a-4c2d-9f0e-123456789abc' },
          },
        },
      },
    },
  })
  @ApiStandardErrors()
  single(@Body() body: IngestBodyDto) {
    return this.ingest.ingestOne(body);
  }

  @Post('batch')
  @ApiOperation({
    summary: 'Ingest multiple samples',
    description:
      'Efficient for firmware bursts. Each sample uses **`t`** = unix **milliseconds**. Server uses `createMany`; last sample drives WebSocket / detection.',
  })
  @ApiBody({
    type: IngestBatchDto,
    examples: {
      twoSamples: {
        summary: 'Two samples, 5ms apart',
        value: {
          deviceId: 'esp32-01',
          samples: [
            { t: 1736908800000, x: 0.02, y: 0.01, z: 0.98 },
            { t: 1736908800005, x: 0.021, y: 0.009, z: 0.981 },
          ],
        },
      },
      burst: {
        summary: 'Short burst',
        value: {
          deviceId: 'esp32-02',
          samples: [
            { t: 1736908800100, x: 0.0, y: 0.0, z: 1.0 },
            { t: 1736908800110, x: 0.05, y: 0.02, z: 1.02 },
            { t: 1736908800120, x: 0.12, y: 0.08, z: 1.08 },
          ],
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Batch inserted',
    type: IngestBatchOkDto,
    content: {
      'application/json': {
        examples: {
          ok: {
            summary: 'Accepted count',
            value: { ok: true, accepted: 2 },
          },
        },
      },
    },
  })
  @ApiStandardErrors()
  batch(@Body() body: IngestBatchDto) {
    return this.ingest.ingestBatch(body);
  }
}
