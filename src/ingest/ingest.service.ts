import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { EventsService } from '../events/events.service';
import { alertLevelFromPga, pgaProxyG, vectorMagnitudeG } from '../lib/seismo';
import { IngestBatchDto, IngestBodyDto } from './dto/ingest.dto';

@Injectable()
export class IngestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: RealtimeGateway,
    private readonly events: EventsService,
  ) {}

  parseTime(ts: string | number | undefined): Date {
    if (ts === undefined || ts === null) return new Date();
    if (typeof ts === 'number') return new Date(ts);
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }

  async ingestOne(dto: IngestBodyDto) {
    const t = this.parseTime(dto.timestamp);
    const mag = vectorMagnitudeG(dto.x, dto.y, dto.z);
    const pga = pgaProxyG(dto.x, dto.y, dto.z);
    const row = await this.prisma.sensorSample.create({
      data: {
        deviceId: dto.deviceId,
        timestamp: t,
        x: dto.x,
        y: dto.y,
        z: dto.z,
        magnitude: mag,
        pga,
      },
    });
    const level = alertLevelFromPga(pga);
    this.gateway.broadcastSensor(dto.deviceId, {
      x: dto.x,
      y: dto.y,
      z: dto.z,
      magnitude: mag,
      pga,
      level,
      deviceId: dto.deviceId,
    });
    void this.events.maybeCreateFromShake(dto.deviceId, pga, mag, t);
    return { ok: true as const, id: row.id };
  }

  async ingestBatch(dto: IngestBatchDto) {
    type Snap = {
      x: number;
      y: number;
      z: number;
      mag: number;
      pga: number;
      level: string;
      t: Date;
    };
    const data: Array<{
      deviceId: string;
      timestamp: Date;
      x: number;
      y: number;
      z: number;
      magnitude: number;
      pga: number;
    }> = [];
    let last: Snap | undefined;
    for (const s of dto.samples) {
      const ts = this.parseTime(s.t);
      const mag = vectorMagnitudeG(s.x, s.y, s.z);
      const pga = pgaProxyG(s.x, s.y, s.z);
      const level = alertLevelFromPga(pga);
      last = { x: s.x, y: s.y, z: s.z, mag, pga, level, t: ts };
      data.push({
        deviceId: dto.deviceId,
        timestamp: ts,
        x: s.x,
        y: s.y,
        z: s.z,
        magnitude: mag,
        pga,
      });
    }
    await this.prisma.sensorSample.createMany({ data });
    if (last !== undefined) {
      this.gateway.broadcastSensor(dto.deviceId, {
        x: last.x,
        y: last.y,
        z: last.z,
        magnitude: last.mag,
        pga: last.pga,
        level: last.level,
        deviceId: dto.deviceId,
      });
      void this.events.maybeCreateFromShake(dto.deviceId, last.pga, last.mag, last.t);
    }
    return { ok: true as const, accepted: dto.samples.length };
  }
}
