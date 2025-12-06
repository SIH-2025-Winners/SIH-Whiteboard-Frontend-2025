"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ShapeDropdown from "../components/ShapeDropdown";
import { toolTypes } from "../constants";
import Circle from "../resources/icons/circle.svg";
import fillBucket from "../resources/icons/fillBucket.svg";
import Bin from "../resources/icons/icons8-bin-50.png";
import ImageIcon from "../resources/icons/ImageIcon.svg";
import lineIcon from "../resources/icons/line.svg";
import pencilIcon from "../resources/icons/pencil.svg";
import rectangleIcon from "../resources/icons/rectangle.svg";
import rubberIcon from "../resources/icons/rubber.svg";
import selectionIcon from "../resources/icons/selection.svg";
import textIcon from "../resources/icons/text.svg";
import { theme } from "../styles/theme";
import ColorPicker from "./utils/ColorPicker";
import { clearSlide, setToolType } from "./whiteboardSlice";
import {
  emitClearWhiteboard,
  emitCreateSlide,
  emitDeleteSlide,
  emitRenameSlide,
  emitSwitchSlide,
} from "../socketConn/socketConn";

// Helper function to get the correct icon for shape tools
const getShapeIcon = (toolType) => {
  switch (toolType) {
    case toolTypes.RECTANGLE:
      return rectangleIcon;
    case toolTypes.CIRCLE:
      return Circle;
    case toolTypes.TRIANGLE:
      return "🔺";
    case toolTypes.DIAMOND:
      return "💎";
    case toolTypes.STAR:
      return "⭐";
    case toolTypes.ARROW:
      return "➡️";
    case toolTypes.PENTAGON:
      return "⬠";
    case toolTypes.HEXAGON:
      return "⬡";
    case toolTypes.HEART:
      return "❤️";
    case toolTypes.CLOUD:
      return "☁️";
    default:
      return rectangleIcon;
  }
};

