/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  user: null,
  token: null,
  accountType: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token, accountType } = action.payload;

      state.user = user;
      state.token = token;
      state.accountType = accountType;

      // Store token in Cookies for middleware authentication
      Cookies.set("iBadi-token", token, {
        path: "/",
        expires: 7,
      });
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.accountType = null;

      // Remove token from cookie
      Cookies.remove("iBadi-token", { path: "/" });
    },
  },
});

// selectors
export const selectUser = (state: any) => state.auth.user;
export const selectToken = (state: any) => state.auth.token;

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
