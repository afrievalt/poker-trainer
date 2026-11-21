import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { Screen } from './navigationTypes';

export interface NavigationState {
  activeScreen: Screen;
}

const initialState: NavigationState = {
  activeScreen: 'PlayPoker',
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    menuItemChosen: (state, action: PayloadAction<Screen>) => {
      state.activeScreen = action.payload;
    },
  },
  selectors: {
    selectActiveScreen: (state): Screen => state.activeScreen,
  },
});

export const { menuItemChosen } = navigationSlice.actions;
export const { selectActiveScreen } = navigationSlice.selectors;
export default navigationSlice.reducer;
