import type { CSSProperties } from 'react';
import type { CoreEffects, CoreStatKey, CoreStats } from '../constants/coreStats';
import { STAT_ICON_URLS } from '../constants/gameAssets';
import { STAT_METER_ORDER, statFillColor } from '../constants/statIcons';

interface LapseStatMeterProps {
  type: CoreStatKey;
  value: number;
  previewValue?: number;
  delta?: number;
}

function fillClipInset(percent: number): string {
  const hidden = Math.max(0, Math.min(100, 100 - percent));
  return `inset(${hidden}% 0 0 0)`;
}

function iconMaskStyle(iconUrl: string): CSSProperties {
  return {
    WebkitMaskImage: `url(${iconUrl})`,
    maskImage: `url(${iconUrl})`,
  };
}

function LapseStatMeter({ type, value, previewValue, delta }: LapseStatMeterProps) {
  const iconUrl = STAT_ICON_URLS[type];
  const isPreviewing = delta !== undefined && delta !== 0 && previewValue !== undefined;
  const displayValue = isPreviewing ? previewValue : value;
  const color = statFillColor(type, displayValue);
  const baseColor = statFillColor(type, value);
  const maskStyle = iconMaskStyle(iconUrl);

  return (
    <div className="lapse-stat-meter">
      <img src={iconUrl} alt="" className="lapse-stat-meter__ghost" draggable={false} />

      {isPreviewing && value !== displayValue && (
        <div className="lapse-stat-meter__fill-clip" style={{ clipPath: fillClipInset(value) }}>
          <div
            className="lapse-stat-meter__fill"
            style={{ ...maskStyle, backgroundColor: baseColor, opacity: 0.55 }}
          />
        </div>
      )}

      <div className="lapse-stat-meter__fill-clip" style={{ clipPath: fillClipInset(displayValue) }}>
        <div className="lapse-stat-meter__fill" style={{ ...maskStyle, backgroundColor: color }} />
      </div>

      {isPreviewing && (
        <span
          className={`lapse-stat-meter__delta ${delta > 0 ? 'lapse-stat-meter__delta--up' : 'lapse-stat-meter__delta--down'}`}
        >
          {delta > 0 ? '▲' : '▼'}
        </span>
      )}
    </div>
  );
}

interface LapseStatsBarProps {
  stats: CoreStats;
  previewStats?: CoreStats | null;
  previewDeltas?: CoreEffects | null;
}

export default function LapseStatsBar({ stats, previewStats, previewDeltas }: LapseStatsBarProps) {
  return (
    <div className="lapse-meters-grid">
      {STAT_METER_ORDER.map((key) => (
        <LapseStatMeter
          key={key}
          type={key}
          value={stats[key]}
          previewValue={previewStats?.[key]}
          delta={previewDeltas?.[key]}
        />
      ))}
    </div>
  );
}
