import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiStandardErrors } from '../docs/swagger-common.decorator';
import { EventsRecentResponseDto } from '../docs/swagger-models';
import { EventsService } from './events.service';

@ApiTags('events')
@ApiProduces('application/json')
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get('recent')
  @ApiOperation({
    summary: 'Latest earthquake events',
    description:
      'Returns up to `n` newest events (`time` descending). Use after ingest + detection to see persisted quakes. Empty `data` is normal on a fresh database.',
  })
  @ApiQuery({
    name: 'n',
    required: false,
    description: 'Max items (default **20**, capped at **100**)',
    example: 20,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  })
  @ApiOkResponse({
    description: 'List wrapper',
    type: EventsRecentResponseDto,
    content: {
      'application/json': {
        examples: {
          populated: {
            summary: 'Two events',
            value: {
              data: [
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
            },
          },
          empty: {
            summary: 'No events yet',
            value: { data: [] },
          },
        },
      },
    },
  })
  @ApiStandardErrors()
  async recent(@Query('n') n?: string) {
    const parsed = n ? parseInt(n, 10) : 20;
    return this.events.recent(Number.isFinite(parsed) ? parsed : 20);
  }
}
