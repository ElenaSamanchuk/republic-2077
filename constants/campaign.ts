import type { CoreEffects } from './coreStats';
import type { CharacterId } from './characters';

export type CampaignAct = 'prologue' | 'act1' | 'act2' | 'act3';

export interface CampaignChoice {
  text: string;
  effects: CoreEffects;
  /** Бонус/штраф на несколько ходов после этого выбора */
  grantEffect?: {
    description: string;
    duration: number;
    perTurn: CoreEffects;
  };
}

export interface CampaignDecision {
  id: number;
  act: CampaignAct;
  character: CharacterId;
  title: string;
  description: string;
  leftChoice: CampaignChoice;
  rightChoice: CampaignChoice;
  /** ID решений, которые должны быть приняты раньше */
  prerequisites?: number[];
}

export const CAMPAIGN_ACT_LABELS: Record<CampaignAct, string> = {
  prologue: 'Пролог',
  act1: 'Первый срок',
  act2: 'Кризис',
  act3: 'Наследие',
};

export const GAME_CONFIG = {
  name: 'Republic 2077',
  tagline: 'Свайпай решения. Держи баланс. Не дай республике рухнуть.',
  startYear: 2075,
  daysPerDecision: 3,
  maxDecisions: 35,
  oracleUnlockAfter: 4,
  victoryMinBalance: 42,
} as const;

