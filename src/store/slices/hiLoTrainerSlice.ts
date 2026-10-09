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

export type GameMode =
  | 'BestPossible'
  | 'BigO'
  | 'Omaha'
  | 'OddsOmaha'
  | 'OddsBigO';
export type PickBestHandMode = 'high' | 'low';

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
  isCorrect: boolean;
}

export interface PlayerHand {
  cards: Card[];
  selectedHighIndices: number[];
  selectedLowIndices: number[];
}

export interface HiLoTrainerState {
  mode: GameMode;
  pickBestHandMode: PickBestHandMode;
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
  consecutiveWrong: number;
  revealAnswer: boolean;
  answerHandIndices: { high: number[]; low: number[] };
  oddsPlayerHands: Card[][];
  oddsBoard: Card[];
  oddsRevealedCount: 0 | 3 | 4 | 5;
}

const initialDeal = dealOmahaHand();

const initialState: HiLoTrainerState = {
  mode: 'BestPossible',
  pickBestHandMode: 'high',
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
  consecutiveWrong: 0,
  revealAnswer: false,
  answerHandIndices: { high: [], low: [] },
  oddsPlayerHands: [],
  oddsBoard: [],
  oddsRevealedCount: 0,
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
      state.consecutiveWrong = 0;
      state.revealAnswer = false;
      state.answerHandIndices = { high: [], low: [] };

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
      state.consecutiveWrong = 0;
      state.revealAnswer = false;
      state.answerHandIndices = { high: [], low: [] };
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
        isCorrect: isHighCorrect && isLowCorrect,
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
    setPickBestHandMode: (state, action: PayloadAction<PickBestHandMode>) => {
      state.pickBestHandMode = action.payload;
      state.consecutiveWrong = 0;
      state.revealAnswer = false;
      state.answerHandIndices = { high: [], low: [] };
    },
    setMode: (state, action: PayloadAction<GameMode>) => {
      state.mode = action.payload;
      state.lastResult = null;
      state.highGuess = null;
      state.straightHighGuess = null;
      state.lowGuess = null;
      state.consecutiveWrong = 0;
      state.revealAnswer = false;
      state.answerHandIndices = { high: [], low: [] };

      if (action.payload === 'BestPossible') {
        const deal = dealOmahaHand();
        state.communityCards = deal.communityCards;
        state.holeCards = deal.holeCards;
        state.playerHands = [];
      } else if (
        action.payload === 'OddsOmaha' ||
        action.payload === 'OddsBigO'
      ) {
        const handSize = action.payload === 'OddsBigO' ? 5 : 4;
        const deal = dealPickBestHand(5, handSize);
        state.oddsPlayerHands = deal.hands;
        state.oddsBoard = deal.communityCards;
        state.oddsRevealedCount = 0;
        state.playerHands = [];
        state.holeCards = [];
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
    dealOddsHands: (state) => {
      const handSize = state.mode === 'OddsBigO' ? 5 : 4;
      const deal = dealPickBestHand(5, handSize);
      state.oddsPlayerHands = deal.hands;
      state.oddsBoard = deal.communityCards;
      state.oddsRevealedCount = 0;
    },
    revealOddsFlop: (state) => {
      state.oddsRevealedCount = 3;
    },
    revealOddsTurn: (state) => {
      state.oddsRevealedCount = 4;
    },
    revealOddsRiver: (state) => {
      state.oddsRevealedCount = 5;
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

      state.answerHandIndices = {
        high: result.winningHighHandIndices,
        low: result.winningLowHandIndices,
      };

      const isCorrect =
        state.pickBestHandMode === 'high'
          ? result.isHighCorrect
          : result.isLowCorrect;

      state.lastResult = {
        actualHigh: result.absoluteBestHigh,
        actualLow: result.absoluteBestLow,
        isHighCorrect: result.isHighCorrect,
        isLowCorrect: result.isLowCorrect,
        isCorrect,
      };

      if (isCorrect) {
        state.score.correct += 1;
        state.consecutiveWrong = 0;
        state.revealAnswer = false;

        if (state.pickBestHandMode === 'high') {
          // Advance to low phase with the same hands (or skip if no low possible)
          if (result.winningLowHandIndices.length === 0) {
            // No low possible — deal a new hand
            const handSize = state.mode === 'BigO' ? 5 : 4;
            const deal = dealPickBestHand(4, handSize);
            state.communityCards = deal.communityCards;
            state.playerHands = deal.hands.map((cards) => ({
              cards,
              selectedHighIndices: [],
              selectedLowIndices: [],
            }));
            state.pickBestHandMode = 'high';
          } else {
            state.pickBestHandMode = 'low';
            state.playerHands.forEach((h) => {
              h.selectedHighIndices = [];
            });
          }
        } else {
          // Correct low — deal a new hand and restart from high
          const handSize = state.mode === 'BigO' ? 5 : 4;
          const deal = dealPickBestHand(4, handSize);
          state.communityCards = deal.communityCards;
          state.playerHands = deal.hands.map((cards) => ({
            cards,
            selectedHighIndices: [],
            selectedLowIndices: [],
          }));
          state.pickBestHandMode = 'high';
          state.answerHandIndices = { high: [], low: [] };
        }
      } else {
        state.score.incorrect += 1;
        state.consecutiveWrong += 1;
        if (state.consecutiveWrong >= 2) {
          state.revealAnswer = true;
        }
      }
    },
    advancePhase: (state) => {
      state.consecutiveWrong = 0;
      state.revealAnswer = false;
      state.lastResult = null;

      if (state.pickBestHandMode === 'high') {
        // Skip high phase — move to low if possible, else deal new hand
        if (state.answerHandIndices.low.length === 0) {
          const handSize = state.mode === 'BigO' ? 5 : 4;
          const deal = dealPickBestHand(4, handSize);
          state.communityCards = deal.communityCards;
          state.playerHands = deal.hands.map((cards) => ({
            cards,
            selectedHighIndices: [],
            selectedLowIndices: [],
          }));
          state.pickBestHandMode = 'high';
          state.answerHandIndices = { high: [], low: [] };
        } else {
          state.pickBestHandMode = 'low';
          state.playerHands.forEach((h) => {
            h.selectedHighIndices = [];
          });
        }
      } else {
        // Skip low phase — deal new hand
        const handSize = state.mode === 'BigO' ? 5 : 4;
        const deal = dealPickBestHand(4, handSize);
        state.communityCards = deal.communityCards;
        state.playerHands = deal.hands.map((cards) => ({
          cards,
          selectedHighIndices: [],
          selectedLowIndices: [],
        }));
        state.pickBestHandMode = 'high';
        state.answerHandIndices = { high: [], low: [] };
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
  setPickBestHandMode,
  toggleCardSelection,
  checkPickAnswer,
  advancePhase,
  dealOddsHands,
  revealOddsFlop,
  revealOddsTurn,
  revealOddsRiver,
} = hiLoTrainerSlice.actions;
export default hiLoTrainerSlice.reducer;
