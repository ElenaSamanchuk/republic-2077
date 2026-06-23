export type CharacterId =
  | 'citizen'
  | 'general'
  | 'merchant'
  | 'scientist'
  | 'ecologist'
  | 'journalist'
  | 'oracle';

export interface CharacterProfile {
  id: CharacterId;
  /** Полная подпись под портретом, как в Lapse */
  title: string;
  name: string;
  role: string;
  cardBg: string;
  skin: string;
}

export const CHARACTERS: Record<CharacterId, CharacterProfile> = {
  citizen: {
    id: 'citizen',
    title: 'Представитель народа М. Кова',
    name: 'Мира Кова',
    role: 'Представитель народа',
    cardBg: '#3d4a52',
    skin: '#d4a574',
  },
  general: {
    id: 'general',
    title: 'Генерал В. Век',
    name: 'Полковник Век',
    role: 'Министр обороны',
    cardBg: '#2d4538',
    skin: '#c9956c',
  },
  merchant: {
    id: 'merchant',
    title: 'Министр экономики А. Паверо',
    name: 'Артём Паверо',
    role: 'Торговый союз',
    cardBg: '#3a3d52',
    skin: '#e0b88a',
  },
  scientist: {
    id: 'scientist',
    title: 'Министр здравоохранения Д. Кумiyo',
    name: 'Доктор Кумiyo',
    role: 'Научный совет',
    cardBg: '#4a3548',
    skin: '#ddb892',
  },
  ecologist: {
    id: 'ecologist',
    title: 'Министр экологии П. Верн',
    name: 'Профессор Верн',
    role: 'Экологический комитет',
    cardBg: '#2f4238',
    skin: '#c9a07a',
  },
  journalist: {
    id: 'journalist',
    title: 'Главный редактор С. Сок',
    name: 'Редактор Сок',
    role: 'Независимые медиа',
    cardBg: '#353940',
    skin: '#b8926a',
  },
  oracle: {
    id: 'oracle',
    title: 'Система прогноза',
    name: 'Аналитик',
    role: 'Оракул',
    cardBg: '#3a3428',
    skin: '#a89078',
  },
};
