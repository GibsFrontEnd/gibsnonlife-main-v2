import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isExpired: boolean;
  showAuthError: boolean;
}

const initialState: AuthState = {
  isExpired: false,
  showAuthError: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokenExpired: (state, action) => {
      state.isExpired = action.payload;
    },
    setShowAuthError: (state, action) => {
      state.showAuthError = action.payload;
    },
  },
});

export const selectAuth = (state: { auth: AuthState }) => state.auth;

export const { setTokenExpired, setShowAuthError } = authSlice.actions;
export default authSlice.reducer;
