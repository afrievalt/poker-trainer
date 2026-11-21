import type { Card } from '@poker/evaluation/cards';
import { SUIT_SYMBOLS } from '@poker/evaluation/cardText';

const SUIT_COLOR_CLASSES: Record<Card['suit'], string> = {
  S: 'text-gray-900',
  H: 'text-red-600',
  D: 'text-red-600',
  C: 'text-gray-900',
};

interface CardFaceProps {
  card: Card;
  isCompact?: boolean;
}

export const CardFace = ({ card, isCompact = false }: CardFaceProps) => {
  const sizeClassName = isCompact ? 'playing-card--compact' : '';
  const colorClassName = SUIT_COLOR_CLASSES[card.suit];

  return (
    <div className={`playing-card ${sizeClassName}`}>
      <div className={`card-corner ${colorClassName}`}>
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      <div className={`card-suit-large ${colorClassName}`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
    </div>
  );
};
