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
}

const initialDeal = dealOmahaHand();

const initialState: HiLoTrainerState = {
  communityCards: initialDeal.communityCards,
  holeCards: initialDeal.holeCards,
  highGuess: null,
  straightHighGuess: null,
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

      state.lastResult = {
        actualHigh: result.high.category,
        actualLow,
        isHighCorrect,
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
  setStraightHighGuess,
  setLowGuess,
  submitGuess,
  clearResult,
} = hiLoTrainerSlice.actions;
export default hiLoTrainerSlice.reducer;
