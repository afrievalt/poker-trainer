import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  clearResult,
  dealNewHand,
  setHighGuess,
  setLowGuess,
  submitGuess,
} from '@store/slices/hiLoTrainerSlice';
import type { GuessResult } from '@store/slices/hiLoTrainerSlice';
import { dealOmahaHand } from '@trainer/cards';
import type { Card } from '@trainer/cards';
import { getBestPossibleOmahaHiLoFromCommunity } from '@trainer/communityOmahaEvaluation';
import { HIGH_HAND_OPTIONS, LOW_HAND_OPTIONS } from '@trainer/handConstants';
import type { HighHandLabel, LowHandLabel } from '@trainer/handConstants';

interface HiLoTrainerHook {
  communityCards: Card[];
  holeCards: Card[];
  highGuess: HighHandLabel | null;
  lowGuess: LowHandLabel | null;
  lastResult: GuessResult | null;
  highOptions: readonly HighHandLabel[];
  lowOptions: readonly LowHandLabel[];
  dealNewHand: () => void;
  setHighGuess: (value: HighHandLabel | null) => void;
  setLowGuess: (value: LowHandLabel | null) => void;
  submitGuess: () => void;
  clearResult: () => void;
}

export const useHiLoTrainer = (): HiLoTrainerHook => {
  const dispatch = useAppDispatch();
  const { communityCards, holeCards, highGuess, lowGuess, lastResult } =
    useAppSelector((state) => state.hiLoTrainer);

  const handleDealNewHand = (): void => {
    dispatch(dealNewHand(dealOmahaHand()));
  };

  const handleSetHighGuess = (value: HighHandLabel | null): void => {
    dispatch(setHighGuess(value));
  };

  const handleSetLowGuess = (value: LowHandLabel | null): void => {
    dispatch(setLowGuess(value));
  };

  const handleSubmitGuess = (): void => {
    dispatch(submitGuess());
  };

  const handleClearResult = (): void => {
    dispatch(clearResult());
  };

  const result = getBestPossibleOmahaHiLoFromCommunity(communityCards);

  // Filter high options to exclude impossible ones
  const possibleHighCategories = [result.high.category];
  const filteredHighOptions = HIGH_HAND_OPTIONS.filter(
    (option) =>
      possibleHighCategories.includes(option) ||
      // Include some reasonable alternatives but exclude obviously wrong ones
      (option !== 'High Card' &&
        option !== 'Two Pair' &&
        option !== 'Full House'),
  );

  return {
    communityCards,
    holeCards,
    highGuess,
    lowGuess,
    lastResult,
    highOptions: filteredHighOptions,
    lowOptions: LOW_HAND_OPTIONS,
    dealNewHand: handleDealNewHand,
    setHighGuess: handleSetHighGuess,
    setLowGuess: handleSetLowGuess,
    submitGuess: handleSubmitGuess,
    clearResult: handleClearResult,
  };
};
