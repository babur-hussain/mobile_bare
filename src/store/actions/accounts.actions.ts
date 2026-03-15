import {createAsyncThunk} from '@reduxjs/toolkit';
import {socialService} from '../../services/social.service';
import {
  setAccountsLoading,
  setAccountsError,
  setAccounts,
  removeAccount,
} from '../slices/accounts.slice';

export const fetchAllAccounts = createAsyncThunk(
  'accounts/fetchAll',
  async (_, {dispatch, rejectWithValue}) => {
    dispatch(setAccountsLoading(true));
    try {
      const response = await socialService.getAccounts();
      const formattedAccounts = response.map((acc: any) => ({
        _id: acc._id || acc.id,
        platform: acc.platform,
        accountId: acc.accountId || acc.id, // Fallback to id if accountId is missing
        accountName: acc.accountName || acc.name || 'Unknown',
        profilePicture: acc.profilePicture,
      }));
      dispatch(setAccounts(formattedAccounts));
      return formattedAccounts;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to fetch accounts';
      dispatch(setAccountsError(message));
      return rejectWithValue(message);
    }
  },
);

export const disconnectSocialAccount = createAsyncThunk(
  'accounts/disconnect',
  async (accountId: string, {dispatch, rejectWithValue}) => {
    try {
      await socialService.disconnectAccount(accountId);
      dispatch(removeAccount(accountId));
      return accountId;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to disconnect account';
      return rejectWithValue(message);
    }
  },
);
