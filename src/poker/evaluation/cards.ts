export const SUITS = ['S', 'H', 'D', 'C'] as const;
export const RANKS = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'T',
  'J',
  'Q',
  'K',
  'A',
] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const createDeck = (): Card[] =>
  SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })));

export const shuffleDeck = (cards: Card[]): Card[] => {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
};

export const dealHand = (): Card[] => shuffleDeck(createDeck()).slice(0, 5);

export const getCardCode = (card: Card): string => `${card.rank}${card.suit}`;

export interface OmahaDeal {
  communityCards: Card[];
  holeCards: Card[];
}

export const dealOmahaHand = (): OmahaDeal => {
  const deck = shuffleDeck(createDeck());
  return {
    communityCards: deck.slice(0, 5),
    holeCards: deck.slice(5, 9),
  };
};

export interface PickBestHandDeal {
  communityCards: Card[];
  hands: Card[][];
}

export const dealPickBestHand = (
  numHands: number,
  handSize: number,
): PickBestHandDeal => {
  const deck = shuffleDeck(createDeck());
  const communityCards = deck.slice(0, 5);
  const hands: Card[][] = [];
  for (let i = 0; i < numHands; i++) {
    hands.push(deck.slice(5 + i * handSize, 5 + (i + 1) * handSize));
  }
  return {
    communityCards,
    hands,
  };
};
