import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithCredential,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
  getIdToken,
  updateProfile
} from '@react-native-firebase/auth';
import {
  authService,
  LoginData,
  RegisterData,
} from '../../services/auth.service';
import {
  setCredentials,
  setAuthLoading,
  setAuthError,
  logout,
} from '../slices/auth.slice';
import { storage } from '../../utils/storage';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: LoginData, { dispatch, rejectWithValue }) => {
    dispatch(setAuthLoading(true));
    try {
      const userCredential = await signInWithEmailAndPassword(
        getAuth(),
        data.email,
        data.password,
      );
      const idToken = await getIdToken(userCredential.user);

      // Fetch user profile from our backend.
      // The frontend interceptor attaches the token automatically.
      const profile = await authService.getProfile();
      dispatch(
        setCredentials({
          user: profile,
          token: idToken,
        }),
      );
      return profile;
    } catch (error: any) {
      let message = error.message || 'Login failed';
      if (error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password';
      }

      dispatch(setAuthError(message));
      return rejectWithValue(message);
    }
  },
);

export const googleLoginUser = createAsyncThunk(
  'auth/googleLogin',
  async (_, { dispatch, rejectWithValue }) => {
    dispatch(setAuthLoading(true));
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token obtained from Google');
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(getAuth(), googleCredential);

      const profile = await authService.getProfile();

      // Need a fresh Firebase ID token to set as Redux credential token
      const currentUser = getAuth().currentUser;
      const currentToken = currentUser ? await getIdToken(currentUser) : undefined;

      dispatch(
        setCredentials({
          user: profile,
          token: currentToken || idToken,
        }),
      );
      return profile;
    } catch (error: any) {
      let message = error.message || 'Google Login failed';
      dispatch(setAuthError(message));
      return rejectWithValue(message);
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { dispatch, rejectWithValue }) => {
    dispatch(setAuthLoading(true));
    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        getAuth(),
        data.email,
        data.password,
      );
      const idToken = await getIdToken(userCredential.user);

      // 2. Set the displayName in Firebase profile
      await updateProfile(userCredential.user, { displayName: data.name });

      // 3. Register user in our backend database
      // The backend gets the token inside the auth interceptor, sees the Firebase user, and creates a MongoDB Document.
      const profile = await authService.getProfile();

      dispatch(
        setCredentials({
          user: profile,
          token: idToken,
        }),
      );
      return profile;
    } catch (error: any) {
      let message = error.message || 'Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email is already registered';
      }

      dispatch(setAuthError(message));
      return rejectWithValue(message);
    }
  },
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const currentUser = getAuth().currentUser;

      if (!currentUser) {
        dispatch(logout());
        return rejectWithValue('No user logged in');
      }

      const idToken = await getIdToken(currentUser);
      const profile = await authService.getProfile();
      dispatch(
        setCredentials({
          user: profile,
          token: idToken,
        }),
      );
      return profile;
    } catch (error) {
      await signOut(getAuth());
      dispatch(logout());
      return rejectWithValue('Session expired');
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await signOut(getAuth());
    } catch (e) {
      console.error('Firebase Logout error', e);
    } finally {
      // Clean up potentially leftover local storage from the pre-Firebase implementation
      await storage.clearTokens();
      dispatch(logout());
    }
  },
);
