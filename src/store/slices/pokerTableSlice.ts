import { DEFAULT_GAME_STRUCTURE } from '@poker/config/gameStructures';
import { startHand } from '@poker/engine/handStart';
import { applyDecision, rebuyPlayer } from '@poker/engine/playerActions';
import { createTable } from '@poker/engine/tableSetup';
import type { Decision, TableState } from '@poker/engine/tableTypes';
import { createDeck, shuffleDeck } from '@poker/evaluation/cards';
import type { Card } from '@poker/evaluation/cards';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface HandStartedPayload {
  deck: Card[];
  buttonSeat?: number;
}

interface PlayerActedPayload {
  seatPosition: number;
  decision: Decision;
  robotNote?: string;
}

interface PlayerReboughtPayload {
  seatPosition: number;
  amount: number;
}

const pokerTableSlice = createSlice({
  name: 'pokerTable',
  initialState: (): TableState => createTable(DEFAULT_GAME_STRUCTURE),
  reducers: {
    handStarted: {
      reducer: (state, action: PayloadAction<HandStartedPayload>) => {
        if (action.payload.buttonSeat !== undefined) {
          state.buttonSeat = action.payload.buttonSeat;
        }
        startHand(state, action.payload.deck);
      },
      prepare: (
        deck: Card[] = shuffleDeck(createDeck()),
        buttonSeat?: number,
      ) => ({
        payload: { deck, buttonSeat },
      }),
    },
    playerActed: (state, action: PayloadAction<PlayerActedPayload>) => {
      applyDecision(
        state,
        action.payload.seatPosition,
        action.payload.decision,
      );
    },
    playerRebought: (state, action: PayloadAction<PlayerReboughtPayload>) => {
      rebuyPlayer(state, action.payload.seatPosition, action.payload.amount);
    },
    tableRestored: (_state, action: PayloadAction<TableState>) =>
      structuredClone(action.payload),
  },
});

export const { handStarted, playerActed, playerRebought, tableRestored } =
  pokerTableSlice.actions;
export default pokerTableSlice.reducer;
