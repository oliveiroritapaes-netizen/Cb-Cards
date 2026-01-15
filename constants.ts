import { Rarity } from './types';

export const RARITY_CHANCES: { rarity: Rarity; chance: number }[] = [
  { rarity: Rarity.COMMON, chance: 0.50 },
  { rarity: Rarity.UNCOMMON, chance: 0.25 },
  { rarity: Rarity.RARE, chance: 0.15 },
  { rarity: Rarity.EPIC, chance: 0.08 },
  { rarity: Rarity.LEGENDARY, chance: 0.02 },
];

export const CARD_SPAWN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
// export const CARD_SPAWN_INTERVAL_MS = 5 * 1000; // For testing: 5 seconds
