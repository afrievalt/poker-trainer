import { auth } from '@utils/firebaseAuth';
import { loadHandRecords } from '@utils/handStorage';
import { onAuthStateChanged } from 'firebase/auth';

import { playerSignedOut, storedHandsLoaded } from '../slices/handHistorySlice';
import type { AppDispatch } from '../store';

// Loads the player's saved hands when they sign in; clears them on sign out.
export const syncStoredHandsWithAuth = (dispatch: AppDispatch): void => {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      dispatch(playerSignedOut());
      return;
    }
    loadHandRecords(user.uid)
      .then((hands) => dispatch(storedHandsLoaded(hands)))
      .catch((error: unknown) => {
        console.error('Failed to load saved hands', error);
      });
  });
};
