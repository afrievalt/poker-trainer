import { parseStoredHands } from '@poker/tracking/storedHandSchema';
import type { HandRecord } from '@poker/tracking/trackingTypes';
import { get, getDatabase, ref, set } from 'firebase/database';

import { app } from './firebase-init';
import { auth } from './firebaseAuth';

const database = getDatabase(app);

const handsPath = (userId: string): string => `users/${userId}/pokerHands`;

// Saves a finished hand under the signed-in user; does nothing when signed out.
export const saveHandRecord = async (hand: HandRecord): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    return;
  }
  await set(ref(database, `${handsPath(user.uid)}/${hand.handId}`), {
    ...hand,
    savedAt: Date.now(),
  });
};

export const loadHandRecords = async (
  userId: string,
): Promise<HandRecord[]> => {
  const snapshot = await get(ref(database, handsPath(userId)));
  return parseStoredHands(snapshot.val() as Record<string, unknown> | null);
};
