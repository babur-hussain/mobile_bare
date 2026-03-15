import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  name: string;
  plan?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      state.error = null;
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
    setCredentials(state, action: PayloadAction<{user: User; token: string}>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setAuthLoading,
  setAuthError,
  clearAuthError,
  setCredentials,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
