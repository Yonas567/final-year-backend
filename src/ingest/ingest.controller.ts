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
  @ApiOperation({ summary: 'Ingest one sample (g)' })
  @ApiBody({
    type: IngestBodyDto,
    examples: {
      a: {
        summary: 'example',
        value: { deviceId: 'esp32-01', x: 0.02, y: 0.01, z: 0.98 },
      },
      b: {
        summary: '+ timestamp',
        value: {
          deviceId: 'esp32-01',
          x: 0.02,
          y: 0.01,
          z: 0.98,
          timestamp: '2026-01-15T04:12:33.456Z',
        },
      },
    },
  })
  @ApiOkResponse({ type: IngestSingleOkDto })
  @ApiStandardErrors()
  single(@Body() body: IngestBodyDto) {
    return this.ingest.ingestOne(body);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Ingest batch (t = unix ms)' })
  @ApiBody({
    type: IngestBatchDto,
    examples: {
      a: {
        summary: 'example',
        value: {
          deviceId: 'esp32-01',
          samples: [
            { t: 1736908800000, x: 0.02, y: 0.01, z: 0.98 },
            { t: 1736908800005, x: 0.021, y: 0.009, z: 0.981 },
          ],
        },
      },
    },
  })
  @ApiOkResponse({ type: IngestBatchOkDto })
  @ApiStandardErrors()
  batch(@Body() body: IngestBatchDto) {
    return this.ingest.ingestBatch(body);
  }
}
