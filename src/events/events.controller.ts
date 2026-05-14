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
  @ApiOperation({ summary: 'Recent earthquake events' })
  @ApiQuery({
    name: 'n',
    required: false,
    example: 20,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  })
  @ApiOkResponse({ type: EventsRecentResponseDto })
  @ApiStandardErrors()
  async recent(@Query('n') n?: string) {
    const parsed = n ? parseInt(n, 10) : 20;
    return this.events.recent(Number.isFinite(parsed) ? parsed : 20);
  }
}
