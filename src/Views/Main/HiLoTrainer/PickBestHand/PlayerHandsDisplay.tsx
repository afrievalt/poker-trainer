import { useHiLoActions } from '@hooks/useHiLoActions';
import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import type { JSX } from 'react';

import { CardFace } from '../CardFace';

export const PlayerHandsDisplay = (): JSX.Element => {
  const { playerHands, revealAnswer, answerHandIndices, pickBestHandMode } =
    useHiLoTrainer();
  const { onToggleCardSelection } = useHiLoActions();

  const correctIndices =
    pickBestHandMode === 'high'
      ? answerHandIndices.high
      : answerHandIndices.low;

  return (
    <div className="grid gap-6">
      {playerHands.map((hand, handIdx) => {
        const isCorrectHand = revealAnswer && correctIndices.includes(handIdx);

        return (
          <div
            key={`hand-${handIdx}`}
            className={`rounded-lg border p-3 ${
              isCorrectHand
                ? 'border-green-400 bg-green-50'
                : 'border-gray-100 bg-gray-50/50'
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                Hand {handIdx + 1}
              </p>
              {isCorrectHand && (
                <span className="text-xs font-semibold text-green-600">
                  Best {pickBestHandMode === 'high' ? 'High' : 'Low'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {hand.cards.map((card, cardIdx) => {
                const isSelected = hand.selectedHighIndices.includes(cardIdx);
                return (
                  <div
                    key={`hand-${handIdx}-card-${cardIdx}`}
                    onClick={() =>
                      !revealAnswer && onToggleCardSelection(handIdx, cardIdx)
                    }
                    className={`transition-transform duration-200 ${revealAnswer ? 'cursor-default' : 'cursor-pointer'}`}
                    style={{
                      transform: isSelected
                        ? 'translateY(-5%)'
                        : 'translateY(0)',
                    }}
                  >
                    <CardFace card={card} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
