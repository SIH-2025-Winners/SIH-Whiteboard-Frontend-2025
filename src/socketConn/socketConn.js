import pako from "pako";
import { io } from "socket.io-client";
import {
  removeCursorPosition,
  updateCursorPosition,
} from "../CursorOverlay/cursorSlice";
import { setFile } from "../store/fileSlice";
import { setAnswerFromAI } from "../store/questionSlice";
import { store } from "../store/store";
import { resetSharingState, setSharedWebsite } from "../store/websiteSlice";
import {
  clearAllSlides,
  clearSlide,
  createSlide,
  deleteSlide,
  removeElement,
  setElementsForSlide,
  setMessages,
  setPollData,
  setQuizAnswer,
  setUsers,
  setWhiteboardState,
  switchSlide,
  toggleTheme,
  updateElementInStore,
} from "../Whiteboard/whiteboardSlice";

let socket;
const socket_server = process.env.NEXT_PUBLIC_SOCKET_SERVER;


function getSizeInKB(obj) {
  const json = JSON.stringify(obj);
  const bytes = new Blob([json]).size;  // accurate byte length
  return bytes / 1024; // KB
}


function dataURLtoBlob(dataurl) {
  const parts = dataurl.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}



export const decompress = (data) => {
  try {
    const binary = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    const uncompressed = pako.inflate(binary, { to: "string" });
    return JSON.parse(uncompressed);
  } catch (e) {
    console.error("Decompression error:", e);
    return [];
  }
};

