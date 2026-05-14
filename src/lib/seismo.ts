export type AlertLevel = 'none' | 'mild' | 'moderate' | 'strong';
export type EventLevel = 'mild' | 'moderate' | 'strong';
export type RiskBand = 'low' | 'moderate' | 'high';

/** Acceleration vector magnitude in g (approx). */
export function vectorMagnitudeG(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

/** PGA proxy: deviation from ~1g vertical rest (simple v1). */
export function pgaProxyG(x: number, y: number, z: number): number {
  const mag = vectorMagnitudeG(x, y, z);
  return Math.abs(mag - 1);
}

export function alertLevelFromPga(pga: number): AlertLevel {
  if (pga < 0.05) return 'none';
  if (pga < 0.2) return 'mild';
  if (pga < 0.45) return 'moderate';
  return 'strong';
}

export function eventLevelFromMagnitude(m: number): EventLevel {
  if (m < 3) return 'mild';
  if (m < 5) return 'moderate';
  return 'strong';
}

export function riskFromProbability(p: number): RiskBand {
  if (p < 35) return 'low';
  if (p < 65) return 'moderate';
  return 'high';
}
