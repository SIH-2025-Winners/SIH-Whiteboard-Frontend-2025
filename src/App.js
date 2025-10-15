import React from "react";
import CursorOverlay from "./CursorOverlay/CursorOverlay";
import Whiteboard from "./Whiteboard/Whiteboard";

function App() {
  // Socket connection is now handled in WhiteboardPage.jsx with proper roomID and userID
  return (
    <div>
      <Whiteboard />
      <CursorOverlay />
    </div>
  );
}

export default App;
