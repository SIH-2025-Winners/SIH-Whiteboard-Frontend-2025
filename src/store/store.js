import { configureStore } from "@reduxjs/toolkit";
import whiteboardSliceReducer from "../Whiteboard/whiteboardSlice";
import cursorSliceReducer from "../CursorOverlay/cursorSlice";
import aiReducer from "../store/questionSlice";
import fileReducer from "./fileSlice";
import websiteReducer from "./websiteSlice";
import fillShape from "./fillShape";

export const store = configureStore({
  reducer: {
    whiteboard: whiteboardSliceReducer,
    cursor: cursorSliceReducer,
    ai: aiReducer,
    file: fileReducer,
    website: websiteReducer,
    fillShape: fillShape,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: ["whiteboard/setElements"],
        ignoredPaths: ["whiteboard.elements"],
      },
    }),
});
