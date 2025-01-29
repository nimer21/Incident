import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Use localStorage as default storage
import { combineReducers } from "redux";
import userReducer from "../redux/slices/userSlice";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: {
    user: persistedReducer,
  },
  devTools: process.env.NODE_ENV !== "production", // Enable only in development
});
export const persistor = persistStore(store);
export default store;
