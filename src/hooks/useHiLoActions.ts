import type {
  HighHandLabel,
  LowHandLabel,
  StraightHighLabel,
} from '@poker/evaluation/handConstants';
import { useAppDispatch } from '@store/hooks';
import {
  advancePhase,
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
  toggleCardSelection,
  checkPickAnswer,
  dealOddsHands,
  revealOddsFlop,
  revealOddsTurn,
  revealOddsRiver,
} from '@store/slices/hiLoTrainerSlice';
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
    onAdvancePhase: useCallback(() => dispatch(advancePhase()), [dispatch]),
    onToggleCardSelection: useCallback(
      (handIndex: number, cardIndex: number) =>
        dispatch(toggleCardSelection({ handIndex, cardIndex })),
      [dispatch],
    ),
    onCheckPickAnswer: useCallback(
      () => dispatch(checkPickAnswer()),
      [dispatch],
    ),
    onDealOddsHands: useCallback(() => dispatch(dealOddsHands()), [dispatch]),
    onRevealOddsFlop: useCallback(() => dispatch(revealOddsFlop()), [dispatch]),
    onRevealOddsTurn: useCallback(() => dispatch(revealOddsTurn()), [dispatch]),
    onRevealOddsRiver: useCallback(
      () => dispatch(revealOddsRiver()),
      [dispatch],
    ),
  };
};
