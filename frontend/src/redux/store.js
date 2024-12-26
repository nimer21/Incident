import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../redux/slices/userSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
  },
  devTools: process.env.NODE_ENV !== "production", // Enable only in development
});

export default store;
