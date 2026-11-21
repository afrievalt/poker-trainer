import type { Card } from '@trainer/cards';

const SUIT_SYMBOLS: Record<Card['suit'], string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
};

const getSuitColorClass = (suit: Card['suit']): string =>
  suit === 'H' || suit === 'D' ? 'text-red-600' : 'text-gray-900';

export const CardFace = ({ card }: { card: Card }) => (
  <div className="playing-card">
    <div className={`card-corner ${getSuitColorClass(card.suit)}`}>
      <span className="card-rank">{card.rank}</span>
      <span className="card-suit">{SUIT_SYMBOLS[card.suit]}</span>
    </div>
    <div className={`card-suit-large ${getSuitColorClass(card.suit)}`}>
      {SUIT_SYMBOLS[card.suit]}
    </div>
  </div>
);
