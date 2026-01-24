import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { dealOmahaHand } from '@trainer/cards';
import type { Card } from '@trainer/cards';
import { getBestPossibleOmahaHiLoFromCommunity } from '@trainer/communityOmahaEvaluation';
import type {
  HighHandLabel,
  LowHandLabel,
  StraightHighLabel,
} from '@trainer/handConstants';

const formatLow = (ranks: number[] | null): string => {
  if (!ranks) {
    return 'no low';
  }
  if (ranks.join(',') === '1,2,3,4,5') {
    return 'wheel';
  }
  return `${ranks[ranks.length - 1]}-low`;
};

export interface GuessResult {
  actualHigh: HighHandLabel;
  actualLow: string;
  isHighCorrect: boolean;
  isLowCorrect: boolean;
}

export interface HiLoTrainerState {
  communityCards: Card[];
  holeCards: Card[];
  highGuess: HighHandLabel | null;
  straightHighGuess: StraightHighLabel | null;
  lowGuess: LowHandLabel | null;
  lastResult: GuessResult | null;
  isGameActive: boolean;
  timeLeft: number; // in seconds
  initialTime: number; // in minutes
  score: {
    correct: number;
    incorrect: number;
  };
}

const initialDeal = dealOmahaHand();

const initialState: HiLoTrainerState = {
  communityCards: initialDeal.communityCards,
  holeCards: initialDeal.holeCards,
  highGuess: null,
  straightHighGuess: null,
  lowGuess: null,
  lastResult: null,
  isGameActive: false,
  timeLeft: 120, // 2 minutes default
  initialTime: 2,
  score: {
    correct: 0,
    incorrect: 0,
  },
};

const hiLoTrainerSlice = createSlice({
  name: 'hiLoTrainer',
  initialState,
  reducers: {
    startGame: (state, action: PayloadAction<number>) => {
      state.isGameActive = true;
      state.initialTime = action.payload;
      state.timeLeft = action.payload * 60;
      state.score = { correct: 0, incorrect: 0 };
      const newDeal = dealOmahaHand();
      state.communityCards = newDeal.communityCards;
      state.holeCards = newDeal.holeCards;
      state.highGuess = null;
      state.straightHighGuess = null;
      state.lowGuess = null;
      state.lastResult = null;
    },
    stopGame: (state) => {
      state.isGameActive = false;
    },
    tick: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
      } else {
        state.isGameActive = false;
      }
    },
    setInitialTime: (state, action: PayloadAction<number>) => {
      state.initialTime = action.payload;
      state.timeLeft = action.payload * 60;
    },
    dealNewHand: (
      state,
      action: PayloadAction<{ communityCards: Card[]; holeCards: Card[] }>,
    ) => {
      state.communityCards = action.payload.communityCards;
      state.holeCards = action.payload.holeCards;
      state.highGuess = null;
      state.straightHighGuess = null;
      state.lowGuess = null;
      state.lastResult = null;
    },
    setHighGuess: (state, action: PayloadAction<HighHandLabel | null>) => {
      state.highGuess = action.payload;
      // Reset straight high guess when changing high guess
      if (action.payload !== 'Straight') {
        state.straightHighGuess = null;
      }
    },
    setStraightHighGuess: (
      state,
      action: PayloadAction<StraightHighLabel | null>,
    ) => {
      state.straightHighGuess = action.payload;
    },
    setLowGuess: (state, action: PayloadAction<LowHandLabel | null>) => {
      state.lowGuess = action.payload;
    },
    submitGuess: (state) => {
      if (!state.isGameActive || state.timeLeft <= 0) {
        return;
      }

      const result = getBestPossibleOmahaHiLoFromCommunity(
        state.communityCards,
      );
      const actualLow = formatLow(result.low);

      let isHighCorrect = state.highGuess === result.high.category;

      // For straights, also check the high rank
      if (
        state.highGuess === 'Straight' &&
        result.high.category === 'Straight'
      ) {
        // Convert straightHigh value to letter (5->'5', 6->'6', ..., 10->'T', 11->'J', 12->'Q', 13->'K', 14->'A')
        const straightHighMap: Record<number, StraightHighLabel> = {
          5: '5',
          6: '6',
          7: '7',
          8: '8',
          9: '9',
          10: 'T',
          11: 'J',
          12: 'Q',
          13: 'K',
          14: 'A',
        };
        const actualStraightHigh = straightHighMap[result.high.straightHigh!];
        isHighCorrect =
          isHighCorrect && state.straightHighGuess === actualStraightHigh;
      }

      const isLowCorrect = state.lowGuess === actualLow;
      const isCorrect = isHighCorrect && isLowCorrect;

      if (state.isGameActive) {
        if (isCorrect) {
          state.score.correct += 1;
          // Deal new hand immediately when correct
          const newDeal = dealOmahaHand();
          state.communityCards = newDeal.communityCards;
          state.holeCards = newDeal.holeCards;
          state.highGuess = null;
          state.straightHighGuess = null;
          state.lowGuess = null;
        } else {
          state.score.incorrect += 1;
        }
      }

      state.lastResult = {
        actualHigh: result.high.category,
        actualLow,
        isHighCorrect,
        isLowCorrect,
      };
    },
    clearResult: (state) => {
      state.lastResult = null;
    },
    resetGuesses: (state) => {
      state.highGuess = null;
      state.straightHighGuess = null;
      state.lowGuess = null;
      state.lastResult = null;
    },
  },
});

export const {
  startGame,
  stopGame,
  tick,
  setInitialTime,
  dealNewHand,
  setHighGuess,
  setStraightHighGuess,
  setLowGuess,
  submitGuess,
  clearResult,
  resetGuesses,
} = hiLoTrainerSlice.actions;
export default hiLoTrainerSlice.reducer;
