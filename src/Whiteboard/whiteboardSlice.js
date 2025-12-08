import { createSlice } from "@reduxjs/toolkit";
import { invertAllElementColors } from "./utils/colorInverter";

const initialState = {
  tool: null,
  slides: [], // 🆕 all slides
  currentSlide: 0, // 🆕 active slide index
  messages: [],
  users: [],
  payloadSize: "",
  cumulativePayloadSize: 0,
  quizAnswer: null,
  pollData: null,
  selectedColor: "#000000",
  isDarkTheme: false,
  startRecording: false, // 🔥 yahi tumhara global flag
  recordingStartTime: Date.now(), // 🔥 timestamps ke liye zaroori
};

const whiteboardSlice = createSlice({
  name: "whiteboard",
  initialState,
  reducers: {
    // ==========================
    // Slide Management
    // ==========================
    setWhiteboardState: (state, action) => {
      state.slides = action.payload.slides;
      state.currentSlide = action.payload.currentSlide;

      const payload = action.payload || {};
      const incomingSlides = Array.isArray(payload.slides)
        ? payload.slides
        : [];

      // Ensure at least one slide exists
      state.slides =
        incomingSlides.length > 0
          ? incomingSlides
          : [
              {
                id: payload.currentSlideId || "slide-1",
                title: payload.defaultTitle || "Slide 1",
                elements: [],
              },
            ];

      const requestedIndex =
        typeof payload.currentSlide === "number" ? payload.currentSlide : 0;
      state.currentSlide = Math.max(
        0,
        Math.min(requestedIndex, state.slides.length - 1)
      );
    },

    switchSlide: (state, action) => {
      state.currentSlide = action.payload;
    },

    createSlide: (state, action) => {
      state.slides.push({
        id: action.payload.id,
        title: action.payload.title,
        elements: [],
      });
      state.currentSlide = state.slides.length - 1;
    },

    deleteSlide: (state, action) => {
      const slideId = action.payload;
      state.slides = state.slides.filter((s) => s.id !== slideId);
      if (state.currentSlide >= state.slides.length) {
        state.currentSlide = Math.max(0, state.slides.length - 1);
      }
    },

    // ==========================
    // ELEMENT OPERATIONS
    // ==========================
    updateElementInStore: (state, action) => {
      const { elementData, slideId } = action.payload;

      const slideIndex = state.slides.findIndex((s) => s.id === slideId);
      if (slideIndex === -1) return;

      const slide = state.slides[slideIndex];
      const idx = slide.elements.findIndex((e) => e.id === elementData.id);

      if (idx === -1) {
        slide.elements.push(elementData);
      } else {
        slide.elements[idx] = elementData;
      }
    },

    setElementsForSlide: (state, action) => {
      const { slideId, elements } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      slide.elements = elements;
    },

    removeElement: (state, action) => {
      const { elementId, slideId } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      slide.elements = slide.elements.filter((e) => e.id !== elementId);
    },

    clearSlide: (state, action) => {
      const slideId = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (slide) slide.elements = [];
    },

    clearAllSlides: (state) => {
      state.slides.forEach((s) => (s.elements = []));
    },

    // ==========================
    // THEMING
    // ==========================
    toggleTheme: (state) => {
      state.isDarkTheme = !state.isDarkTheme;

      // Invert all elements in all slides
      state.slides.forEach((slide) => {
        slide.elements = invertAllElementColors(slide.elements);
      });

      if (state.isDarkTheme) {
        state.selectedColor =
          state.selectedColor === "#000000" ? "#ffffff" : state.selectedColor;
      } else {
        state.selectedColor =
          state.selectedColor === "#ffffff" ? "#000000" : state.selectedColor;
      }
    },

    setToolType: (state, action) => {
      state.tool = action.payload;
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

    setUsers: (state, action) => {
      state.users = action.payload;
    },

    startRecording : (state) => {
      state.startRecording = true;
      state.recordingStartTime = Date.now();
    },
    stopRecording : (state) => {
      state.startRecording = false;
      state.recordingStartTime = null;
    },

    setPayloadSize: (state, action) => {
      state.cumulativePayloadSize += action.payload;
      state.payloadSize = action.payload;
    }
  },
});

export const {
  // slide
  setWhiteboardState,
  switchSlide,
  createSlide,
  deleteSlide,
  setUsers,

  // elements
  updateElementInStore,
  setElementsForSlide,
  removeElement,
  clearSlide,
  clearAllSlides,

  // misc
  setToolType,
  setMessages,
  setPollData,
  setQuizAnswer,
  toggleTheme,
  setSelectedColor,

  stopRecording,
  startRecording,


  setPayloadSize
} = whiteboardSlice.actions;

export default whiteboardSlice.reducer;
