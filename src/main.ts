import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import {
  EarthquakeEventItemDto,
  ErrorResponseDto,
  EventsRecentResponseDto,
  IngestBatchOkDto,
  IngestSingleOkDto,
  PredictFeaturesDto,
  PredictHistoryItemDto,
  PredictHistoryResponseDto,
  PredictRunDataDto,
  PredictRunResponseDto,
} from './docs/swagger-models';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const swagger = new DocumentBuilder()
    .setTitle('Earthquake Detection and Analyzer')
    .setDescription('REST API — ingest, events, predictions.')
    .setVersion('1.0')
    .addTag('events')
    .addTag('predict')
    .addTag('ingest')
    .addServer('/', 'This host')
    .addServer('http://localhost:6010', 'Local')
    .build();

  const document = SwaggerModule.createDocument(app, swagger, {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
    extraModels: [
      EarthquakeEventItemDto,
      EventsRecentResponseDto,
      PredictFeaturesDto,
      PredictRunDataDto,
      PredictRunResponseDto,
      PredictHistoryItemDto,
      PredictHistoryResponseDto,
      IngestSingleOkDto,
      IngestBatchOkDto,
      ErrorResponseDto,
    ],
  });

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Earthquake Detection and Analyzer',
    swaggerOptions: {
      persistAuthorization: false,
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
  });

  const port = parseInt(process.env.PORT ?? '6010', 10);
  await app.listen(port);
}
bootstrap();
