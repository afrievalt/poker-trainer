import { configureStore } from '@reduxjs/toolkit';

import { listenForHandStorage } from './listeners/handStorageListener';
import { syncStoredHandsWithAuth } from './listeners/storedHandsSync';
import { tableListener } from './listeners/tableListener';
import counterReducer from './slices/counterSlice';
import handHistoryReducer from './slices/handHistorySlice';
import hiLoTrainerReducer from './slices/hiLoTrainerSlice';
import navigationReducer from './slices/navigationSlice';
import pokerTableReducer from './slices/pokerTableSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    handHistory: handHistoryReducer,
    hiLoTrainer: hiLoTrainerReducer,
    navigation: navigationReducer,
    pokerTable: pokerTableReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(tableListener.middleware),
});

listenForHandStorage();
syncStoredHandsWithAuth(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