export const connectWithSocketServer = (roomID, userID) => {
  socket = io(`https://sih-whiteboard-backend-socket-2025.onrender.com`, {
    // https://sih-whiteboard-backend-socket-2025.onrender.com
    transports: ["websocket", "polling"],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  console.log(`room ID from connect to socket : : ${roomID} : : ${userID}`);

  socket.on("connect", () => {
    console.log("✅ Successfully connected to socket.io server");

    if (roomID && userID) {
      console.log(`\n\n\nfiring join-room ${roomID} and ${userID}\n\n`);
      socket.emit("join-room", { UserID: userID, roomID });
    }
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
  });

  socket.on("disconnect", (reason) => {
    console.warn("⚠️ Socket disconnected:", reason);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
  });

  socket.on("reconnect_error", (error) => {
    console.error("❌ Socket reconnection failed:", error);
  });

  socket.on("whiteboard-state", ({ slides, currentSlide, users }) => {
    // 1. Slides ko store me daalo
    // 1. Slides ko store me daalo — pass an object payload
    store.dispatch(
      setWhiteboardState({
        slides: slides || [],
        currentSlide: typeof currentSlide === "number" ? currentSlide : 0,
      })
    );

    // 3. User list me update karo
    store.dispatch(setUsers(users || []));
  });

  socket.on("user-joined", ({ userID, socketId }) => {
    console.log(`User joined: `, userID);

    const state = store.getState().whiteboard;

    const newList = [...state.users, userID];

    store.dispatch(setUsers(newList));
  });

  socket.on("user-disconnected", ({ userID: disconnectedUserId }) => {
    console.log(`User with ID ${disconnectedUserId} has disconnected.`);
    store.dispatch(removeCursorPosition({userId: disconnectedUserId}));
  });

  socket.on("slide-created", ({ slide, currentSlide }) => {
    const state = store.getState().whiteboard;

    // add slide to store
    store.dispatch(createSlide(slide));

    // set new active slide index
    store.dispatch(switchSlide(currentSlide));
  });

  socket.on("slide-deleted", ({ slideId, currentSlide }) => {
    const state = store.getState().whiteboard;
    store.dispatch(deleteSlide(slideId));
    if (typeof currentSlide === "number") {
      store.dispatch(switchSlide(currentSlide));
    }
  });

  socket.on("slide-renamed", ({ slideId, newTitle }) => {
    const state = store.getState().whiteboard;

    const updatedSlides = state.slides.map((s) =>
      s.id === slideId ? { ...s, title: newTitle } : s
    );

    store.dispatch(
      setWhiteboardState({
        slides: updatedSlides,
        currentSlide: state.currentSlide,
      })
    );
  });

  socket.on("slide-switched", ({ currentSlide, slide }) => {
    // Redux update
    store.dispatch(switchSlide(currentSlide));

    // Us slide ke elements ko store me daalo
    store.dispatch(
      setElementsForSlide({
        slideId: slide.id,
        elements: slide.elements || [],
      })
    );
  });

  socket.on("element-updated", ({ elementData, slideId, slideIndex }) => {
    console.log("Client received element:", elementData.type, elementData.id);
    if (elementData.type === "image") {
      console.log(
        "Received image:",
        elementData.src,
        elementData.width,
        elementData.height
      );
    }
    store.dispatch(
      updateElementInStore({
        elementData,
        slideId,
        slideIndex,
      })
    );
  });

  // Add this new socket listener for element removal

  socket.on("element-removal", ({ elementId, slideId }) => {
    console.log(`ℹ Removing element ${elementId} from slide ${slideId}`);
    store.dispatch(removeElement({ elementId, slideId }));
  });

  socket.on("disconnect-and-remove-cursor", ({userID}) => {
    console.log(`\n\n\nRemoving cursor and emitting on line 190 in socketConn.js file \n\n\n\n`);
    store.dispatch(removeCursorPosition(userID));
  })

  socket.on("whiteboard-clear", ({ scope, slideId }) => {
    if (scope === "all") {
      store.dispatch(clearAllSlides());
    } else {
      store.dispatch(clearSlide(slideId));
    }
  });

  // Theme synchronization now handled via message system above

  socket.on("cursor-position-backend", (cursorData) => {
    console.log(`\n\n\nCursor Data Received at socketConn.js : ${JSON.stringify(cursorData)}\n\n`);
    setTimeout(() => {
      store.dispatch(updateCursorPosition(cursorData));
    }, 350);
  });

  socket.on("message", (data) => {
    try {
      // Extract the compressed message from the data object
      const compressedMessage = data.compressedMessage || data;

      // Decompress
      const binaryString = atob(compressedMessage);
      const charCodes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        charCodes[i] = binaryString.charCodeAt(i);
      }
      const decompressed = pako.inflate(charCodes, { to: "string" });
      const { userID, roomID, messageCopy } = JSON.parse(decompressed);
      // message unused in current implementation

      // Check if any message is a theme change command
      const hasThemeChange = messageCopy.some((msg) => {
        try {
          if (typeof msg.text === "string") {
            const parsed = JSON.parse(msg.text);
            if (parsed.type === "THEME_CHANGE") {
              console.log(
                "🎨 Theme change received via message system:",
                parsed.isDarkTheme ? "blackboard" : "whiteboard"
              );
              console.log("🔍 From user:", parsed.from);

              const currentState = store.getState().whiteboard;
              if (currentState.isDarkTheme !== parsed.isDarkTheme) {
                console.log("✅ Applying theme change via message system");
                store.dispatch(toggleTheme());
              }
              return true;
            }
          }
        } catch (e) {
          // Not a JSON message, continue normal processing
        }
        return false;
      });

      // Only process as regular messages if no theme change was found
      if (!hasThemeChange) {
        // Ensure all messages in messageCopy have proper structure
        const updatedMessages = messageCopy.map((msg) => {
          const userId = msg.user || msg.userID || userID;
          return {
            id: msg.id || Date.now().toString() + Math.random(),
            text: msg.text || msg.message,
            user: userId,
            userID: userId,
            role: msg.role || (userId === "teacher" ? "teacher" : "student"),
            timestamp: msg.timestamp || new Date().toISOString(),
            roomID: msg.roomID || roomID,
          };
        });

        // Update the messages state with the properly formatted message copy
        store.dispatch(setMessages(updatedMessages));
      }
    } catch (err) {
      console.error("Decompression failed:", err);
      console.error("Received data:", data);
    }
  });

  socket.on("quiz", (pollData) => {
    // Store the complete poll data in Redux
    store.dispatch(setPollData(pollData));

    // Also set quizAnswer for backward compatibility
    if (pollData.correctAnswer) {
      store.dispatch(setQuizAnswer(pollData.correctAnswer));
    }
  });

  // Local testing: Listen for localStorage changes (cross-tab communication)
  window.addEventListener("storage", (e) => {
    if (e.key === "currentPollData" && e.newValue) {
      try {
        const pollData = JSON.parse(e.newValue);
        store.dispatch(setPollData(pollData));
        if (pollData.correctAnswer) {
          store.dispatch(setQuizAnswer(pollData.correctAnswer));
        }
      } catch (error) {
        console.error("Error parsing cross-tab poll data:", error);
      }
    }
  });

  socket.on("got-definition", (result) => {
    console.log(result);
    store.dispatch(setAnswerFromAI(result));
  });

  // socket.on("file-media", (compressedFileData) => {
  //   console.log("Received compressed media file");
  //   try {
  //     const decompressed = pako.inflate(compressedFileData, { to: "string" });
  //     const { fileName, fileType, fileData } = JSON.parse(decompressed);

  //     console.log("Decompressed file:", fileName, fileType);
  //     store.dispatch(setFile(fileData)); // Set the data URL directly
  //   } catch (error) {
  //     console.error("Error processing compressed file:", error);
  //   }
  // });

  // socket.on("file-url", ({ fileName, fileType, fileData }) => {
  //   console.log("Received URL/Text file:", fileName, fileType);
  //   store.dispatch(setFile(fileData));
  // });

  // socket.on("file-other", (compressedFileData) => {
  //   console.log("Received other compressed file");
  //   try {
  //     const decompressed = pako.inflate(compressedFileData, { to: "string" });
  //     const { fileData } = JSON.parse(decompressed);
  //     // fileName and fileType unused in current implementation
  //     store.dispatch(setFile(fileData));
  //   } catch (error) {
  //     console.error("Error processing other file:", error);
  //   }
  // });

  // // ✅ Update existing listener
  // socket.on("file-rechieved", ({ fileName, fileType, fileData }) => {
  //   console.log("Received file via file-received:", fileName, fileType);
  //   store.dispatch(setFile(fileData));
  // });

  socket.on("pdf-received", ({ roomID, fileName, fileType, fileData }) => {
    console.log("PDF received from backend:", fileName);

    const uint8 = new Uint8Array(fileData);
    const blob = new Blob([uint8], { type: fileType });
    const url = URL.createObjectURL(blob);

    console.log("PDF reconstructed URL:", url);

    // Optional state update
    store.dispatch(setFile({ url, fileName, fileType }));
  });

  socket.on("website-shared", ({ websiteUrl, userID }) => {
    console.log(`Received website URL: ${websiteUrl} from user: ${userID}`);
    store.dispatch(setSharedWebsite({ websiteUrl, sharedBy: userID }));
  });

  socket.on("website-closed", ({ userID, roomID }) => {
    console.log(`Website sharing closed by user: ${userID} in room: ${roomID}`);
    store.dispatch(resetSharingState());
  });

  socket.on("elements-updated", ({ compressed, slideId }) => {
    const decompressed = decompress(compressed);

    console.log(
      "Full slide updated:",
      decompressed.length,
      "elements, slide:",
      slideId
    );

    store.dispatch(
      setElementsForSlide({
        slideId,
        elements: decompressed,
      })
    );
  });
};

export const emitElementUpdate = (
  elementData,
  roomID,
  slideId = null,
  slideIndex = null
) => {
  console.log(`\n\n\n\nElement DAta : \n\n ${JSON.stringify(elementData)}`);
  // Ensure all properties are preserved, especially for images
  const completeElementData = {
    ...elementData,
    // Explicitly preserve image source and dimensions if it exists
    ...(elementData.type === "image" && {
      src: elementData.src,
      width: elementData.width,
      height: elementData.height,
    }),
  };

  console.log("Emitting element update:", completeElementData);
  const sizeKB = getSizeInKB({
    elementData: completeElementData,
    roomID,
    slideId,
    slideIndex,
  });

  socket.emit("element-update", {
    elementData: completeElementData,
    roomID,
    slideId,
    slideIndex,
  });

  socket.emit("emit-payload", sizeKB);
};

export const emitImageElement = (
  imageElementData,
  roomID,
  slideId = null,
  slideIndex = null
) => {
  console.log("Emitting image element:", imageElementData);
  const completeImageData = {
    ...imageElementData,
    type: "image",
    src: imageElementData.src,
    width:
      imageElementData.width ||
      Math.abs(imageElementData.x2 - imageElementData.x1) ||
      200,
    height:
      imageElementData.height ||
      Math.abs(imageElementData.y2 - imageElementData.y1) ||
      200,
    x1: imageElementData.x1,
    y1: imageElementData.y1,
    x2: imageElementData.x2,
    y2: imageElementData.y2,
    id: imageElementData.id,
  };

  // Use element-update to maintain consistency
  socket.emit("element-update", {
    elementData: completeImageData,
    roomID,
    slideId,
    slideIndex,
  });
};

// In your socketConn.js file
export const emitElementRemoval = (elementId, roomID, slideId) => {
  socket.emit("element-removal", {
    elementId,
    roomID,
    slideId, // 👈 VERY IMPORTANT
  });
};

export const emitElementsUpdate = (
  elements,
  roomID,
  slideId = null,
  slideIndex = null
) => {
  socket.emit("elements-update", {
    elements,
    roomID,
    slideId,
    slideIndex,
  });
};

export const emitClearWhiteboard = (roomID, slideId) => {
  socket.emit("whiteboard-clear", {
    roomID,
    scope: "current",
    slideId,
  });
};

export const emitCursorPosition = ({ cursorData, roomID }) => {
  socket.emit("cursor-position", { cursorData, roomID });
};

export const emitMessages = ({ userID, message, roomID, messageCopy }) => {
  const jsonString = JSON.stringify({ userID, message, roomID, messageCopy });
  const compressed = pako.deflate(jsonString);
  socket.emit("message", {
    roomID: roomID,
    compressedMessage: btoa(String.fromCharCode(...compressed)),
  });
};

export const quiz = (pollData) => {
  socket.emit("quiz", pollData);

  // For local testing: store in localStorage to share between tabs
  localStorage.setItem("currentPollData", JSON.stringify(pollData));

  // Dispatch to current tab
  store.dispatch(setPollData(pollData));
  if (pollData.correctAnswer) {
    store.dispatch(setQuizAnswer(pollData.correctAnswer));
  }

  // Trigger storage event for other tabs
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "currentPollData",
      newValue: JSON.stringify(pollData),
    })
  );
};

