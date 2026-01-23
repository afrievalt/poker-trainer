import { useAppDispatch } from '@store/hooks';
import {
  clearResult,
  dealNewHand,
  setHighGuess,
  setStraightHighGuess,
  setLowGuess,
  submitGuess,
  resetGuesses,
  startGame,
  stopGame,
  setInitialTime,
} from '@store/slices/hiLoTrainerSlice';
import { dealOmahaHand } from '@trainer/cards';
import type {
  HighHandLabel,
  LowHandLabel,
  StraightHighLabel,
} from '@trainer/handConstants';
import { useCallback } from 'react';

export const useHiLoActions = () => {
  const dispatch = useAppDispatch();

  return {
    dealNewHand: useCallback(
      () => dispatch(dealNewHand(dealOmahaHand())),
      [dispatch],
    ),
    setHighGuess: useCallback(
      (value: HighHandLabel | null) => dispatch(setHighGuess(value)),
      [dispatch],
    ),
    setStraightHighGuess: useCallback(
      (value: StraightHighLabel | null) =>
        dispatch(setStraightHighGuess(value)),
      [dispatch],
    ),
    setLowGuess: useCallback(
      (value: LowHandLabel | null) => dispatch(setLowGuess(value)),
      [dispatch],
    ),
    submitGuess: useCallback(() => dispatch(submitGuess()), [dispatch]),
    clearResult: useCallback(() => dispatch(clearResult()), [dispatch]),
    resetGuesses: useCallback(() => dispatch(resetGuesses()), [dispatch]),
    onStartGame: useCallback(
      (minutes: number) => dispatch(startGame(minutes)),
      [dispatch],
    ),
    onStopGame: useCallback(() => dispatch(stopGame()), [dispatch]),
    onSetInitialTime: useCallback(
      (minutes: number) => dispatch(setInitialTime(minutes)),
      [dispatch],
    ),
  };
};
