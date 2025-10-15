import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedColor } from "../whiteboardSlice";

const ColorPicker = () => {
  const dispatch = useDispatch();
  const selectedColor = useSelector(
    (state) => state.whiteboard.selectedColor || "#000000"
  );
  const isDarkTheme = useSelector((state) => state.whiteboard.isDarkTheme);
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic colors based on theme
  const colors = isDarkTheme 
    ? [
        // Light colors for blackboard (dark theme)
        "#ffffff", // White
        "#fca5a5", // Light Red
        "#86efac", // Light Green
        "#93c5fd", // Light Blue
        "#fde047", // Light Yellow
        "#f0abfc", // Light Magenta
        "#67e8f9", // Light Cyan
        "#fdba74", // Light Orange
        "#c084fc", // Light Purple
        "#e5e7eb", // Light Gray
        "#9ca3af", // Medium Gray
        "#d2b48c", // Light Brown
      ]
    : [
        // Dark colors for whiteboard (light theme)
        "#000000", // Black
        "#dc2626", // Dark Red
        "#16a34a", // Dark Green
        "#2563eb", // Dark Blue
        "#ca8a04", // Dark Yellow
        "#c026d3", // Dark Magenta
        "#0891b2", // Dark Cyan
        "#ea580c", // Dark Orange
        "#9333ea", // Dark Purple
        "#6b7280", // Dark Gray
        "#374151", // Darker Gray
        "#92400e", // Dark Brown
      ];

  const handleColorChange = (color) => {
    dispatch(setSelectedColor(color));
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Styles
  const containerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
  };

  const triggerButtonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    backgroundColor: selectedColor,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    position: "relative",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "52px",
    left: "0",
    zIndex: 1001,
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    padding: "8px",
    display: isOpen ? "block" : "none",
  };

  const colorGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "4px",
    width: "120px",
  };

  const colorButtonStyle = (color, isSelected) => ({
    width: "32px",
    height: "32px",
    border: isSelected ? "3px solid #3b82f6" : "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: color,
    cursor: "pointer",
    transition: "all 0.2s ease",
    transform: isSelected ? "scale(1.05)" : "scale(1)",
    boxShadow: isSelected
      ? "0 2px 8px rgba(59, 130, 246, 0.3)"
      : "0 1px 3px rgba(0, 0, 0, 0.1)",
  });

  const arrowStyle = {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    width: "0",
    height: "0",
    borderLeft: "4px solid transparent",
    borderRight: "4px solid transparent",
    borderTop: "4px solid #666",
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".color-picker-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div style={containerStyle} className="color-picker-container">
      {/* Color display trigger button */}
      <button
        onClick={toggleDropdown}
        style={triggerButtonStyle}
        title="Select Color"
      >
        {/* Small arrow indicator */}
        <div style={arrowStyle}></div>
      </button>

      {/* Dropdown menu */}
      <div style={dropdownStyle}>
        <div style={colorGridStyle}>
          {colors.map((color) => (
            <button
              key={color}
              style={colorButtonStyle(color, selectedColor === color)}
              onClick={() => handleColorChange(color)}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