export const emitQuestion = ({ userID, question }) => {
  console.log("emit question trigerred !!", userID);
  socket.emit("get-definition", { userID, question });
};

// export const emitFile = ({ roomID, fileName, fileType, fileData }) => {
//   const data = fileData || fileName;
//   const blob =
//     typeof data === "string"
//       ? dataURLtoBlob(data)
//       : new Blob([data], { type: "application/pdf" });
//   const url = URL.createObjectURL(blob);
//   console.log("Generated blob URL:", url);
//   store.dispatch(setFile(url));
//   socket.emit("file", { roomID, fileName, fileType, fileData });
// };

// export const emitFile = ({ roomID, file }) => {
//   const fileName = file.name;
//   const fileType = file.type;

//   const reader = new FileReader();

//   reader.onload = () => {
//     const arrayBuffer = reader.result;
//     const uint8 = new Uint8Array(arrayBuffer);

//     socket.emit("upload-pdf", {
//       roomID,
//       fileName,
//       fileType,
//       fileData: Array.from(uint8),
//     });
//   };

//   reader.readAsArrayBuffer(file);
// };

export const emitFile = ({ roomID, file }) => {
  const fileName = file.name;
  const fileType = file.type;

  const reader = new FileReader();

  reader.onload = () => {
    const arrayBuffer = reader.result;
    const uint8 = new Uint8Array(arrayBuffer);

    const chunkSize = 50 * 1024; // 50KB , safe for socket
    const totalChunks = Math.ceil(uint8.length / chunkSize);

    for (let index = 0; index < totalChunks; index++) {
      const chunk = uint8.slice(index * chunkSize, (index + 1) * chunkSize);

      socket.emit("upload-pdf-chunk", {
        roomID,
        fileName,
        fileType,
        chunkIndex: index,
        totalChunks,
        chunk: Array.from(chunk),
      });
    }
  };

  reader.readAsArrayBuffer(file);
};

