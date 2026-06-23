import type { CharacterId } from './characters';
import type { CoreStatKey } from './coreStats';

import charCitizen from '../assets/characters/char-citizen.png';
import charEcologist from '../assets/characters/char-ecologist.png';
import charGeneral from '../assets/characters/char-general.png';
import charJournalist from '../assets/characters/char-journalist.png';
import charMerchant from '../assets/characters/char-merchant.png';
import charOracle from '../assets/characters/char-oracle.png';
import charScientist from '../assets/characters/char-scientist.png';

import statForce from '../assets/stats/stat-force.png';
import statPeople from '../assets/stats/stat-people.png';
import statTreasury from '../assets/stats/stat-treasury.png';
import statTrust from '../assets/stats/stat-trust.png';

/** Vite резолвит пути при сборке — картинки всегда подтягиваются */
export const PORTRAIT_URLS: Record<CharacterId, string> = {
  citizen: charCitizen,
  general: charGeneral,
  merchant: charMerchant,
  scientist: charScientist,
  ecologist: charEcologist,
  journalist: charJournalist,
  oracle: charOracle,
};

export const STAT_ICON_URLS: Record<CoreStatKey, string> = {
  trust: statTrust,
  people: statPeople,
  force: statForce,
  treasury: statTreasury,
};
