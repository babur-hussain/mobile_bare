import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface SocialAccount {
  _id: string;
  platform: 'instagram' | 'facebook';
  accountId: string;
  accountName: string;
  profilePicture?: string;
}

interface AccountsState {
  items: SocialAccount[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  items: [],
  isLoading: false,
  error: null,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setAccountsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      state.error = null;
    },
    setAccountsError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    setAccounts(state, action: PayloadAction<SocialAccount[]>) {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addAccount(state, action: PayloadAction<SocialAccount>) {
      const exists = state.items.some(
        a =>
          a.accountId === action.payload.accountId &&
          a.platform === action.payload.platform,
      );
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeAccount(state, action: PayloadAction<string>) {
      state.items = state.items.filter(a => a._id !== action.payload);
    },
  },
});

export const {
  setAccountsLoading,
  setAccountsError,
  setAccounts,
  addAccount,
  removeAccount,
} = accountsSlice.actions;

export default accountsSlice.reducer;
