import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyCoreEffects,
  balanceScore,
  getDefeatReason,
  INITIAL_CORE_STATS,
  isStatDead,
  type CoreStats,
} from '../constants/coreStats';
import {
  CAMPAIGN_DECISIONS,
  GAME_CONFIG,
  getNextDecision,
  type CampaignDecision,
} from '../constants/campaign';
import {
  applyTemporaryEffects,
  grantFromChoice,
  randomEventToDecision,
  RANDOM_EVENT_DECISION_ID,
  rollRandomEvent,
  tickTemporaryEffects,
  type TemporaryEffect,
} from '../constants/campaignEvents';

const STORAGE_KEY = 'republic2077-save';

export type GamePhase = 'playing' | 'won' | 'lost';

export type GameNotification =
  | { kind: 'event'; message: string }
  | { kind: 'effect'; message: string }
  | { kind: 'streak'; message: string }
  | { kind: 'oracle'; message: string }
  | null;

export interface CampaignGameState {
  stats: CoreStats;
  completedDecisionIds: number[];
  currentDecision: CampaignDecision | null;
  decisionCount: number;
  phase: GamePhase;
  defeatReason: string | null;
  temporaryEffects: TemporaryEffect[];
  lastEventAtDecision: number;
}

function loadSave(): Partial<CampaignGameState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<CampaignGameState>;
  } catch {
    return null;
  }
}

function persistSave(state: CampaignGameState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        stats: state.stats,
        completedDecisionIds: state.completedDecisionIds,
        decisionCount: state.decisionCount,
        phase: state.phase,
        defeatReason: state.defeatReason,
        temporaryEffects: state.temporaryEffects,
        lastEventAtDecision: state.lastEventAtDecision,
      }),
    );
  } catch {
    /* ignore */
  }
}

function buildInitialState(): CampaignGameState {
  const saved = loadSave();
  const completedDecisionIds = saved?.completedDecisionIds ?? [];
  const stats = saved?.stats ?? { ...INITIAL_CORE_STATS };
  const decisionCount = saved?.decisionCount ?? 0;
  const phase = saved?.phase ?? 'playing';
  const temporaryEffects = saved?.temporaryEffects ?? [];
  const lastEventAtDecision = saved?.lastEventAtDecision ?? 0;

  if (phase !== 'playing') {
    return {
      stats,
      completedDecisionIds,
      currentDecision: null,
      decisionCount,
      phase,
      defeatReason: saved?.defeatReason ?? null,
      temporaryEffects,
      lastEventAtDecision,
    };
  }

  return {
    stats,
    completedDecisionIds,
    currentDecision: getNextDecision(completedDecisionIds),
    decisionCount,
    phase: 'playing',
    defeatReason: null,
    temporaryEffects,
    lastEventAtDecision,
  };
}

function finalizeAfterChoice(
  stats: CoreStats,
  completed: number[],
  decisionCount: number,
  lastEventAtDecision: number,
): {
  phase: GamePhase;
  defeatReason: string | null;
  currentDecision: CampaignDecision | null;
  lastEventAtDecision: number;
  notification: GameNotification;
} {
  const dead = Object.values(stats).some(isStatDead);
  if (dead) {
    return {
      phase: 'lost',
      defeatReason: getDefeatReason(stats),
      currentDecision: null,
      lastEventAtDecision,
      notification: null,
    };
  }

  const randomEvent = rollRandomEvent(stats, decisionCount, lastEventAtDecision);
  if (randomEvent) {
    const kind = randomEvent.character === 'oracle' ? 'oracle' : 'event';
    return {
      phase: 'playing',
      defeatReason: null,
      currentDecision: randomEventToDecision(randomEvent),
      lastEventAtDecision: decisionCount,
      notification: { kind, message: randomEvent.title },
    };
  }

  const next = getNextDecision(completed);
  const allDone = !next || completed.length >= CAMPAIGN_DECISIONS.length;

  if (allDone) {
    const won = balanceScore(stats) >= GAME_CONFIG.victoryMinBalance;
    return {
      phase: won ? 'won' : 'lost',
      defeatReason: won ? null : 'Республика выжила, но баланс слишком хрупкий для наследия.',
      currentDecision: null,
      lastEventAtDecision,
      notification: null,
    };
  }

  return {
    phase: 'playing',
    defeatReason: null,
    currentDecision: next,
    lastEventAtDecision,
    notification: null,
  };
}

export function useCampaignGame() {
  const [state, setState] = useState<CampaignGameState>(buildInitialState);
  const [notification, setNotification] = useState<GameNotification>(null);

  const balance = useMemo(() => balanceScore(state.stats), [state.stats]);
  const actLabel = state.currentDecision?.act ?? 'prologue';

  useEffect(() => {
    if (state.phase === 'playing') {
      persistSave(state);
    }
  }, [state]);

  const clearNotification = useCallback(() => setNotification(null), []);

  const pushNotification = useCallback((n: GameNotification) => {
    setNotification(n);
  }, []);

  const applyChoice = useCallback(
    (side: 'left' | 'right') => {
      if (state.phase !== 'playing' || !state.currentDecision) return null;

      const decision = state.currentDecision;
      const choice = side === 'left' ? decision.leftChoice : decision.rightChoice;

      let newStats = applyTemporaryEffects(state.stats, state.temporaryEffects);
      newStats = applyCoreEffects(newStats, choice.effects);

      let temporaryEffects = tickTemporaryEffects(state.temporaryEffects);
      const grant = grantFromChoice(choice);
      let effectNotification: GameNotification = null;
      if (grant) {
        temporaryEffects = [...temporaryEffects, grant];
        effectNotification = { kind: 'effect', message: grant.description };
      }

      const isRandomCard = decision.id === RANDOM_EVENT_DECISION_ID;
      const completed = isRandomCard
        ? state.completedDecisionIds
        : [...state.completedDecisionIds, decision.id];

      const decisionCount = state.decisionCount + 1;

      const outcome = finalizeAfterChoice(
        newStats,
        completed,
        decisionCount,
        state.lastEventAtDecision,
      );

      setState({
        stats: newStats,
        completedDecisionIds: completed,
        currentDecision: outcome.currentDecision,
        decisionCount,
        phase: outcome.phase,
        defeatReason: outcome.defeatReason,
        temporaryEffects,
        lastEventAtDecision: outcome.lastEventAtDecision,
      });

      setNotification(outcome.notification ?? effectNotification);
      return { grant, effectNotification, eventNotification: outcome.notification };
    },
    [state],
  );

  const resetGame = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState({
      stats: { ...INITIAL_CORE_STATS },
      completedDecisionIds: [],
      currentDecision: getNextDecision([]),
      decisionCount: 0,
      phase: 'playing',
      defeatReason: null,
      temporaryEffects: [],
      lastEventAtDecision: 0,
    });
    setNotification(null);
  }, []);

  return {
    state,
    balance,
    actLabel,
    notification,
    clearNotification,
    pushNotification,
    applyChoice,
    resetGame,
    totalDecisions: CAMPAIGN_DECISIONS.length,
  };
}

export type UseCampaignGameReturn = ReturnType<typeof useCampaignGame>;
