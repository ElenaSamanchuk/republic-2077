import type { TemporaryEffect } from '../constants/campaignEvents';

interface LapseEffectStripProps {
  effects: TemporaryEffect[];
}

export default function LapseEffectStrip({ effects }: LapseEffectStripProps) {
  if (effects.length === 0) return null;

  return (
    <div className="lapse-effect-strip" aria-label="Активные эффекты">
      <div className="lapse-effect-strip__scroll">
        {effects.map((effect) => (
          <span key={effect.id} className="lapse-effect-chip">
            {effect.description}
            <span className="lapse-effect-chip__turns">{effect.duration}×</span>
          </span>
        ))}
      </div>
    </div>
  );
}
