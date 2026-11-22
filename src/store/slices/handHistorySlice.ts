import type {
  CompletedHand,
  HandRecord,
  HeroDecisionRecord,
  RobotLineNote,
} from '@poker/tracking/trackingTypes';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { handStarted, playerActed } from './pokerTableSlice';

export interface HandHistoryState {
  currentHandDecisions: HeroDecisionRecord[];
  currentRobotNotes: RobotLineNote[];
  hands: HandRecord[];
  storedHands: HandRecord[];
  reviewedHandId: string | null;
}

const initialState: HandHistoryState = {
  currentHandDecisions: [],
  currentRobotNotes: [],
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
      state.hands.push({
        ...action.payload,
        decisions,
        robotNotes: state.currentRobotNotes,
        playerNote: '',
      });
      state.currentHandDecisions = [];
      state.currentRobotNotes = [];
    },
    handReviewOpened: (state, action: PayloadAction<string>) => {
      state.reviewedHandId = action.payload;
    },
    storedHandsLoaded: (state, action: PayloadAction<HandRecord[]>) => {
      state.storedHands = action.payload;
    },
    handNoteWritten: (
      state,
      action: PayloadAction<{ handId: string; playerNote: string }>,
    ) => {
      const { handId, playerNote } = action.payload;
      for (const hand of [...state.hands, ...state.storedHands]) {
        if (hand.handId === handId) {
          hand.playerNote = playerNote;
        }
      }
    },
    playerSignedOut: (state) => {
      state.storedHands = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(handStarted, (state) => {
      state.currentRobotNotes = [];
    });
    builder.addCase(playerActed, (state, action) => {
      if (action.payload.robotNote) {
        state.currentRobotNotes.push({ message: action.payload.robotNote });
      }
    });
  },
});

export const {
  handCompleted,
  handNoteWritten,
  handReviewOpened,
  heroDecisionRecorded,
  playerSignedOut,
  storedHandsLoaded,
} = handHistorySlice.actions;
export default handHistorySlice.reducer;
