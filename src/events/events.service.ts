import { Injectable } from '@nestjs/common';
import { EarthquakeEvent } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { eventLevelFromMagnitude } from '../lib/seismo';

const DEBOUNCE_MS = 120_000;
const TRIGGER_PGA = 0.35;

@Injectable()
export class EventsService {
  private lastFired = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: RealtimeGateway,
  ) {}

  toPayload(e: EarthquakeEvent) {
    return {
      id: e.id,
      time: e.time.toISOString(),
      magnitude: e.magnitude,
      level: e.level as 'mild' | 'moderate' | 'strong',
      location: e.location,
      depth: e.depth,
      lat: e.lat,
      lon: e.lon,
    };
  }

  async recent(n: number) {
    const take = Math.min(Math.max(n, 1), 100);
    const rows = await this.prisma.earthquakeEvent.findMany({
      orderBy: { time: 'desc' },
      take,
    });
    return { data: rows.map((r) => this.toPayload(r)) };
  }

  async maybeCreateFromShake(
    deviceId: string,
    pga: number,
    magnitude: number,
    sampleTime: Date,
  ): Promise<void> {
    if (pga < TRIGGER_PGA) return;
    const now = Date.now();
    const last = this.lastFired.get(deviceId) ?? 0;
    if (now - last < DEBOUNCE_MS) return;
    this.lastFired.set(deviceId, now);

    const estMag = Math.min(2 + pga * 6, 7.5);
    const level = eventLevelFromMagnitude(estMag);
    const location = this.placeFromDevice(deviceId);

    const e = await this.prisma.earthquakeEvent.create({
      data: {
        time: sampleTime,
        magnitude: Math.round(estMag * 10) / 10,
        level,
        location,
        depth: '10',
        lat: '9.03',
        lon: '38.75',
      },
    });

    this.gateway.broadcastAlert(this.toPayload(e));
  }

  private placeFromDevice(deviceId: string): string {
    if (deviceId.includes('awash')) return 'Awash Valley';
    if (deviceId.includes('rift')) return 'Central Rift Valley';
    return 'Ethiopia — monitored zone';
  }
}
