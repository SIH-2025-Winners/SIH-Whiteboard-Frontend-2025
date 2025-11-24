import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cursors: [],
};

const cursorSlice = createSlice({
  name: "cursor",
  initialState,
  reducers: {
    updateCursorPosition: (state, action) => {
      const { x, y, userId } = action.payload;

      const index = state.cursors.findIndex((c) => c.userId === userId);
      console.log( `\n\n\ndhksabdhksadbasdajsdbaskdjbdaskdbask\n\n\n${state.cursors}\n\n\n\n\n`)

      if (index !== -1) {
        state.cursors[index] = {
          userId,
          x,
          y,
        };
      } else {
        state.cursors.push({
          userId,
          x,
          y,
        });
      }
    },
    removeCursorPosition: (state, action) => {
      state.cursors = state.cursors.filter((c) => c.userId !== action.payload);
      console.log(state.cursors)
    },
  },
});

export const { updateCursorPosition, removeCursorPosition } =
  cursorSlice.actions;

export default cursorSlice.reducer;
