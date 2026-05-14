import { Module } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { IngestController } from './ingest.controller';
import { RealtimeModule } from '../realtime/realtime.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [RealtimeModule, EventsModule],
  controllers: [IngestController],
  providers: [IngestService],
})
export class IngestModule {}
