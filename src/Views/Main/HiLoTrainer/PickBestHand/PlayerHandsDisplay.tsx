import { useHiLoActions } from '@hooks/useHiLoActions';
import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import { JSX } from 'react';

import { CardFace } from '../CardFace';

export const PlayerHandsDisplay = (): JSX.Element => {
  const { playerHands } = useHiLoTrainer();
  const { onToggleCardSelection } = useHiLoActions();

  return (
    <div className="grid gap-6">
      {playerHands.map((hand, handIdx) => (
        <div
          key={`hand-${handIdx}`}
          className="rounded-lg border border-gray-100 bg-gray-50/50 p-3"
        >
          <p className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">
            Hand {handIdx + 1}
          </p>
          <div className="flex flex-wrap gap-2">
            {hand.cards.map((card, cardIdx) => {
              const isSelected = hand.selectedHighIndices.includes(cardIdx);
              return (
                <div
                  key={`hand-${handIdx}-card-${cardIdx}`}
                  onClick={() => onToggleCardSelection(handIdx, cardIdx)}
                  className="cursor-pointer transition-transform duration-200"
                  style={{
                    transform: isSelected ? 'translateY(-5%)' : 'translateY(0)',
                  }}
                >
                  <CardFace card={card} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
