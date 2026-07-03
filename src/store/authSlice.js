import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "sf_customer";

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { customer: null, token: null };
  } catch {
    return { customer: null, token: null };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadState(),
  reducers: {
    setCredentials: (state, action) => {
      state.customer = action.payload.customer;
      state.token = action.payload.token;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ customer: state.customer, token: state.token }));
    },
    logout: (state) => {
      state.customer = null;
      state.token = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentCustomer = (state) => state.auth.customer;
export const selectCurrentToken = (state) => state.auth.token;
