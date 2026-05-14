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
    .setTitle('SeismoAI API')
    .setDescription(
      [
        '**SeismoAI** — Ethiopia-focused earthquake monitoring: ingest accelerometer samples, list events, run heuristic predictions.',
        '',
        '### Authentication',
        '**None.** Do not configure Bearer tokens or API keys in Swagger. All HTTP routes are open.',
        '',
        '### CORS',
        '**Open.** Browsers may call this API from any origin during development and demos.',
        '',
        '### Base URL',
        '- HTTP JSON API: **`/api`** (e.g. `GET /api/events/recent`).',
        '- **Swagger UI:** `/docs` (this page).',
        '- **OpenAPI JSON:** `/docs-json` (import into Postman / Insomnia).',
        '',
        '### Suggested “happy path” to test',
        '1. **Ingest** — `POST /api/ingest` with example *Nominal ~1g* (or batch).',
        '2. **Predict** — `POST /api/predict` with `{}` or `{ "windowSeconds": 60 }`.',
        '3. **History** — `GET /api/predict/history?limit=5`.',
        '4. **Events** — `GET /api/events/recent?n=10` (may be empty until PGA thresholds create events).',
        '',
        '### WebSocket (live, not in Swagger)',
        'Connect to **`ws://<host>:<port>/ws`** (same host as the API, path `/ws`).',
        'Text frames, one JSON object per message:',
        '',
        '```json',
        '{ "type": "sensor", "data": { "x": 0.02, "y": 0.01, "z": 0.98, "magnitude": 0.98, "pga": 0.02, "level": "none", "deviceId": "esp32-01" } }',
        '```',
        '',
        '```json',
        '{ "type": "alert", "data": { "id": "…", "time": "2026-01-15T04:12:33.000Z", "magnitude": 2.1, "level": "mild", "location": "Awash Valley", "depth": "10", "lat": "9.03", "lon": "38.75" } }',
        '```',
        '',
        'Units: acceleration **`x,y,z`** in **g** (Earth gravity ≈ 1g on Z at rest).',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addTag('events', 'Earthquake events persisted when detection rules fire')
    .addTag('predict', 'Heuristic prediction runs from recent `SensorSample` rows')
    .addTag('ingest', 'Single or batch accelerometer samples; broadcasts `sensor` on WebSocket')
    .addServer('/', 'Same origin as Swagger (recommended)')
    .addServer('http://localhost:6010', 'Local dev (default app port)')
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
    customSiteTitle: 'SeismoAI — API docs',
    swaggerOptions: {
      persistAuthorization: false,
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
    },
  });

  const port = parseInt(process.env.PORT ?? '6010', 10);
  await app.listen(port);
}
bootstrap();
