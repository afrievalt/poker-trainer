import type { Decision, TableState } from '@poker/engine/tableTypes';
import type { Card } from '@poker/evaluation/cards';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface RecordedAction {
  seatPosition: number;
  decision: Decision;
}

export interface HandRecording {
  tableBefore: TableState;
  deck: Card[];
  decisions: RecordedAction[];
}

export interface HandReplayState {
  recording: HandRecording | null;
  isReplaying: boolean;
  isShowingAllHands: boolean;
}

interface AllHandsDisplayChosenPayload {
  isShowingAllHands: boolean;
}

const initialState: HandReplayState = {
  recording: null,
  isReplaying: false,
  isShowingAllHands: false,
};

const handReplaySlice = createSlice({
  name: 'handReplay',
  initialState,
  reducers: {
    handRecordingBegan: (
      state,
      action: PayloadAction<Omit<HandRecording, 'decisions'>>,
    ) => {
      state.recording = {
        tableBefore: structuredClone(action.payload.tableBefore),
        deck: structuredClone(action.payload.deck),
        decisions: [],
      };
      state.isReplaying = false;
    },
    recordedActionAdded: (state, action: PayloadAction<RecordedAction>) => {
      state.recording?.decisions.push(action.payload);
    },
    handReplayRequested: (state) => {
      if (state.recording) {
        state.isReplaying = true;
      }
    },
    handReplayFinished: (state) => {
      state.isReplaying = false;
    },
    allHandsDisplayChosen: (
      state,
      action: PayloadAction<AllHandsDisplayChosenPayload>,
    ) => {
      state.isShowingAllHands = action.payload.isShowingAllHands;
    },
  },
});

export const {
  allHandsDisplayChosen,
  handRecordingBegan,
  handReplayFinished,
  handReplayRequested,
  recordedActionAdded,
} = handReplaySlice.actions;
export default handReplaySlice.reducer;
