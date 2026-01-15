export enum Rarity {
  COMMON = 'Comum',
  UNCOMMON = 'Incomum',
  RARE = 'Raro',
  EPIC = 'Épico',
  LEGENDARY = 'Lendário',
}

// Defines common properties for both regular and reward cards.
export interface BaseCard {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
}

// Regular cards extend BaseCard and add a rarity.
export interface Card extends BaseCard {
  rarity: Rarity;
}

// Reward cards extend BaseCard and include required cards for redemption.
export interface RewardCard extends BaseCard {
  requiredCards: RequiredCard[];
}

export interface RequiredCard {
  cardId: string;
  quantity: number;
}

export interface DeckItem {
  // A deck item can now hold either a regular card or a reward card.
  card: Card | RewardCard;
  quantity: number;
}