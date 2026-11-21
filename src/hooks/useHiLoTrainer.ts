import type { Card } from '@poker/evaluation/cards';
import { getBestPossibleOmahaHiLoFromCommunity } from '@poker/evaluation/communityOmahaEvaluation';
import {
  HIGH_HAND_OPTIONS,
  LOW_HAND_OPTIONS,
} from '@poker/evaluation/handConstants';
import type {
  HighHandLabel,
  LowHandLabel,
  StraightHighLabel,
} from '@poker/evaluation/handConstants';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { tick } from '@store/slices/hiLoTrainerSlice';
import type {
  GuessResult,
  GameMode,
  PickBestHandMode,
  PlayerHand,
} from '@store/slices/hiLoTrainerSlice';
import { useEffect } from 'react';

import { useHiLoActions } from './useHiLoActions';

interface HiLoTrainerHook {
  mode: GameMode;
  pickBestHandMode: PickBestHandMode;
  communityCards: Card[];
  holeCards: Card[];
  playerHands: PlayerHand[];
  highGuess: HighHandLabel | null;
  straightHighGuess: StraightHighLabel | null;
  lowGuess: LowHandLabel | null;
  lastResult: GuessResult | null;
  isGameActive: boolean;
  timeLeft: number;
  initialTime: number;
  score: { correct: number; incorrect: number };
  consecutiveWrong: number;
  revealAnswer: boolean;
  answerHandIndices: { high: number[]; low: number[] };
  highOptions: readonly HighHandLabel[];
  lowOptions: readonly LowHandLabel[];
  dealNewHand: () => void;
  setHighGuess: (value: HighHandLabel | null) => void;
  setStraightHighGuess: (value: StraightHighLabel | null) => void;
  setLowGuess: (value: LowHandLabel | null) => void;
  submitGuess: () => void;
  clearResult: () => void;
  resetGuesses: () => void;
  onStartGame: (minutes: number) => void;
  onStopGame: () => void;
  onSetInitialTime: (minutes: number) => void;
  onAdvancePhase: () => void;
  onToggleCardSelection: (handIndex: number, cardIndex: number) => void;
  onCheckPickAnswer: () => void;
}

const getFilteredHighOptions = (communityCards: Card[]) => {
  const result = getBestPossibleOmahaHiLoFromCommunity(communityCards);
  const possibleHighCategories = [result.high.category];
  return HIGH_HAND_OPTIONS.filter(
    (option) =>
      possibleHighCategories.includes(option) ||
      (option !== 'High Card' &&
        option !== 'Two Pair' &&
        option !== 'Full House'),
  );
};

export const useHiLoTrainer = (): HiLoTrainerHook => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.hiLoTrainer);
  const actions = useHiLoActions();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.isGameActive && state.timeLeft > 0) {
      interval = setInterval(() => dispatch(tick()), 1000);
    }
    return () => clearInterval(interval);
  }, [state.isGameActive, state.timeLeft, dispatch]);

  return {
    ...state,
    ...actions,
    highOptions: getFilteredHighOptions(state.communityCards),
    lowOptions: LOW_HAND_OPTIONS,
  };
};
