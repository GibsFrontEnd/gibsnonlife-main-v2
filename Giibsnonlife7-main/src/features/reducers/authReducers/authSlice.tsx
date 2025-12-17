// src/features/reducers/authReducers/authSlice.tsx
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isExpired: boolean;
  showAuthError: boolean;
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  showTimeoutWarning: boolean;
  timeRemaining: number | null;
}

const initialState: AuthState = {
  isExpired: false,
  showAuthError: false,
  isAuthenticated: false,
  user: null,
  token: null,
  showTimeoutWarning: false,
  timeRemaining: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokenExpired: (state, action: PayloadAction<boolean>) => {
      state.isExpired = action.payload;
    },
    setShowAuthError: (state, action: PayloadAction<boolean>) => {
      state.showAuthError = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isExpired = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isExpired = true;
      state.showAuthError = false;
      state.showTimeoutWarning = false;
      state.timeRemaining = null;
    },
    showTimeoutWarning: (state, action: PayloadAction<number>) => {
      state.showTimeoutWarning = true;
      state.timeRemaining = action.payload;
    },
    hideTimeoutWarning: (state) => {
      state.showTimeoutWarning = false;
      state.timeRemaining = null;
    },
    setSessionExpired: (state, action: PayloadAction<boolean>) => {
      state.isExpired = action.payload;
    },
  },
});

export const selectAuth = (state: { auth: AuthState }) => state.auth;

export const { 
  setTokenExpired, 
  setShowAuthError, 
  loginSuccess,
  logout,
  showTimeoutWarning,
  hideTimeoutWarning,
  setSessionExpired
} = authSlice.actions;

export default authSlice.reducer;