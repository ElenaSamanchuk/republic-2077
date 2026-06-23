import type { CampaignChoice, CampaignDecision } from './campaign';
import type { CoreEffects, CoreStatKey, CoreStats } from './coreStats';
import type { CharacterId } from './characters';

export interface TemporaryEffect {
  id: string;
  description: string;
  duration: number;
  perTurn: CoreEffects;
}

export interface EffectGrant {
  description: string;
  duration: number;
  perTurn: CoreEffects;
}

/** Случайные события — 4 стата, вставляются как экстренная карточка */
export interface CampaignRandomEvent {
  id: string;
  title: string;
  character: CharacterId;
  description: string;
  leftChoice: CampaignChoice;
  rightChoice: CampaignChoice;
  weight: number;
  minDecisions: number;
  requirements?: Partial<Record<CoreStatKey, { min?: number; max?: number }>>;
}

export const RANDOM_EVENT_DECISION_ID = -1;

export const CAMPAIGN_RANDOM_EVENTS: CampaignRandomEvent[] = [
  {
    id: 'blackout',
    title: 'Блэкаут',
    character: 'scientist',
    description: 'Сеть легла на сутки — банки, больницы, метро. Народ требует ответа',
    weight: 1,
    minDecisions: 4,
    requirements: { treasury: { max: 35 } },
    leftChoice: {
      text: 'Комендантский час',
      effects: { force: 8, people: -10, trust: -4 },
      grantEffect: { description: 'Восстановление сети', duration: 2, perTurn: { treasury: -3 } },
    },
    rightChoice: {
      text: 'Аварийные генераторы',
      effects: { treasury: -12, people: 6, trust: 3 },
    },
  },
  {
    id: 'protests',
    title: 'Митинг у парламента',
    character: 'citizen',
    description: 'Толпа перекрыла центр. Лозунги про казну и «слишком мягкую» власть',
    weight: 1,
    minDecisions: 3,
    requirements: { people: { max: 30 } },
    leftChoice: {
      text: 'Выслушать',
      effects: { trust: 8, force: -5 },
    },
    rightChoice: {
      text: 'Разогнать',
      effects: { force: 10, people: -12, trust: -8 },
    },
  },
  {
    id: 'audit',
    title: 'Внезапный аудит',
    character: 'journalist',
    description: 'Утечка: часть бюджета ушла на закрытые контракты. Прессa ждёт реакции',
    weight: 1,
    minDecisions: 5,
    requirements: { trust: { max: 40 } },
    leftChoice: {
      text: 'Полная прозрачность',
      effects: { trust: 12, treasury: -6 },
    },
    rightChoice: {
      text: 'Замять',
      effects: { trust: -14, treasury: 4, force: 3 },
      grantEffect: { description: 'Следствие журналистов', duration: 3, perTurn: { trust: -2 } },
    },
  },
  {
    id: 'border_alarm',
    title: 'Тревога на границе',
    character: 'general',
    description: 'Радары зафиксировали неопознанные объекты. Генштаб просит решение немедленно',
    weight: 1,
    minDecisions: 6,
    requirements: { force: { max: 35 } },
    leftChoice: {
      text: 'Поднять истребители',
      effects: { force: 10, treasury: -8, trust: -3 },
    },
    rightChoice: {
      text: 'Переговоры',
      effects: { trust: 6, force: -4 },
    },
  },
  {
    id: 'market_shock',
    title: 'Обвал рынка',
    character: 'merchant',
    description: 'Курс республиканского токена рухнул за ночь. Купцы требуют стабилизации',
    weight: 1,
    minDecisions: 4,
    leftChoice: {
      text: 'Спасать банки',
      effects: { treasury: -14, people: 5, trust: 2 },
      grantEffect: { description: 'Кредитная линия', duration: 3, perTurn: { treasury: -2 } },
    },
    rightChoice: {
      text: 'Пусть падает',
      effects: { treasury: 6, people: -10, trust: -6 },
    },
  },
  {
    id: 'oracle_gift',
    title: 'Знак оракула',
    character: 'oracle',
    description: 'Оракул появился во сне советникам: «Баланс — единственная броня республики»',
    weight: 0.6,
    minDecisions: 8,
    leftChoice: {
      text: 'Обнародовать видение',
      effects: { trust: 6, people: 4 },
      grantEffect: { description: 'Благословение', duration: 2, perTurn: { trust: 2, people: 1 } },
    },
    rightChoice: {
      text: 'Сохранить тайну',
      effects: { trust: -2, treasury: 5 },
    },
  },
];

export function randomEventToDecision(event: CampaignRandomEvent): CampaignDecision {
  return {
    id: RANDOM_EVENT_DECISION_ID,
    act: 'act2',
    character: event.character,
    title: event.title,
    description: event.description,
    leftChoice: event.leftChoice,
    rightChoice: event.rightChoice,
  };
}

function meetsRequirements(
  stats: CoreStats,
  req?: Partial<Record<CoreStatKey, { min?: number; max?: number }>>,
): boolean {
  if (!req) return true;
  return Object.entries(req).every(([key, bounds]) => {
    const v = stats[key as CoreStatKey];
    if (bounds.min !== undefined && v < bounds.min) return false;
    if (bounds.max !== undefined && v > bounds.max) return false;
    return true;
  });
}

export function rollRandomEvent(
  stats: CoreStats,
  decisionCount: number,
  lastEventAtDecision: number,
): CampaignRandomEvent | null {
  if (decisionCount < 3) return null;
  if (decisionCount - lastEventAtDecision < 4) return null;
  if (Math.random() > 0.14) return null;

  const eligible = CAMPAIGN_RANDOM_EVENTS.filter(
    (e) => decisionCount >= e.minDecisions && meetsRequirements(stats, e.requirements),
  );
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const event of eligible) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return eligible[eligible.length - 1];
}

export function applyTemporaryEffects(stats: CoreStats, effects: TemporaryEffect[]): CoreStats {
  let next = { ...stats };
  for (const temp of effects) {
    next = applyEffectBundle(next, temp.perTurn);
  }
  return next;
}

export function applyEffectBundle(stats: CoreStats, bundle: CoreEffects): CoreStats {
  const next = { ...stats };
  for (const [key, delta] of Object.entries(bundle) as [CoreStatKey, number][]) {
    if (delta !== undefined) {
      next[key] = Math.max(0, Math.min(100, next[key] + delta));
    }
  }
  return next;
}

export function tickTemporaryEffects(effects: TemporaryEffect[]): TemporaryEffect[] {
  return effects
    .map((e) => ({ ...e, duration: e.duration - 1 }))
    .filter((e) => e.duration > 0);
}

export function grantFromChoice(choice: CampaignChoice): TemporaryEffect | null {
  const grant = choice.grantEffect;
  if (!grant) return null;
  return {
    id: `grant_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    description: grant.description,
    duration: grant.duration,
    perTurn: grant.perTurn,
  };
}
