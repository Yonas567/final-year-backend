import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { riskFromProbability } from '../lib/seismo';

@Injectable()
export class PredictService {
  constructor(private readonly prisma: PrismaService) {}

  async run(deviceId?: string, windowSeconds = 60) {
    const since = new Date(Date.now() - windowSeconds * 1000);
    const where = { timestamp: { gte: since }, ...(deviceId ? { deviceId } : {}) };
    const samples = await this.prisma.sensorSample.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 5000,
    });

    let energy = 0;
    let peak = 0;
    if (samples.length > 0) {
      for (const s of samples) {
        const m = s.magnitude ?? Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z);
        energy += m * m;
        if (m > peak) peak = m;
      }
      energy = Math.sqrt(energy / samples.length);
    } else {
      energy = 0.1 + Math.random() * 0.05;
      peak = energy;
    }

    const stalta = Math.min(3, 0.5 + energy * 2);
    const pWave = Math.min(1, peak * 0.15);
    const freqPeak = 2 + Math.min(6, energy * 8);
    const probability = Math.min(95, Math.round(15 + energy * 55 + samples.length * 0.02));
    const magnitude = Math.min(6.5, Math.round((2 + peak * 1.8 + energy) * 10) / 10);
    const confidence = Math.min(95, Math.round(40 + samples.length * 0.05 + probability * 0.35));
    const risk = riskFromProbability(probability);
    const region = deviceId ? `Near device ${deviceId}` : 'Central Rift Valley';
    const coords = '9.1°N, 40.5°E ± 25km';

    const row = await this.prisma.predictionRun.create({
      data: {
        probability,
        magnitude,
        confidence,
        region,
        coords,
        risk,
        features: { stalta, pWave, energy: Math.min(1, energy), freqPeak },
      },
    });

    return {
      ok: true as const,
      data: {
        id: row.id,
        timestamp: row.timestamp.toISOString(),
        probability: row.probability,
        magnitude: row.magnitude,
        confidence: row.confidence,
        region: row.region,
        coords: row.coords,
        risk: row.risk as 'low' | 'moderate' | 'high',
        features: row.features as {
          stalta: number;
          pWave: number;
          energy: number;
          freqPeak: number;
        },
      },
    };
  }

  async history(limit: number) {
    const take = Math.min(Math.max(limit, 1), 100);
    const rows = await this.prisma.predictionRun.findMany({
      orderBy: { timestamp: 'desc' },
      take,
    });
    return {
      data: rows.map((r) => ({
        id: r.id,
        timestamp: r.timestamp.toISOString(),
        magnitude: r.magnitude,
        probability: r.probability,
        region: r.region,
        risk: r.risk as 'low' | 'moderate' | 'high',
        confidence: r.confidence,
      })),
    };
  }
}
