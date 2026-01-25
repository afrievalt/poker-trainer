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
  setMode,
  toggleCardSelection,
  checkPickAnswer,
} from '@store/slices/hiLoTrainerSlice';
import type { GameMode } from '@store/slices/hiLoTrainerSlice';
import type {
  HighHandLabel,
  LowHandLabel,
  StraightHighLabel,
} from '@trainer/handConstants';
import { useCallback } from 'react';

export const useHiLoActions = () => {
  const dispatch = useAppDispatch();

  return {
    dealNewHand: useCallback(() => dispatch(dealNewHand()), [dispatch]),
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
    onSetMode: useCallback(
      (mode: GameMode) => dispatch(setMode(mode)),
      [dispatch],
    ),
    onToggleCardSelection: useCallback(
      (handIndex: number, cardIndex: number) =>
        dispatch(toggleCardSelection({ handIndex, cardIndex })),
      [dispatch],
    ),
    onCheckPickAnswer: useCallback(
      () => dispatch(checkPickAnswer()),
      [dispatch],
    ),
  };
};
