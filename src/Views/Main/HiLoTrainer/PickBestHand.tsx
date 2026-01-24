import { useHiLoActions } from '@hooks/useHiLoActions';
import { useHiLoTrainer } from '@hooks/useHiLoTrainer';

import { CardFace } from './CardFace';
import { FeedbackOverlay } from './FeedbackOverlay';
import { GameControls } from './GameControls';
import { ResultPanel } from './ResultPanel';

export const PickBestHand = () => {
  const { isGameActive, communityCards, playerHands, mode } = useHiLoTrainer();
  const { onToggleCardSelection, onCheckPickAnswer } = useHiLoActions();

  if (!isGameActive) {
    return (
      <section className="relative rounded-md bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'BigO' ? 'BigO' : 'Omaha'} Pick Best Hand
          </h2>
          <p className="text-sm text-gray-600">
            Select the 2 cards from the hand(s) that make the best possible high
            and low.
          </p>
        </header>
        <GameControls />
        <ResultPanel />
      </section>
    );
  }

  return (
    <section className="relative rounded-md bg-white p-4 shadow-sm">
      <header className="mb-3">
        <h2 className="text-lg font-semibold text-gray-900">
          {mode === 'BigO' ? 'BigO' : 'Omaha'} Pick Best Hand
        </h2>
        <p className="text-sm text-gray-600">
          Select the 2 cards from the hand(s) that make the best possible high
          (and low if available).
        </p>
      </header>
      <GameControls />

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
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onCheckPickAnswer}
          className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Check Answer
        </button>
      </div>

      <FeedbackOverlay />
    </section>
  );
};
