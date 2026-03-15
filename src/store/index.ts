import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import postsReducer from './slices/posts.slice';
import accountsReducer from './slices/accounts.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    accounts: accountsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