const IconButton = ({
  src,
  type,
  isRubber,
  isClearAll,
  roomID,
  onEraserClick,
  onPencilClick,
  onFillClick,
  onShapeClick,
  isShapeButton,
}) => {
  const dispatch = useDispatch();
  const selectedToolType = useSelector((state) => state.whiteboard.tool);
  const fillShape = useSelector((state) => state.fillShape.filling);

  const handleToolChange = () => {
    dispatch(setToolType(type));
  };

  const handleClearCanvas = () => {
    // dispatch(setElements([]));
    // emitClearWhiteboard(roomID);
  };

  const handleClick = (event) => {
    if (isClearAll) {
      handleClearCanvas();
    } else if (type === toolTypes.ERASER && onEraserClick) {
      // For eraser, show dropdown and set tool
      event.stopPropagation();
      handleToolChange();
      const rect = event.currentTarget.getBoundingClientRect();
      onEraserClick({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10,
      });
    } else if (type === toolTypes.PENCIL && onPencilClick) {
      // For pencil, show dropdown and set tool
      event.stopPropagation();
      handleToolChange();
      const rect = event.currentTarget.getBoundingClientRect();
      onPencilClick({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10,
      });
    } else if (type === "FILL" && onFillClick) {
      // For fill, show dropdown
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      onFillClick({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10,
      });
    } else if (isShapeButton && onShapeClick) {
      // For shapes, show dropdown
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      onShapeClick({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10,
      });
    } else {
      handleToolChange();
    }
  };

  const isActive =
    type === "FILL"
      ? fillShape
      : isShapeButton
      ? [
          toolTypes.RECTANGLE,
          toolTypes.CIRCLE,
          toolTypes.TRIANGLE,
          toolTypes.DIAMOND,
          toolTypes.STAR,
          toolTypes.ARROW,
          toolTypes.PENTAGON,
          toolTypes.HEXAGON,
          toolTypes.HEART,
          toolTypes.CLOUD,
        ].includes(selectedToolType)
      : selectedToolType === type;

  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    border: `1px solid ${
      isActive ? theme.colors.primary[400] : theme.colors.gray[600]
    }`,
    borderRadius: theme.borderRadius.sm, // Smaller border radius
    backgroundColor: isActive
      ? theme.colors.primary[500]
      : theme.colors.gray[700],
    cursor: "pointer",
    padding: "0px",
    transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.default}`,
    boxShadow: isActive ? theme.shadow.md : theme.shadow.sm,
    transform: isActive ? "translateY(-1px)" : "translateY(0)",
  };

  // Check if src is an emoji (single character emojis or unicode emojis)
  const isEmoji =
    typeof src === "string" &&
    src.length <= 4 &&
    !/\.(svg|png|jpg|jpeg|gif)$/i.test(src);

  return (
    <button onClick={handleClick} style={buttonStyle}>
      {isEmoji ? (
        <span
          style={{
            fontSize: "20px",
            lineHeight: "1",
            opacity: isActive ? 1 : 0.8,
          }}
        >
          {src}
        </span>
      ) : (
        <img
          alt="Tool Icon"
          width="70%"
          height="70%"
          src={src}
          style={{
            filter: "invert(1) brightness(0.9)", // Make icons light for dark theme
            opacity: isActive ? 1 : 0.8,
          }}
        />
      )}
    </button>
  );
};

const Menu = ({ roomID, onEraserClick, onPencilClick, onFillClick }) => {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const [showShapeDropdown, setShowShapeDropdown] = useState(false);
  const [shapeDropdownPosition, setShapeDropdownPosition] = useState({
    x: 0,
    y: 0,
  });
  const selectedToolType = useSelector((state) => state.whiteboard.tool);
  const slides = useSelector((state) => state.whiteboard.slides);
  const currentSlide = useSelector((state) => state.whiteboard.currentSlide);
  const currentSlideId = useSelector(
    (state) => state.whiteboard.currentSlideId
  );

  const handleAddSlide = () => {
    const newSlideTitle = `Slide ${slides.length + 1}`;
    emitCreateSlide({ roomID, newSlideTitle });
    // Server emit ke baad listener automatically Redux update karega
  };

  const handleDeleteSlide = () => {
    if (slides.length === 0) return;
    const slideId = slides[currentSlide].id;
    emitDeleteSlide({ roomID, slideId });
  };

  const handleSwitchSlide = (index) => {
    if (index < 0 || index >= slides.length) return;
    const slideId = slides[index].id;
    emitSwitchSlide({ roomID, slideId });
  };

  const handleRenameSlide = (slideId, newTitle) => {
    emitRenameSlide({ roomID, slideId, newTitle });
  };

  const handleShapeDropdown = (position) => {
    setShapeDropdownPosition(position);
    setShowShapeDropdown(true);
  };

  const handleCloseShapeDropdown = () => {
    setShowShapeDropdown(false);
  };

  // Check if current tool is a shape
  const isShapeTool = [
    toolTypes.RECTANGLE,
    toolTypes.CIRCLE,
    toolTypes.TRIANGLE,
    toolTypes.DIAMOND,
    toolTypes.STAR,
    toolTypes.ARROW,
    toolTypes.PENTAGON,
    toolTypes.HEXAGON,
    toolTypes.HEART,
    toolTypes.CLOUD,
  ].includes(selectedToolType);

  // Calculate dynamic widths based on content
  const collapsedWidth = 160; // Reduced collapsed width

  // Calculate expanded width with compact sizing
  // ColorPicker: ~100px, Each tool button: ~36px + gap, Slide controls: ~280px, Clear button: ~36px
  const toolCount = 9; // Shapes, Line, Eraser, Pencil, Text, Selection, Image, Fill, Clear
  const toolWidth = 36; // Tool button width
  const toolGap = 12; // Gap between tools
  const colorPickerWidth = 100; // ColorPicker width
  const slideControlsWidth = 280; // Add + Delete buttons + Dropdown
  const clearButtonWidth = 36; // Clear button width
  const padding = 16; // Container outer padding

  const calculatedExpandedWidth =
    colorPickerWidth +
    toolCount * (toolWidth + toolGap) +
    slideControlsWidth +
    clearButtonWidth +
    padding;

  // Ensure the width doesn't exceed viewport width with some margin
  const maxWidth =
    typeof window !== "undefined"
      ? Math.min(calculatedExpandedWidth, window.innerWidth - 40)
      : calculatedExpandedWidth;
  const expandedWidth = Math.max(maxWidth, 900); // Increased minimum to accommodate all controls

  // Auto-close timer removed - user will manually close with X button

  const handleClearSlide = () => {
    // 1️⃣ Redux store me current slide clear karo
    dispatch(clearSlide(currentSlideId));

    // 2️⃣ Socket event emit karo taaki baki clients bhi clear ho jaye
    emitClearWhiteboard(roomID, currentSlideId);
  };

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  const menuContainerStyle = {
    position: "fixed",
    top: "70px", // Adjusted to avoid overlap with TopToolbar
    left: "50%",
    transform: "translateX(-50%)",
    padding: expanded ? "6px 4px" : "6px 6px", // Minimal outer padding
    backgroundColor: theme.colors.gray[800],
    borderRadius: theme.borderRadius.md, // Smaller border radius
    boxShadow: theme.shadow.lg,
    border: `1px solid ${theme.colors.gray[600]}`,
    zIndex: 999, // Below TopToolbar
    height: expanded ? "auto" : "44px", // Reduced height
    backdropFilter: "blur(10px)",
    background: "rgba(31, 41, 55, 0.95)",
  };

  const collapsedContainerStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "6px", // Reduced gap
    cursor: "pointer",
    width: "100%", // Fill container width
    minWidth: "160px", // Reduced minimum width
    height: "32px", // Reduced height
    alignItems: "center",
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.sm, // Smaller font size
    color: theme.colors.white,
    borderRadius: theme.borderRadius.md, // Smaller border radius
    border: `1px solid ${theme.colors.gray[600]}`,
    userSelect: "none",
    transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.default}`,
    background: `linear-gradient(135deg, ${theme.colors.gray[700]} 0%, ${theme.colors.gray[600]} 100%)`,
  };

  const expandedContentStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Align to start to prevent squeezing
    gap: theme.spacing.sm, // Reduced gap for more compact layout
    padding: "0 8px", // Small horizontal padding
    width: "100%",
    flexWrap: "nowrap", // Prevent wrapping
    overflow: "visible", // Allow overflow to be visible
  };

  return (
    <motion.div
      style={menuContainerStyle}
      initial={{ width: collapsedWidth }}
      animate={{ width: expanded ? expandedWidth : collapsedWidth }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {!expanded ? (
        <div
          style={collapsedContainerStyle}
          onClick={toggleExpand}
          title="Expand Tools"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/7168/7168912.png"
            alt="Palette Icon"
            height={22}
            width={22}
            style={{
              marginRight: "8px",
              verticalAlign: "middle",
              filter: "invert(1) brightness(2)",
            }}
          />
          Drawing Toolkit
        </div>
      ) : (
        <div style={expandedContentStyle}>
          {/* Color Picker */}
          <ColorPicker />

          {/* Tool Buttons */}
          <IconButton
            src={isShapeTool ? getShapeIcon(selectedToolType) : rectangleIcon}
            type="SHAPES"
            isShapeButton={true}
            onShapeClick={handleShapeDropdown}
          />
          <IconButton src={lineIcon} type={toolTypes.LINE} />
          <IconButton
            src={rubberIcon}
            type={toolTypes.ERASER}
            onEraserClick={onEraserClick}
          />
          <IconButton
            src={pencilIcon}
            type={toolTypes.PENCIL}
            onPencilClick={onPencilClick}
          />
          <IconButton src={textIcon} type={toolTypes.TEXT} />
          <IconButton src={selectionIcon} type={toolTypes.SELECTION} />
          <IconButton src={ImageIcon} type={toolTypes.IMAGE} />
          {/* Fill Tool Button - opens dropdown */}
          <IconButton src={fillBucket} type="FILL" onFillClick={onFillClick} />

          {/* Slide Controls - Redesigned */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 8px",
            borderLeft: `1px solid ${theme.colors.gray[600]}`,
            borderRight: `1px solid ${theme.colors.gray[600]}`,
            marginLeft: "8px",
          }}>
            {/* Add Slide Button */}
            <button
              onClick={handleAddSlide}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                padding: "6px 8px",
                border: `1px solid ${theme.colors.primary[400]}`,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.colors.primary[500],
                color: theme.colors.white,
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: theme.typography.fontWeight.medium,
                transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.default}`,
                boxShadow: theme.shadow.sm,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.primary[600];
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = theme.shadow.md;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.colors.primary[500];
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = theme.shadow.sm;
              }}
              title="Add New Slide"
            >
              <span style={{ fontSize: "14px", lineHeight: "1" }}>➕</span>
              <span>Add</span>
            </button>

            {/* Delete Slide Button */}
            <button
              onClick={handleDeleteSlide}
              disabled={slides.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                padding: "6px 8px",
                border: `1px solid ${slides.length === 0 ? theme.colors.gray[600] : theme.colors.error[400]}`,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: slides.length === 0 ? theme.colors.gray[700] : theme.colors.error[500],
                color: slides.length === 0 ? theme.colors.gray[500] : theme.colors.white,
                cursor: slides.length === 0 ? "not-allowed" : "pointer",
                fontSize: "11px",
                fontWeight: theme.typography.fontWeight.medium,
                transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.default}`,
                boxShadow: slides.length === 0 ? "none" : theme.shadow.sm,
                opacity: slides.length === 0 ? 0.5 : 1,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (slides.length > 0) {
                  e.target.style.backgroundColor = theme.colors.error[600];
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = theme.shadow.md;
                }
              }}
              onMouseLeave={(e) => {
                if (slides.length > 0) {
                  e.target.style.backgroundColor = theme.colors.error[500];
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = theme.shadow.sm;
                }
              }}
              title={slides.length === 0 ? "No slides to delete" : "Delete Current Slide"}
            >
              <span style={{ fontSize: "14px", lineHeight: "1" }}>🗑️</span>
              <span>Del</span>
            </button>

            {/* Slide Selector Dropdown */}
            <div style={{ position: "relative" }}>
              <select
                value={currentSlide}
                onChange={(e) => handleSwitchSlide(parseInt(e.target.value))}
                style={{
                  padding: "6px 24px 6px 8px",
                  border: `1px solid ${theme.colors.gray[600]}`,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: theme.colors.gray[700],
                  color: theme.colors.white,
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: theme.typography.fontWeight.medium,
                  transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.default}`,
                  boxShadow: theme.shadow.sm,
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 6px center",
                  minWidth: "100px",
                  maxWidth: "120px",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.gray[600];
                  e.target.style.borderColor = theme.colors.primary[400];
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.colors.gray[700];
                  e.target.style.borderColor = theme.colors.gray[600];
                }}
                title="Switch Slide"
              >
                {slides.length === 0 ? (
                  <option value={-1}>No Slides</option>
                ) : (
                  slides.map((slide, idx) => (
                    <option key={slide.id} value={idx}>
                      {slide.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Clear All Button */}
          <button
            onClick={handleClearSlide}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px", // Reduced to match other buttons
              height: "36px", // Reduced to match other buttons
              border: `1px solid ${theme.colors.error[400]}`,
              borderRadius: theme.borderRadius.sm, // Smaller border radius
              backgroundColor: theme.colors.gray[700],
              cursor: "pointer",
              transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.default}`,
              boxShadow: theme.shadow.sm,
            }}
            title="Clear All Elements"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.error[50];
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = theme.shadow.md;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.white;
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = theme.shadow.sm;
            }}
          >
            <img
              src={Bin}
              alt="Clear All"
              height={20}
              width={20}
              style={{ filter: "invert(1) brightness(2)" }}
            />
          </button>

          {/* Close Button */}
          <button
            onClick={toggleExpand}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              border: `1px solid ${theme.colors.gray[600]}`,
              borderRadius: theme.borderRadius.sm,
              backgroundColor: theme.colors.gray[700],
              cursor: "pointer",
              transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.default}`,
              boxShadow: theme.shadow.sm,
              marginLeft: "8px",
            }}
            title="Close Toolkit"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.gray[600];
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = theme.shadow.md;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.gray[700];
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = theme.shadow.sm;
            }}
          >
            <span style={{ 
              fontSize: "20px", 
              lineHeight: "1", 
              color: theme.colors.white,
              fontWeight: "300"
            }}>✕</span>
          </button>
        </div>
      )}

      {/* Shapes Dropdown */}
      {showShapeDropdown && (
        <ShapeDropdown
          position={shapeDropdownPosition}
          onClose={handleCloseShapeDropdown}
        />
      )}
    </motion.div>
  );
};

export default Menu;
