import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  role: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
