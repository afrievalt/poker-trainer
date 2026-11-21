import { CardBack } from '@components/CardBack';
import { CardFace } from '@components/CardFace';
import { getCardCode } from '@poker/evaluation/cards';
import React from 'react';

import { useSeatView } from './useSeatView';

interface SeatCardsProps {
  seatPosition: number;
}

export const SeatCards: React.FC<SeatCardsProps> = ({ seatPosition }) => {
  const { holeCards, isFaceUp, isHero } = useSeatView(seatPosition);
  const isCompact = !isHero;
  const gapClassName = isHero ? 'gap-1' : '';

  return (
    <div className={`flex ${gapClassName}`}>
      {holeCards.map((card) =>
        isFaceUp ? (
          <CardFace key={getCardCode(card)} card={card} isCompact={isCompact} />
        ) : (
          <CardBack key={getCardCode(card)} />
        ),
      )}
    </div>
  );
};
