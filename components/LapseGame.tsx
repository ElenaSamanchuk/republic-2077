import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_CONFIG } from '../constants/campaign';
import { applyCoreEffects, isStatDead, type CoreEffects } from '../constants/coreStats';
import { useCampaignGame, type GameNotification } from '../hooks/useCampaignGame';
import LapseStatsBar from './LapseStatsBar';
import LapseGameCard from './LapseGameCard';
import LapseGameEnd from './LapseGameEnd';
import LapseEffectStrip from './LapseEffectStrip';
import LapseBanner from './LapseBanner';
import { SoundSystem } from './SoundSystem';

const DRAG_PREVIEW_THRESHOLD = 24;
const STREAK_WINDOW_MS = 4500;
const STREAK_THRESHOLD = 3;
const BANNER_VISIBLE_MS = 1400;
const BANNER_GAP_MS = 120;

function gameYear(decisionCount: number): number {
  return GAME_CONFIG.startYear + Math.floor(decisionCount / 6);
}

function daysInPower(decisionCount: number): number {
  return decisionCount * GAME_CONFIG.daysPerDecision + 1;
}

function playBannerSound(notification: GameNotification) {
  if (!notification) return;
  if (notification.kind === 'event') void SoundSystem.randomEvent();
  if (notification.kind === 'oracle') void SoundSystem.notification();
  if (notification.kind === 'effect') void SoundSystem.notification();
  if (notification.kind === 'streak') void SoundSystem.achievement();
}