export const CAMPAIGN_DECISIONS: CampaignDecision[] = [
  // —— Пролог ——
  {
    id: 1,
    act: 'prologue',
    character: 'citizen',
    title: 'Первый день у власти',
    description:
      'Народ вышел на площадь: «Мы выбрали вас. Покажите, что республика — не пустой лозунг».',
    leftChoice: { text: 'Обещать реформы', effects: { trust: 8, treasury: -4 } },
    rightChoice: { text: 'Просить время', effects: { trust: -3, people: 5 } },
  },
  {
    id: 2,
    act: 'prologue',
    character: 'general',
    title: 'Парад или ремонт казарм',
    description: 'Армия просит бюджет. Парад поднимет дух, но казармы развалятся ещё быстрее.',
    leftChoice: { text: 'Парад', effects: { force: 10, treasury: -8, trust: 3 } },
    rightChoice: { text: 'Ремонт', effects: { force: 5, treasury: -5, people: -2 } },
    prerequisites: [1],
  },
  {
    id: 3,
    act: 'prologue',
    character: 'merchant',
    title: 'Налог на импорт',
    description: 'Торговый союз предлагает снизить пошлины — товары подешевеют, казна пострадает.',
    leftChoice: { text: 'Снизить пошлины', effects: { people: 8, treasury: -10 } },
    rightChoice: { text: 'Оставить как есть', effects: { treasury: 6, people: -5, trust: -3 } },
    prerequisites: [1],
  },
  {
    id: 4,
    act: 'prologue',
    character: 'journalist',
    title: 'Прозрачность бюджета',
    description: 'Редактор требует открыть траты казны. Секреты исчезнут — и скандалы тоже вылезут.',
    leftChoice: { text: 'Открыть бюджет', effects: { trust: 12, treasury: -3 } },
    rightChoice: { text: 'Закрыть данные', effects: { trust: -10, force: 3 } },
    prerequisites: [2, 3],
  },
  {
    id: 5,
    act: 'prologue',
    character: 'scientist',
    title: 'Грант на исследования',
    description: 'Учёные просят финансирование нейросетей для прогноза катастроф. Дорого, но перспективно.',
    leftChoice: {
      text: 'Выделить грант',
      effects: { treasury: -12, trust: 5, people: 4 },
      grantEffect: { description: 'Научный бум', duration: 3, perTurn: { trust: 2, treasury: -1 } },
    },
    rightChoice: { text: 'Отложить', effects: { treasury: 4, trust: -4, people: -3 } },
    prerequisites: [4],
  },

  // —— Акт 1 ——
  {
    id: 6,
    act: 'act1',
    character: 'ecologist',
    title: 'Лес под городом',
    description: 'Застройщики хотят срубить зелёную зону. Экологи блокируют стройку.',
    leftChoice: { text: 'Сохранить лес', effects: { people: 10, treasury: -8, trust: 4 } },
    rightChoice: {
      text: 'Разрешить стройку',
      effects: { treasury: 14, people: -12, trust: -5 },
      grantEffect: { description: 'Строительный ажиотаж', duration: 2, perTurn: { treasury: 3, people: -2 } },
    },
    prerequisites: [5],
  },
  {
    id: 7,
    act: 'act1',
    character: 'general',
    title: 'Пограничный инцидент',
    description: 'Соседняя держава нарушила воздушное пространство. Эскалация или дипломатия?',
    leftChoice: { text: 'Перехватить дрон', effects: { force: 12, trust: -6, treasury: -5 } },
    rightChoice: { text: 'Нота протеста', effects: { trust: 6, force: -4 } },
    prerequisites: [5],
  },
  {
    id: 8,
    act: 'act1',
    character: 'merchant',
    title: 'Цифровая валюта',
    description: 'Бизнес предлагает запустить государственный stablecoin. Риск — спекуляции.',
    leftChoice: { text: 'Запустить пилот', effects: { treasury: 8, trust: -5, people: 3 } },
    rightChoice: { text: 'Запретить', effects: { trust: 5, treasury: -4, people: -2 } },
    prerequisites: [6],
  },
  {
    id: 9,
    act: 'act1',
    character: 'citizen',
    title: 'Минимальная зарплата',
    description: 'Профсоюзы требуют поднять минималку на 20%. Работодатели угрожают увольнениями.',
    leftChoice: { text: 'Поднять', effects: { people: 14, treasury: -12, trust: 3 } },
    rightChoice: { text: 'Компромисс +5%', effects: { people: 5, treasury: -5 } },
    prerequisites: [7],
  },
  {
    id: 10,
    act: 'act1',
    character: 'journalist',
    title: 'Утечка о коррупции',
    description: 'СMI опубликовали документы о взятках в министерстве. Отрицать или расследовать?',
    leftChoice: { text: 'Расследование', effects: { trust: 15, treasury: -6, force: -3 } },
    rightChoice: { text: 'Отрицать', effects: { trust: -14, force: 4 } },
    prerequisites: [8],
  },
  {
    id: 11,
    act: 'act1',
    character: 'scientist',
    title: 'ИИ в судах',
    description: 'Предложили алгоритм для приговоров. Быстрее — но общество боится предвзятости.',
    leftChoice: { text: 'Пилот в 3 регионах', effects: { trust: -8, treasury: 6, people: -2 } },
    rightChoice: { text: 'Только экспертиза', effects: { trust: 7, treasury: -4 } },
    prerequisites: [9],
  },
  {
    id: 12,
    act: 'act1',
    character: 'general',
    title: 'Киберополк',
    description: 'Нужен отряд киберзащиты. Финансирование съест бюджет здравоохранения.',
    leftChoice: { text: 'Создать полк', effects: { force: 15, treasury: -10, people: -5 } },
    rightChoice: { text: 'Аутсорс', effects: { force: 6, treasury: -4, trust: -3 } },
    prerequisites: [10],
  },
  {
    id: 13,
    act: 'act1',
    character: 'ecologist',
    title: 'Солнечные фермы',
    description: 'Проект зелёной энергии на юге. Дешевле нефти через 5 лет — но казна платит сейчас.',
    leftChoice: { text: 'Инвестировать', effects: { people: 8, treasury: -14, trust: 5 } },
    rightChoice: { text: 'Нефть дешевле', effects: { treasury: 8, people: -8, trust: -4 } },
    prerequisites: [11],
  },
  {
    id: 14,
    act: 'act1',
    character: 'merchant',
    title: 'Стартап-виза',
    description: 'Привлечь IT-таланты из-за рубежа или защитить местный рынок труда?',
    leftChoice: { text: 'Открыть визы', effects: { treasury: 10, people: -6, trust: 4 } },
    rightChoice: { text: 'Квоты для своих', effects: { people: 8, treasury: -5, trust: -2 } },
    prerequisites: [12],
  },
  {
    id: 15,
    act: 'act1',
    character: 'citizen',
    title: 'Референдум о сроках',
    description: 'Оппозиция требует ограничить ваш мандат двумя годами. Народ хочет голосовать.',
    leftChoice: { text: 'Провести референдум', effects: { trust: 18, force: -5 } },
    rightChoice: { text: 'Отклонить', effects: { trust: -12, force: 6 } },
    prerequisites: [13, 14],
  },

  // —— Акт 2 ——
  {
    id: 16,
    act: 'act2',
    character: 'journalist',
    title: 'Информационная блокада',
    description: 'Во время кризиса СMI просят не распространять панику. Цензура или свобода?',
    leftChoice: { text: 'Временные ограничения', effects: { trust: -10, people: 5, force: 4 } },
    rightChoice: { text: 'Свобода слова', effects: { trust: 8, people: -8, treasury: -3 } },
    prerequisites: [15],
  },
  {
    id: 17,
    act: 'act2',
    character: 'general',
    title: 'Мобилизация резервистов',
    description: 'Угроза вторжения реальна. Мобилизация поднимет армию — и страх в городах.',
    leftChoice: { text: 'Частичная мобилизация', effects: { force: 18, people: -15, treasury: -8 } },
    rightChoice: { text: 'Дипломатический коридор', effects: { trust: 10, force: -8, treasury: -4 } },
    prerequisites: [15],
  },
  {
    id: 18,
    act: 'act2',
    character: 'scientist',
    title: 'Вакцина от нового вируса',
    description: 'Вспышка в порту. Учёные готовы вакцину за 48 часов — без полных испытаний.',
    leftChoice: { text: 'Ускоренный выпуск', effects: { people: 12, trust: -10, treasury: -6 } },
    rightChoice: { text: 'Полные испытания', effects: { people: -10, trust: 8, treasury: -8 } },
    prerequisites: [16],
  },
  {
    id: 19,
    act: 'act2',
    character: 'merchant',
    title: 'Дефолт или заём МВФ',
    description: 'Казна на нуле. МВФ даст кредит под жёсткую экономию.',
    leftChoice: { text: 'Взять заём', effects: { treasury: 20, people: -12, trust: -8 } },
    rightChoice: { text: 'Дефолт', effects: { treasury: -15, trust: -15, people: -8 } },
    prerequisites: [17],
  },
  {
    id: 20,
    act: 'act2',
    character: 'ecologist',
    title: 'Паводок',
    description: 'Река вышла из берегов. Эвакуировать промзону или спасать заводы?',
    leftChoice: { text: 'Эвакуация', effects: { people: 15, treasury: -18, trust: 6 } },
    rightChoice: { text: 'Удержать дамбы', effects: { treasury: -8, people: -12, force: 5 } },
    prerequisites: [18],
  },
  {
    id: 21,
    act: 'act2',
    character: 'citizen',
    title: 'Бунт на продовольствие',
    description: 'Цены на хлеб выросли втрое. Очереди у магазинов, митинги растут.',
    leftChoice: { text: 'Субсидии на еду', effects: { people: 18, treasury: -20 } },
    rightChoice: { text: 'Жёсткий контроль цен', effects: { people: 5, treasury: -5, trust: -8 } },
    prerequisites: [19],
  },
  {
    id: 22,
    act: 'act2',
    character: 'general',
    title: 'Военное положение',
    description: 'Генштаб просит особые полномочия на 30 дней. Порядок — или диктатура?',
    leftChoice: { text: 'Ввести ВП', effects: { force: 20, trust: -18, people: -5 } },
    rightChoice: { text: 'Отказать', effects: { trust: 10, force: -10, people: 3 } },
    prerequisites: [20, 21],
  },
  {
    id: 23,
    act: 'act2',
    character: 'journalist',
    title: 'Расследование вашего окружения',
    description: 'Редактор Сок публикует материал о вашем советнике. Потребовать отставку?',
    leftChoice: { text: 'Отставка советника', effects: { trust: 14, force: -5, treasury: -3 } },
    rightChoice: { text: 'Защитить своего', effects: { trust: -16, force: 5 } },
    prerequisites: [22],
  },
  {
    id: 24,
    act: 'act2',
    character: 'scientist',
    title: 'Чёрный ход',
    description: 'ИИ-прогноз: без радикальных мер через 90 дней — коллапс. Экстренный план готов.',
    leftChoice: { text: 'Экстренный план', effects: { treasury: 10, people: -8, trust: 5, force: 5 } },
    rightChoice: { text: 'Игнорировать модель', effects: { trust: -6, treasury: -10 } },
    prerequisites: [23],
  },
  {
    id: 25,
    act: 'act2',
    character: 'merchant',
    title: 'Приватизация портов',
    description: 'Инвесторы готовы влить миллиарды в инфраструктуру — в обмен на 49% акций.',
    leftChoice: { text: 'Сделка', effects: { treasury: 22, trust: -12, people: -4 } },
    rightChoice: { text: 'Государственный контроль', effects: { trust: 8, treasury: -6, force: 3 } },
    prerequisites: [24],
  },

  // —— Акт 3 ——
  {
    id: 26,
    act: 'act3',
    character: 'citizen',
    title: 'Выборы',
    description: 'Срок подходит к концу. Народ хочет честных выборов — или стабильности под вашим курсом?',
    leftChoice: { text: 'Честные выборы', effects: { trust: 20, force: -8 } },
    rightChoice: { text: 'Продлить мандат', effects: { trust: -20, force: 10, people: -5 } },
    prerequisites: [25],
  },
  {
    id: 27,
    act: 'act3',
    character: 'ecologist',
    title: 'Климатический договор',
    description: 'Подписать международный пакт с углеродными квотами — дорого для промышленности.',
    leftChoice: { text: 'Подписать', effects: { trust: 12, people: 8, treasury: -10 } },
    rightChoice: { text: 'Отказ', effects: { treasury: 8, trust: -10, people: -6 } },
    prerequisites: [26],
  },
  {
    id: 28,
    act: 'act3',
    character: 'general',
    title: 'Разоружение',
    description: 'Сосед предлагает взаимное сокращение арсенала. Армия против.',
    leftChoice: { text: 'Договор', effects: { trust: 15, force: -12, treasury: 8 } },
    rightChoice: { text: 'Отклонить', effects: { force: 8, trust: -10, treasury: -6 } },
    prerequisites: [26],
  },
  {
    id: 29,
    act: 'act3',
    character: 'journalist',
    title: 'Архив эпохи',
    description: 'СMI предлагают документальный фильм о вашем правлении. Честно — со всеми ошибками.',
    leftChoice: { text: 'Разрешить', effects: { trust: 12, people: 5 } },
    rightChoice: { text: 'Сценарий «мягче»', effects: { trust: -8, people: -3 } },
    prerequisites: [27, 28],
  },
  {
    id: 30,
    act: 'act3',
    character: 'oracle',
    title: 'Наследие',
    description:
      'Система подводит итог: республика пережила ваш срок. Что оставить следующему правителю?',
    leftChoice: { text: 'Фонд будущего', effects: { treasury: -10, trust: 10, people: 8 } },
    rightChoice: { text: 'Личный совет', effects: { trust: 5, force: 5, treasury: 5 } },
    prerequisites: [29],
  },
];

export function getDecisionById(id: number): CampaignDecision | undefined {
  return CAMPAIGN_DECISIONS.find((d) => d.id === id);
}

export function getAvailableDecisions(completedIds: number[]): CampaignDecision[] {
  return CAMPAIGN_DECISIONS.filter(
    (d) =>
      !completedIds.includes(d.id) &&
      (d.prerequisites ?? []).every((pid) => completedIds.includes(pid)),
  );
}

export function getNextDecision(completedIds: number[]): CampaignDecision | null {
  const available = getAvailableDecisions(completedIds);
  if (available.length === 0) return null;
  return available.sort((a, b) => a.id - b.id)[0];
}
