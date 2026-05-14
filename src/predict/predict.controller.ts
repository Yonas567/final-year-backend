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
  @ApiOperation({ summary: 'Run prediction' })
  @ApiBody({
    type: PredictBodyDto,
    required: false,
    examples: {
      empty: { summary: '{}', value: {} },
      opts: { summary: 'device + window', value: { deviceId: 'esp32-01', windowSeconds: 120 } },
    },
  })
  @ApiOkResponse({ type: PredictRunResponseDto })
  @ApiStandardErrors()
  run(@Body(new DefaultValuePipe({})) body: PredictBodyDto) {
    return this.predict.run(body.deviceId, body.windowSeconds ?? 60);
  }

  @Get('history')
  @ApiOperation({ summary: 'Prediction history' })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
  })
  @ApiOkResponse({ type: PredictHistoryResponseDto })
  @ApiStandardErrors()
  history(@Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 10;
    return this.predict.history(Number.isFinite(n) ? n : 10);
  }
}