export const emitRemoveCursor = ({ roomID, userId }) => {
  console.log(`\n\nuserID : ${userId}\n\n`);
  if (socket && socket.connected) {
    socket.emit("remove-cursor-position", { roomID, userId });
  }
};

// Listen for removal of cursors from others
export const listenForCursorRemoval = () => {
  if (!socket) return;
  socket.on("cursor-position-removed", ({ userId }) => {
    console.log(`\n\n\n\nfdsfbsdfksdsjkf\n\n\n${userId}\n\n\n\n\n\n`);
    store.dispatch(removeCursorPosition(userId));
  });
};

export const saveWhiteboardState = (roomID) => {
  socket.emit("whiteboard:saveAll", { roomID });
};

export const emitWebsiteShare = ({ websiteUrl, roomID, userID }) => {
  try {
    new URL(websiteUrl);
    socket.emit("share-website", { websiteUrl, roomID, userID });
    console.log(`Sharing website: ${websiteUrl} in room: ${roomID}`);
  } catch (error) {
    console.error("Invalid URL format:", error);
  }
};

export const emitWebsiteClosed = ({ roomID, userID }) => {
  socket.emit("website-closed", { roomID, userID });
  console.log(`Closing website sharing in room: ${roomID}`);
};

export const emitCreateSlide = ({ roomID, newSlideTitle }) => {
  socket.emit("create-slide", {
    roomID,
    title: newSlideTitle, // string
  });
};

