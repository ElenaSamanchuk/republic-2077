import type { CoreStatKey, CoreStats } from '../constants/coreStats';
import { CORE_STAT_KEYS, CORE_STAT_LABELS, isStatDead } from '../constants/coreStats';

interface CoreStatsBarProps {
  stats: CoreStats;
}

function barColor(key: CoreStatKey, value: number): string {
  if (isStatDead(value)) return 'bg-red-500';
  if (value <= 15 || value >= 85) return 'bg-amber-500';
  switch (key) {
    case 'people':
      return 'bg-emerald-500';
    case 'treasury':
      return 'bg-yellow-500';
    case 'force':
      return 'bg-rose-500';
    case 'trust':
      return 'bg-sky-500';
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

export default function CoreStatsBar({ stats }: CoreStatsBarProps) {
  return (
    <header className="core-stats-bar safe-top px-3 pt-2 pb-3 space-y-2 bg-[var(--surface)] border-b border-[var(--border)]">
      {CORE_STAT_KEYS.map((key) => {
        const value = stats[key];
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs font-medium w-16 shrink-0 text-[var(--muted)]">
              {CORE_STAT_LABELS[key]}
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-[var(--bar-track)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor(key, value)}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="text-xs tabular-nums w-7 text-right text-[var(--foreground)]">
              {value}
            </span>
          </div>
        );
      })}
    </header>
  );
}
