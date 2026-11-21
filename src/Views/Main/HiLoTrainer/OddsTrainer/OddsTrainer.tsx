import { CardFace } from '@components/CardFace';
import type { Card } from '@poker/evaluation/cards';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  dealOddsHands,
  revealOddsFlop,
  revealOddsTurn,
  revealOddsRiver,
} from '@store/slices/hiLoTrainerSlice';
import React, { useMemo } from 'react';

import { calculateOdds, type PlayerOdds } from './oddsCalculation';

const OddsBar = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="flex flex-col items-center">
    <span className={`text-xs font-semibold ${color}`}>
      {value.toFixed(0)}%
    </span>
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);

const highlight = (
  isRiver: boolean,
  value: number,
  [normal, strong]: [string, string],
) => (isRiver && value === 100 ? strong : normal);

const PlayerOddsRow = ({
  index,
  hand,
  odds,
  isRiver,
}: {
  index: number;
  hand: Card[];
  odds: PlayerOdds | undefined;
  isRiver: boolean;
}) => (
  <div className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 shadow-sm">
    <span className="w-5 text-xs font-medium text-gray-400">{index + 1}</span>
    <div className="flex gap-1">
      {hand.map((card, j) => (
        <CardFace key={j} card={card} />
      ))}
    </div>
    {odds && (
      <div className="ml-auto flex gap-4">
        <OddsBar
          label="Hi"
          value={odds.high}
          color={highlight(isRiver, odds.high, [
            'text-blue-500',
            'text-blue-700',
          ])}
        />
        <OddsBar
          label="Lo"
          value={odds.low}
          color={highlight(isRiver, odds.low, [
            'text-green-500',
            'text-green-700',
          ])}
        />
        <OddsBar
          label="Scoop"
          value={odds.scoop}
          color={highlight(isRiver, odds.scoop, [
            'text-purple-500',
            'text-purple-700',
          ])}
        />
      </div>
    )}
  </div>
);

const STREET_BUTTON: Record<0 | 3 | 4 | 5, string> = {
  0: 'Flop',
  3: 'Turn',
  4: 'River',
  5: 'New Hand',
};

export const OddsTrainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { oddsPlayerHands, oddsBoard, oddsRevealedCount, mode } =
    useAppSelector((s) => s.hiLoTrainer);

  const revealedCommunity = oddsBoard.slice(0, oddsRevealedCount);

  const odds = useMemo(
    () =>
      oddsPlayerHands.length > 0
        ? calculateOdds(oddsPlayerHands, revealedCommunity)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [oddsPlayerHands, oddsRevealedCount],
  );

  const handleButton = () => {
    if (oddsRevealedCount === 0) dispatch(revealOddsFlop());
    else if (oddsRevealedCount === 3) dispatch(revealOddsTurn());
    else if (oddsRevealedCount === 4) dispatch(revealOddsRiver());
    else dispatch(dealOddsHands());
  };

  const buttonLabel = STREET_BUTTON[oddsRevealedCount];
  const isRiver = oddsRevealedCount === 5;

  return (
    <div className="space-y-4 p-2 sm:p-0">
      <h2 className="text-lg font-bold text-gray-900">
        Odds — {mode === 'OddsBigO' ? 'Big O (5 card)' : 'Omaha Hi-Lo'}
      </h2>

      <div className="space-y-2">
        {oddsPlayerHands.map((hand, i) => (
          <PlayerOddsRow
            key={i}
            index={i}
            hand={hand}
            odds={odds[i]}
            isRiver={isRiver}
          />
        ))}
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="mb-2 text-xs font-medium tracking-wide text-gray-400 uppercase">
          Community Cards
        </div>
        <div className="flex min-h-[3.75rem] flex-wrap gap-2">
          {revealedCommunity.map((card, i) => (
            <CardFace key={i} card={card} />
          ))}
        </div>
        <button
          onClick={handleButton}
          className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};