export const emitDeleteSlide = ({ roomID, slideId }) => {
  socket.emit("delete-slide", {
    roomID,
    slideId,
  });
};

export const emitRenameSlide = ({ roomID, slideId, newTitle }) => {
  socket.emit("rename-slide", {
    roomID,
    slideId,
    newTitle,
  });
};

export const emitSwitchSlide = ({ roomID, slideId }) => {
  // socket.emit("switch-slide", {
  //   roomID,
  //   slideIndex: index,
  // });

  socket.emit("switch-slide", {
    roomID,
    slideId,
  });
};

// Theme synchronization - teacher emits theme changes to students using existing message system
export const emitThemeChange = ({ roomID, isDarkTheme, userID }) => {
  console.log("🎨 Teacher emitting theme change:");
  console.log("  Room:", roomID);
  console.log("  Theme:", isDarkTheme ? "blackboard" : "whiteboard");
  console.log("  Teacher ID:", userID);

  // Use the existing message system to send theme changes
  const themeMessage = {
    id: Date.now().toString() + Math.random(),
    text: JSON.stringify({
      type: "THEME_CHANGE",
      isDarkTheme: isDarkTheme,
      from: userID,
      timestamp: Date.now(),
    }),
    user: userID,
    userID: userID,
    role: "teacher",
    timestamp: new Date().toISOString(),
    roomID: roomID,
  };

  emitMessages({
    userID,
    message: themeMessage.text,
    roomID,
    messageCopy: [themeMessage], // messageCopy should be an array
  });

  console.log(`✅ Theme change emitted via message system`);
};

// Utility functions to check socket status
export const isSocketConnected = () => {
  return socket && socket.connected;
};

export const getSocketId = () => {
  return socket ? socket.id : null;
};

export const reconnectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const emitDisconnecting = (roomID, userID) => {
  if (socket && socket.connected) {
    console.log("🚨 Emitting user-disconnecting event");
    socket.emit("user-disconnecting", {
      roomID,
      userID,
    });
  }
};
