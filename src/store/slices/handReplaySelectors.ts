import type { RootState } from '@store/store';

import { selectShouldAutoDeal } from './pokerTableSelectors';

export const selectIsHandReplaying = (state: RootState): boolean =>
  state.handReplay.isReplaying;

export const selectIsShowingAllHands = (state: RootState): boolean =>
  state.handReplay.isShowingAllHands;

export const selectIsRevealingHoleCards = (state: RootState): boolean =>
  selectIsHandReplaying(state) && selectIsShowingAllHands(state);

// The table is waiting on the hero, with a finished hand stored to play back.
export const selectCanReplayHand = (state: RootState): boolean =>
  state.handReplay.recording !== null &&
  !state.handReplay.isReplaying &&
  state.pokerTable.street === 'complete' &&
  !selectShouldAutoDeal(state);
