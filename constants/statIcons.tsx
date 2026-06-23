import type { CoreStatKey } from './coreStats';

export const STAT_METER_ORDER: CoreStatKey[] = ['trust', 'people', 'force', 'treasury'];

const FILL_SAFE = '#eceae4';
const FILL_WARN = '#c9a0a8';
const FILL_DANGER = '#d4726a';

function hexToRgb(hex: string) {
  const n = hex.replace('#', '');
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0'))
    .join('')}`;
}

function lerpColor(from: string, to: string, t: number): string {
  const k = Math.max(0, Math.min(1, t));
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex(a.r + (b.r - a.r) * k, a.g + (b.g - a.g) * k, a.b + (b.b - a.b) * k);
}

/**
 * Lapse-логика: в балансе (≈30–70) иконки белые.
 * К нулю или к 100 — плавно розовеют и краснеют (оба края опасны).
 */
export function statFillColor(_key: CoreStatKey, value: number): string {
  if (value <= 0 || value >= 100) return FILL_DANGER;

  const edgeDist = Math.min(value, 100 - value);

  if (edgeDist >= 35) return FILL_SAFE;

  if (edgeDist >= 15) {
    return lerpColor(FILL_WARN, FILL_SAFE, (edgeDist - 15) / 20);
  }

  return lerpColor(FILL_DANGER, FILL_WARN, edgeDist / 15);
}
