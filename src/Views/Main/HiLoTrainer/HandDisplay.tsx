import { useHiLoTrainer } from '@hooks/useHiLoTrainer';

import { CardFace } from './CardFace';

export const HandDisplay = () => {
  const { communityCards } = useHiLoTrainer();

  return (
    <div className="mb-4 grid gap-3">
      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700">
          Community cards
        </p>
        <div className="flex flex-wrap gap-2">
          {communityCards.map((card) => (
            <CardFace key={`${card.rank}${card.suit}`} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
};
