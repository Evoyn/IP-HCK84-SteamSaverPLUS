// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import wishlistReducer from "./slices/wishlistSlice";

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
    // Add other reducers here as needed
  },
});

export default store;
