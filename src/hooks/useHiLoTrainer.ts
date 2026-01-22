import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  clearResult,
  dealNewHand,
  setHighGuess,
  setStraightHighGuess,
  setLowGuess,
  submitGuess,
} from '@store/slices/hiLoTrainerSlice';
import type { GuessResult } from '@store/slices/hiLoTrainerSlice';
import { dealOmahaHand } from '@trainer/cards';
import type { Card } from '@trainer/cards';
import { getBestPossibleOmahaHiLoFromCommunity } from '@trainer/communityOmahaEvaluation';
import { HIGH_HAND_OPTIONS, LOW_HAND_OPTIONS } from '@trainer/handConstants';
import type {
  HighHandLabel,
  LowHandLabel,
  StraightHighLabel,
} from '@trainer/handConstants';

interface HiLoTrainerHook {
  communityCards: Card[];
  holeCards: Card[];
  highGuess: HighHandLabel | null;
  straightHighGuess: StraightHighLabel | null;
  lowGuess: LowHandLabel | null;
  lastResult: GuessResult | null;
  highOptions: readonly HighHandLabel[];
  lowOptions: readonly LowHandLabel[];
  dealNewHand: () => void;
  setHighGuess: (value: HighHandLabel | null) => void;
  setStraightHighGuess: (value: StraightHighLabel | null) => void;
  setLowGuess: (value: LowHandLabel | null) => void;
  submitGuess: () => void;
  clearResult: () => void;
}

export const useHiLoTrainer = (): HiLoTrainerHook => {
  const dispatch = useAppDispatch();
  const {
    communityCards,
    holeCards,
    highGuess,
    straightHighGuess,
    lowGuess,
    lastResult,
  } = useAppSelector((state) => state.hiLoTrainer);

  const handleDealNewHand = (): void => {
    dispatch(dealNewHand(dealOmahaHand()));
  };

  const handleSetHighGuess = (value: HighHandLabel | null): void => {
    dispatch(setHighGuess(value));
  };

  const handleSetStraightHighGuess = (
    value: StraightHighLabel | null,
  ): void => {
    dispatch(setStraightHighGuess(value));
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
    straightHighGuess,
    lowGuess,
    lastResult,
    highOptions: filteredHighOptions,
    lowOptions: LOW_HAND_OPTIONS,
    dealNewHand: handleDealNewHand,
    setHighGuess: handleSetHighGuess,
    setStraightHighGuess: handleSetStraightHighGuess,
    setLowGuess: handleSetLowGuess,
    submitGuess: handleSubmitGuess,
    clearResult: handleClearResult,
  };
};
