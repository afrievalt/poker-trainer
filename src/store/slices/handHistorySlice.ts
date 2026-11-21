import type {
  CompletedHand,
  HandRecord,
  HeroDecisionRecord,
} from '@poker/tracking/trackingTypes';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface HandHistoryState {
  currentHandDecisions: HeroDecisionRecord[];
  hands: HandRecord[];
  storedHands: HandRecord[];
  reviewedHandId: string | null;
}

const initialState: HandHistoryState = {
  currentHandDecisions: [],
  hands: [],
  storedHands: [],
  reviewedHandId: null,
};

const handHistorySlice = createSlice({
  name: 'handHistory',
  initialState,
  reducers: {
    heroDecisionRecorded: (
      state,
      action: PayloadAction<HeroDecisionRecord>,
    ) => {
      state.currentHandDecisions.push(action.payload);
    },
    handCompleted: (state, action: PayloadAction<CompletedHand>) => {
      const decisions = state.currentHandDecisions.filter(
        (decision) => decision.handNumber === action.payload.handNumber,
      );
      state.hands.push({ ...action.payload, decisions });
      state.currentHandDecisions = [];
    },
    handReviewOpened: (state, action: PayloadAction<string>) => {
      state.reviewedHandId = action.payload;
    },
    storedHandsLoaded: (state, action: PayloadAction<HandRecord[]>) => {
      state.storedHands = action.payload;
    },
    playerSignedOut: (state) => {
      state.storedHands = [];
    },
  },
});

export const {
  handCompleted,
  handReviewOpened,
  heroDecisionRecorded,
  playerSignedOut,
  storedHandsLoaded,
} = handHistorySlice.actions;
export default handHistorySlice.reducer;
