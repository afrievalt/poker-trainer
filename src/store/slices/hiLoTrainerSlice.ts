import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { dealOmahaHand } from '@trainer/cards';
import type { Card } from '@trainer/cards';
import { getBestPossibleOmahaHiLoFromCommunity } from '@trainer/communityOmahaEvaluation';
import type { HighHandLabel, LowHandLabel } from '@trainer/handConstants';

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
  lowGuess: LowHandLabel | null;
  lastResult: GuessResult | null;
}

const initialDeal = dealOmahaHand();

const initialState: HiLoTrainerState = {
  communityCards: initialDeal.communityCards,
  holeCards: initialDeal.holeCards,
  highGuess: null,
  lowGuess: null,
  lastResult: null,
};

const hiLoTrainerSlice = createSlice({
  name: 'hiLoTrainer',
  initialState,
  reducers: {
    dealNewHand: (
      state,
      action: PayloadAction<{ communityCards: Card[]; holeCards: Card[] }>,
    ) => {
      state.communityCards = action.payload.communityCards;
      state.holeCards = action.payload.holeCards;
      state.highGuess = null;
      state.lowGuess = null;
      state.lastResult = null;
    },
    setHighGuess: (state, action: PayloadAction<HighHandLabel | null>) => {
      state.highGuess = action.payload;
    },
    setLowGuess: (state, action: PayloadAction<LowHandLabel | null>) => {
      state.lowGuess = action.payload;
    },
    submitGuess: (state) => {
      const result = getBestPossibleOmahaHiLoFromCommunity(
        state.communityCards,
      );
      const actualLow = formatLow(result.low);
      state.lastResult = {
        actualHigh: result.high.category,
        actualLow,
        isHighCorrect: state.highGuess === result.high.category,
        isLowCorrect: state.lowGuess === actualLow,
      };
    },
    clearResult: (state) => {
      state.lastResult = null;
    },
  },
});

export const {
  dealNewHand,
  setHighGuess,
  setLowGuess,
  submitGuess,
  clearResult,
} = hiLoTrainerSlice.actions;
export default hiLoTrainerSlice.reducer;
