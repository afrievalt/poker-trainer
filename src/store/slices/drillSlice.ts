import { describeDrillResult } from '@poker/drills/drillCatalog';
import type {
  ActiveDrill,
  DrillPlan,
  DrillState,
} from '@poker/drills/drillTypes';
import type { Decision } from '@poker/engine/tableTypes';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState: DrillState = {
  active: null,
  resultMessage: '',
};

const drillSlice = createSlice({
  name: 'drill',
  initialState,
  reducers: {
    drillArmed: (state, action: PayloadAction<DrillPlan>) => {
      const active: ActiveDrill = { ...action.payload, phase: 'scripting' };
      state.active = active;
      state.resultMessage = '';
    },
    drillHeroPrompted: (state) => {
      if (state.active) {
        state.active.phase = 'heroDeciding';
      }
    },
    drillDecisionRecorded: (state, action: PayloadAction<Decision>) => {
      if (!state.active) {
        return;
      }
      state.resultMessage = describeDrillResult(
        action.payload,
        state.active.recommended,
        state.active.explanation,
      );
      state.active.phase = 'finished';
    },
    drillMissed: (state) => {
      state.resultMessage = 'The hand ended before your decision.';
      if (state.active) {
        state.active.phase = 'finished';
      }
    },
    nextHandChosen: (state) => {
      state.active = null;
      state.resultMessage = '';
    },
  },
});

export const {
  drillArmed: practiceHandStarted,
  drillDecisionRecorded,
  drillHeroPrompted,
  drillMissed,
  nextHandChosen,
} = drillSlice.actions;

export default drillSlice.reducer;
