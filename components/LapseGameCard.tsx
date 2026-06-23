import { AnimatePresence, motion } from 'framer-motion';
import type { CampaignDecision } from '../constants/campaign';
import { formatNarrative } from '../lib/formatNarrative';
import CharacterPortrait, { CharacterCaption } from './CharacterPortrait';
import SwipeCard from './SwipeCard';

interface LapseGameCardProps {
  decision: CampaignDecision;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onDrag?: (offsetX: number) => void;
}

export default function LapseGameCard({
  decision,
  onSwipeLeft,
  onSwipeRight,
  onDrag,
}: LapseGameCardProps) {
  const narrative = formatNarrative(decision.description);

  return (
    <div className="lapse-scene-body">
      <div className="lapse-narrative-zone">
        <AnimatePresence mode="wait">
          <motion.p
            key={`text-${decision.id}`}
            className="lapse-narrative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.2 }}
          >
            {narrative}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="lapse-portrait-zone">
        <AnimatePresence mode="wait">
          <SwipeCard
            key={decision.id}
            cardKey={decision.id}
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
            onDrag={onDrag}
          >
            <CharacterPortrait character={decision.character} />
          </SwipeCard>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`cap-${decision.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.05, duration: 0.15 }}
          >
            <CharacterCaption character={decision.character} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
