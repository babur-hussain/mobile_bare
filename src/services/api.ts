import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAuth, signOut, getIdToken } from '@react-native-firebase/auth';
import { Config } from '../constants/config';

/**
 * Axios instance with Firebase Auth token interceptor
 */
const api: AxiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach fresh access token from Firebase
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      // getIdToken automatically refreshes if expired
      const token = await getIdToken(currentUser);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor: handle 401
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        const { store } = require('../store');
        const { logout } = require('../store/slices/auth.slice');
        store.dispatch(logout());
        await signOut(getAuth());
      } catch (e) {
        /* ignore */
      }
    }
    return Promise.reject(error);
  },
);

export default api;
