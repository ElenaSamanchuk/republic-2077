import type { GamePhase } from '../hooks/useCampaignGame';
import type { CoreStats } from '../constants/coreStats';
import { CORE_STAT_KEYS, CORE_STAT_LABELS } from '../constants/coreStats';

interface LapseGameEndProps {
  phase: GamePhase;
  stats: CoreStats;
  balance: number;
  decisionCount: number;
  defeatReason: string | null;
  onRestart: () => void;
}

export default function LapseGameEnd({
  phase,
  stats,
  balance,
  decisionCount,
  defeatReason,
  onRestart,
}: LapseGameEndProps) {
  const won = phase === 'won';

  return (
    <div className="game-end flex flex-col items-center justify-center text-center safe-top safe-bottom">
      <span className="text-5xl mb-4" aria-hidden>
        {won ? '🏛️' : '💀'}
      </span>
      <h1 className="text-2xl font-bold">
        {won ? 'Республика пережила ваш срок' : 'Правление завершено'}
      </h1>
      <p className="mt-3 max-w-sm leading-relaxed opacity-80">
        {won
          ? `Баланс ${balance} — история запомнит ваши решения.`
          : defeatReason ?? 'Баланс разрушен.'}
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-3 w-full max-w-xs text-left">
        {CORE_STAT_KEYS.map((key) => (
          <div key={key} className="game-end-stat">
            <dt className="text-xs opacity-60">{CORE_STAT_LABELS[key]}</dt>
            <dd className="text-lg font-semibold tabular-nums">{stats[key]}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-sm opacity-70">Решений: {decisionCount}</p>

      <button type="button" className="game-end-btn mt-8" onClick={onRestart}>
        Новая кампания
      </button>
    </div>
  );
}
