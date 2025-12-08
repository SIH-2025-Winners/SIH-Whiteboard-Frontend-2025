// DraggableVideo.js
import React, { useState, useRef } from "react";

const DraggableVideo = ({ children }) => {
  const videoRef = useRef(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    setDragging(true);
    console.log("\n\nMousing Down\n\n" + e.clientX + " " + e.clientY);
    const rect = videoRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;

    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const onMouseUp = () => setDragging(false);

  return (
    <div
      ref={videoRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        cursor: "grab",
        zIndex: 99999,
      }}
    >
      {children}
    </div>
  );
};

export default DraggableVideo;
