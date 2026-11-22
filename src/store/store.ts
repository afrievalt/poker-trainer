import { configureStore } from '@reduxjs/toolkit';

import { handReplayListener } from './listeners/handReplayListener';
import { listenForHandStorage } from './listeners/handStorageListener';
import { listenForPlayLog } from './listeners/playLogListener';
import { listenForRobotPlay } from './listeners/robotPlayListener';
import { syncStoredHandsWithAuth } from './listeners/storedHandsSync';
import { tableListener } from './listeners/tableListener';
import counterReducer from './slices/counterSlice';
import handHistoryReducer from './slices/handHistorySlice';
import handReplayReducer from './slices/handReplaySlice';
import hiLoTrainerReducer from './slices/hiLoTrainerSlice';
import navigationReducer from './slices/navigationSlice';
import pokerTableReducer from './slices/pokerTableSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    handHistory: handHistoryReducer,
    handReplay: handReplayReducer,
    hiLoTrainer: hiLoTrainerReducer,
    navigation: navigationReducer,
    pokerTable: pokerTableReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(
      handReplayListener.middleware,
      tableListener.middleware,
    ),
});

listenForHandStorage();
listenForPlayLog();
listenForRobotPlay();
syncStoredHandsWithAuth(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
