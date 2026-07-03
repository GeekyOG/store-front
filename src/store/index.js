import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { storefrontApi } from "../api/storefrontApi";
import authReducer    from "./authSlice";
import cartReducer    from "./cartSlice";
import wishlistReducer from "./wishlistSlice";

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    cart:     cartReducer,
    wishlist: wishlistReducer,
    [storefrontApi.reducerPath]: storefrontApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(storefrontApi.middleware),
});

setupListeners(store.dispatch);
