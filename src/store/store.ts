import { configureStore } from '@reduxjs/toolkit';

import counterReducer from './slices/counterSlice';
import hiLoTrainerReducer from './slices/hiLoTrainerSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    hiLoTrainer: hiLoTrainerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
