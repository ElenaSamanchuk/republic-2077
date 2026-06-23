import { AnimatePresence, motion } from 'framer-motion';
import type { GameNotification } from '../hooks/useCampaignGame';

const BANNER_META: Record<
  NonNullable<GameNotification>['kind'],
  { label: string; glyph: string }
> = {
  event: { label: 'Событие', glyph: '⚡' },
  effect: { label: 'Эффект', glyph: '◆' },
  streak: { label: 'Серия', glyph: '🔥' },
  oracle: { label: 'Оракул', glyph: '☽' },
};

interface LapseBannerProps {
  banner: { id: number; notification: NonNullable<GameNotification> } | null;
}

export default function LapseBanner({ banner }: LapseBannerProps) {
  const notification = banner?.notification ?? null;
  const meta = notification ? BANNER_META[notification.kind] : null;

  return (
    <div className="lapse-banner-portal" aria-live="polite">
      <AnimatePresence mode="wait">
        {banner && notification && meta && (
          <motion.div
            key={banner.id}
            className={`lapse-banner lapse-banner--${notification.kind}`}
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="lapse-banner__icon-ring" aria-hidden>
              {meta.glyph}
            </span>
            <div className="lapse-banner__body">
              <span className="lapse-banner__label">{meta.label}</span>
              <span className="lapse-banner__message">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
