import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import { JSX } from 'react';

import { CardFace } from '../CardFace';

export const CommunityCardsDisplay = (): JSX.Element => {
  const { communityCards } = useHiLoTrainer();

  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-semibold text-gray-700">
        Community cards
      </p>
      <div className="flex flex-wrap gap-2">
        {communityCards.map((card, idx) => (
          <CardFace
            key={`community-${idx}-${card.rank}${card.suit}`}
            card={card}
          />
        ))}
      </div>
    </div>
  );
};
