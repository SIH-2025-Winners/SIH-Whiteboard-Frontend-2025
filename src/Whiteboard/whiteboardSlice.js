import { createSlice } from "@reduxjs/toolkit";
import { invertAllElementColors } from "./utils/colorInverter";

const initialState = {
  tool: null,
  elements: [],
  messages: [{}],
  quizAnswer: null,
  pollData: null, // Add poll data state for complete poll information
  selectedColor: "#000000", // Default black color
  isDarkTheme: false, // Theme state: false = light (whiteboard), true = dark (blackboard)
};

const whiteboardSlice = createSlice({
  name: "whiteboard",
  initialState,
  reducers: {
    setToolType: (state, action) => {
      state.tool = action.payload;
    },
    updateElement: (state, action) => {
      const { id } = action.payload;
      
      // Check if this element was recently erased (prevent socket restoration)
      if (window.erasedElementsSet && window.erasedElementsSet.has(id)) {
        console.log(`🚫 Blocked restoration of erased element: ${id}`);
        return; // Don't add/update erased elements
      }

      const index = state.elements.findIndex((element) => element.id === id);

      if (index === -1) {
        state.elements.push(action.payload);
      } else {
        state.elements[index] = action.payload;
      }
    },
    setElements: (state, action) => {
      state.elements = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setQuizAnswer: (state, action) => {
      state.quizAnswer = action.payload;
    },
    setPollData: (state, action) => {
      state.pollData = action.payload;
    },
    setSelectedColor: (state, action) => {
      state.selectedColor = action.payload;
    },
    toggleTheme: (state) => {
      state.isDarkTheme = !state.isDarkTheme;
      
      // Invert all element colors when theme changes
      state.elements = invertAllElementColors(state.elements);
      
      // Auto-adjust default color based on theme
      if (state.isDarkTheme) {
        // For dark theme (blackboard), use light colors
        state.selectedColor = state.selectedColor === "#000000" ? "#ffffff" : state.selectedColor;
      } else {
        // For light theme (whiteboard), use dark colors
        state.selectedColor = state.selectedColor === "#ffffff" ? "#000000" : state.selectedColor;
      }
    },
    // Add this new reducer for removing elements
    // In your whiteboardSlice.js - verify this reducer
    removeElement: (state, action) => {
      const elementId = action.payload;
      console.log(
        `Removing element ${elementId} from state. Before: ${state.elements.length} elements`
      );

      state.elements = state.elements.filter(
        (element) => element.id !== elementId
      );

      console.log(`After removal: ${state.elements.length} elements`);
    },
  },
});

export const {
  setToolType,
  updateElement,
  setElements,
  setMessages,
  setQuizAnswer,
  setPollData,
  setSelectedColor,
  toggleTheme, // Add theme toggle export
  removeElement,
} = whiteboardSlice.actions;

export default whiteboardSlice.reducer;