export default function LapseGame() {
  const {
    state,
    balance,
    applyChoice,
    resetGame,
    notification,
    clearNotification,
    pushNotification,
  } = useCampaignGame();

  const [dragX, setDragX] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [activeBanner, setActiveBanner] = useState<{
    id: number;
    notification: NonNullable<GameNotification>;
  } | null>(null);

  const prevPhase = useRef(state.phase);
  const prevDecisionId = useRef(state.currentDecision?.id);
  const lastChoiceAt = useRef(0);
  const bannerQueue = useRef<NonNullable<GameNotification>[]>([]);
  const bannerBusy = useRef(false);
  const bannerId = useRef(0);
  const bannerTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearBannerTimers = useCallback(() => {
    bannerTimers.current.forEach(clearTimeout);
    bannerTimers.current = [];
  }, []);

  const drainBannerQueue = useCallback(() => {
    if (bannerBusy.current || bannerQueue.current.length === 0) return;

    const next = bannerQueue.current.shift();
    if (!next) return;

    bannerBusy.current = true;
    bannerId.current += 1;
    setActiveBanner({ id: bannerId.current, notification: next });
    playBannerSound(next);

    const hideTimer = setTimeout(() => {
      setActiveBanner(null);
      const gapTimer = setTimeout(() => {
        bannerBusy.current = false;
        drainBannerQueue();
      }, BANNER_GAP_MS);
      bannerTimers.current.push(gapTimer);
    }, BANNER_VISIBLE_MS);
    bannerTimers.current.push(hideTimer);
  }, []);

  const enqueueBanner = useCallback(
    (item: GameNotification) => {
      if (!item) return;
      bannerQueue.current.push(item);
      drainBannerQueue();
    },
    [drainBannerQueue],
  );

  useEffect(() => {
    if (!notification) return;
    enqueueBanner(notification);
    clearNotification();
  }, [notification, clearNotification, enqueueBanner]);

  useEffect(() => () => clearBannerTimers(), [clearBannerTimers]);

  useEffect(() => {
    if (state.currentDecision?.id !== prevDecisionId.current) {
      prevDecisionId.current = state.currentDecision?.id;
      void SoundSystem.cardFlip();
    }
  }, [state.currentDecision?.id]);

  useEffect(() => {
    if (prevPhase.current === 'playing' && state.phase !== 'playing') {
      void (state.phase === 'won' ? SoundSystem.victory() : SoundSystem.defeat());
    }
    prevPhase.current = state.phase;
  }, [state.phase]);

  const handleSwipe = useCallback(
    (side: 'left' | 'right') => {
      void (side === 'left' ? SoundSystem.swipeLeft() : SoundSystem.swipeRight());
      setDragX(0);

      const now = Date.now();
      const nextStreak =
        lastChoiceAt.current && now - lastChoiceAt.current < STREAK_WINDOW_MS
          ? streakCount + 1
          : 1;
      lastChoiceAt.current = now;
      setStreakCount(nextStreak);

      const effects =
        side === 'left'
          ? state.currentDecision?.leftChoice.effects
          : state.currentDecision?.rightChoice.effects;

      const outcome = applyChoice(side);

      if (
        nextStreak >= STREAK_THRESHOLD &&
        !outcome?.eventNotification &&
        !outcome?.effectNotification
      ) {
        pushNotification({ kind: 'streak', message: `Серия ×${nextStreak}` });
      }

      if (effects) {
        const wouldBeCritical = Object.entries(state.stats).some(([key, val]) => {
          const delta = effects[key as keyof CoreEffects] ?? 0;
          const next = val + delta;
          return next <= 15 || next >= 85 || isStatDead(next);
        });
        if (wouldBeCritical) {
          setTimeout(() => void SoundSystem.warning(), 180);
        }
      }
    },
    [applyChoice, pushNotification, state.currentDecision, state.stats, streakCount],
  );

  const handleDrag = useCallback((offsetX: number) => {
    setDragX(offsetX);
  }, []);

  if (state.phase !== 'playing') {
    return (
      <LapseGameEnd
        phase={state.phase}
        stats={state.stats}
        balance={balance}
        decisionCount={state.decisionCount}
        defeatReason={state.defeatReason}
        onRestart={() => {
          void SoundSystem.buttonClick();
          resetGame();
        }}
      />
    );
  }

  const decision = state.currentDecision;
  if (!decision) {
    return (
      <LapseGameEnd
        phase="won"
        stats={state.stats}
        balance={balance}
        decisionCount={state.decisionCount}
        defeatReason={null}
        onRestart={resetGame}
      />
    );
  }

  const year = gameYear(state.decisionCount);
  const days = daysInPower(state.decisionCount);

  const dragSide =
    dragX < -DRAG_PREVIEW_THRESHOLD ? 'left' : dragX > DRAG_PREVIEW_THRESHOLD ? 'right' : null;

  const previewEffects: CoreEffects | null = dragSide
    ? dragSide === 'left'
      ? decision.leftChoice.effects
      : decision.rightChoice.effects
    : null;

  const previewStats = previewEffects ? applyCoreEffects(state.stats, previewEffects) : null;

  return (
    <div
      className="lapse-game no-select"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') handleSwipe('left');
        if (e.key === 'ArrowRight') handleSwipe('right');
      }}
    >
      <header className="lapse-header safe-top">
        <LapseBanner banner={activeBanner} />
        <LapseStatsBar
          stats={state.stats}
          previewStats={previewStats}
          previewDeltas={previewEffects}
        />
        <LapseEffectStrip effects={state.temporaryEffects} />
      </header>

      <main
        className={`lapse-scene${state.temporaryEffects.length > 0 ? ' lapse-scene--has-effects' : ''}`}
      >
        <LapseGameCard
          decision={decision}
          onSwipeLeft={() => handleSwipe('left')}
          onSwipeRight={() => handleSwipe('right')}
          onDrag={handleDrag}
        />
      </main>

      <footer className="lapse-bottom-bar safe-bottom">
        <motion.p
          key={year}
          className="lapse-bottom-year"
          initial={{ opacity: 0.6, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {year}
        </motion.p>
        <p className="lapse-bottom-days">{days} дн. у власти</p>
      </footer>
    </div>
  );
}
