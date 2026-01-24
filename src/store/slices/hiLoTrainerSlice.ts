import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { dealOmahaHand, dealPickBestHand } from '@trainer/cards';
import type { Card } from '@trainer/cards';
import { getBestPossibleOmahaHiLoFromCommunity } from '@trainer/communityOmahaEvaluation';
import type {
  HighHandLabel,
  LowHandLabel,
  StraightHighLabel,
} from '@trainer/handConstants';

import { evaluatePickBestHand } from '../../Views/Main/HiLoTrainer/pickBestHandEvaluation';

export type GameMode = 'BestPossible' | 'BigO' | 'Omaha';

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
  actualHigh: string;
  actualLow: string;
  isHighCorrect: boolean;
  isLowCorrect: boolean;
}

export interface PlayerHand {
  cards: Card[];
  selectedHighIndices: number[];
  selectedLowIndices: number[];
}

export interface HiLoTrainerState {
  mode: GameMode;
  communityCards: Card[];
  holeCards: Card[]; // for BestPossible mode
  playerHands: PlayerHand[]; // for PickBestHand modes
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
  mode: 'BestPossible',
  communityCards: initialDeal.communityCards,
  holeCards: initialDeal.holeCards,
  playerHands: [],
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
      state.lastResult = null;

      if (state.mode === 'BestPossible') {
        const newDeal = dealOmahaHand();
        state.communityCards = newDeal.communityCards;
        state.holeCards = newDeal.holeCards;
        state.playerHands = [];
      } else {
        const handSize = state.mode === 'BigO' ? 5 : 4;
        const deal = dealPickBestHand(4, handSize);
        state.communityCards = deal.communityCards;
        state.playerHands = deal.hands.map((cards) => ({
          cards,
          selectedHighIndices: [],
          selectedLowIndices: [],
        }));
        state.holeCards = [];
      }
      state.highGuess = null;
      state.straightHighGuess = null;
      state.lowGuess = null;
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
    dealNewHand: (state) => {
      if (state.mode === 'BestPossible') {
        const newDeal = dealOmahaHand();
        state.communityCards = newDeal.communityCards;
        state.holeCards = newDeal.holeCards;
        state.playerHands = [];
      } else {
        const handSize = state.mode === 'BigO' ? 5 : 4;
        const deal = dealPickBestHand(4, handSize);
        state.communityCards = deal.communityCards;
        state.playerHands = deal.hands.map((cards) => ({
          cards,
          selectedHighIndices: [],
          selectedLowIndices: [],
        }));
        state.holeCards = [];
      }
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
    setMode: (state, action: PayloadAction<GameMode>) => {
      state.mode = action.payload;
      state.lastResult = null;
      state.highGuess = null;
      state.straightHighGuess = null;
      state.lowGuess = null;

      if (action.payload === 'BestPossible') {
        const deal = dealOmahaHand();
        state.communityCards = deal.communityCards;
        state.holeCards = deal.holeCards;
        state.playerHands = [];
      } else {
        const handSize = action.payload === 'BigO' ? 5 : 4;
        const deal = dealPickBestHand(4, handSize);
        state.communityCards = deal.communityCards;
        state.playerHands = deal.hands.map((cards) => ({
          cards,
          selectedHighIndices: [], // We'll just use one set of indices if we decide it's simpler
          selectedLowIndices: [],
        }));
        state.holeCards = [];
      }
    },
    toggleCardSelection: (
      state,
      action: PayloadAction<{ handIndex: number; cardIndex: number }>,
    ) => {
      const { handIndex, cardIndex } = action.payload;
      const hand = state.playerHands[handIndex];
      if (!hand) return;

      // Using a single selection list for now as per "rise 5%" requirement
      const idx = hand.selectedHighIndices.indexOf(cardIndex);
      if (idx > -1) {
        hand.selectedHighIndices.splice(idx, 1);
      } else {
        hand.selectedHighIndices.push(cardIndex);
      }
    },
    checkPickAnswer: (state) => {
      if (!state.isGameActive || state.timeLeft <= 0) return;

      const selectedIndices = state.playerHands.map(
        (h) => h.selectedHighIndices,
      );
      const result = evaluatePickBestHand(
        state.communityCards,
        state.playerHands.map((h) => h.cards),
        selectedIndices,
      );

      state.lastResult = {
        actualHigh: result.absoluteBestHigh,
        actualLow: result.absoluteBestLow,
        isHighCorrect: result.isHighCorrect,
        isLowCorrect: result.isLowCorrect,
      };

      if (result.isCorrect) {
        state.score.correct += 1;
        // Deal new hand immediately when correct
        const handSize = state.mode === 'BigO' ? 5 : 4;
        const deal = dealPickBestHand(4, handSize);
        state.communityCards = deal.communityCards;
        state.playerHands = deal.hands.map((cards) => ({
          cards,
          selectedHighIndices: [],
          selectedLowIndices: [],
        }));
        state.lastResult = null; // Clear result for the new hand
      } else {
        state.score.incorrect += 1;
      }
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
  setMode,
  toggleCardSelection,
  checkPickAnswer,
} = hiLoTrainerSlice.actions;
export default hiLoTrainerSlice.reducer;
