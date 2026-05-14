import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeModule } from './realtime/realtime.module';
import { EventsModule } from './events/events.module';
import { PredictModule } from './predict/predict.module';
import { IngestModule } from './ingest/ingest.module';

@Module({
  imports: [PrismaModule, RealtimeModule, EventsModule, PredictModule, IngestModule],
})
export class AppModule {}
