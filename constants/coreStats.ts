export type CoreStatKey = 'people' | 'treasury' | 'force' | 'trust';

export type CoreStats = Record<CoreStatKey, number>;

export type CoreEffects = Partial<CoreStats>;

export const CORE_STAT_KEYS: CoreStatKey[] = ['people', 'treasury', 'force', 'trust'];

export const CORE_STAT_LABELS: Record<CoreStatKey, string> = {
  people: 'Народ',
  treasury: 'Казна',
  force: 'Сила',
  trust: 'Доверие',
};

export const CORE_STAT_SHORT: Record<CoreStatKey, string> = {
  people: '👥',
  treasury: '💰',
  force: '⚔️',
  trust: '🤝',
};

export const INITIAL_CORE_STATS: CoreStats = {
  people: 50,
  treasury: 50,
  force: 50,
  trust: 50,
};

/** Смерть правления — как в Lapse: слишком низко или слишком высоко */
export function isStatDead(value: number): boolean {
  return value <= 0 || value >= 100;
}

export function clampStat(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function applyCoreEffects(stats: CoreStats, effects: CoreEffects): CoreStats {
  const next = { ...stats };
  for (const key of CORE_STAT_KEYS) {
    const delta = effects[key];
    if (delta !== undefined) {
      next[key] = clampStat(next[key] + delta);
    }
  }
  return next;
}

export function getDefeatReason(stats: CoreStats): string {
  for (const key of CORE_STAT_KEYS) {
    const v = stats[key];
    if (v <= 0) {
      return `${CORE_STAT_LABELS[key]} упал до нуля — правление collapsed.`;
    }
    if (v >= 100) {
      return `${CORE_STAT_LABELS[key]} зашкалили — система не выдержала крайности.`;
    }
  }
  return 'Баланс разрушен.';
}

export function balanceScore(stats: CoreStats): number {
  const values = CORE_STAT_KEYS.map((k) => stats[k]);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const spread = Math.max(...values) - Math.min(...values);
  return Math.round(avg - spread * 0.35);
}

/** Старые 6 показателей из legacy-контента → 4 ядра */
export function mapLegacyEffects(effects: Record<string, number>): CoreEffects {
  return {
    people: (effects.society ?? 0) + (effects.ecology ?? 0) * 0.45,
    treasury: (effects.economy ?? 0) + (effects.science ?? 0) * 0.35,
    force: effects.military ?? 0,
    trust: (effects.diplomacy ?? 0) + (effects.science ?? 0) * 0.15,
  };
}

export function formatEffects(effects: CoreEffects): string {
  return CORE_STAT_KEYS.filter((k) => effects[k] !== undefined && effects[k] !== 0)
    .map((k) => {
      const v = effects[k]!;
      return `${CORE_STAT_SHORT[k]} ${v > 0 ? '+' : ''}${v}`;
    })
    .join(' · ');
}
