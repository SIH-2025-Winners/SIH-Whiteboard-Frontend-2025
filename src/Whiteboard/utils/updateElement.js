import { createElement } from ".";
import { toolTypes } from "../../constants";
import { emitElementUpdate } from "../../socketConn/socketConn";
import { store } from "../../store/store";
import { updateElementInStore } from "../whiteboardSlice";

export const updatePencilElementWhenMoving = (
  { index, newPoints, color, t }, // Add color parameter
  elements,
  roomID, // ✅ Add roomID parameter
  currentSlideId,
  currentSlide
) => {
  const elementsCopy = [...elements];

  elementsCopy[index] = {
    ...elementsCopy[index],
    points: newPoints,
    color: color || elementsCopy[index].color,
  };

  console.log("updating pencil element with color:", color);

  const updatedPencilElement = elementsCopy[index];

  store.dispatch(
    updateElementInStore({
      elementData: updatedPencilElement,
      slideId: currentSlideId,
    })
  );
  emitElementUpdate(updatedPencilElement, roomID, currentSlideId, currentSlide); // ✅ Pass roomID
};

export const updateElement = (
  { id, x1, x2, y1, y2, type, index, t, text, src, color, fill, fillStyle },
  elements,
  roomID,
  currentSlideId,
  currentSlide,
) => {
  console.log(`\n\nFILL STYLE SANYAM :${fillStyle}\n\n`);
  const elementsCopy = [...elements];

  switch (type) {
    case toolTypes.LINE:
    case toolTypes.RECTANGLE:
    case toolTypes.CIRCLE:
    case toolTypes.TRIANGLE:
    case toolTypes.DIAMOND:
    case toolTypes.STAR:
    case toolTypes.ARROW:
    case toolTypes.PENTAGON:
    case toolTypes.HEXAGON:
    case toolTypes.HEART:
    case toolTypes.CLOUD:
      const updatedElement = createElement({
        id,
        x1,
        y1,
        x2,
        y2,
        toolType: type,
        color, // Include color when updating
        fill,
        fillColorStyle: fillStyle,
        currentSlideId,
        currentSlide,
        startTime: t
      });

      elementsCopy[index] = updatedElement;

      store.dispatch(
        updateElementInStore({
          elementData: updatedElement,
          slideId: currentSlideId,
        })
      );

      emitElementUpdate(updatedElement, roomID, currentSlideId, currentSlide);
      break;


    case toolTypes.PENCIL:
      elementsCopy[index] = {
        ...elementsCopy[index],
        points: [
          ...elementsCopy[index].points,
          {
            x: x2,
            y: y2,
            t
          },
        ],
        color, // Include color when updating
      };

      const updatedPencilElement = elementsCopy[index];

      store.dispatch(
        updateElementInStore({
          elementData: updatedPencilElement,
          slideId: currentSlideId,
        })
      );

      emitElementUpdate(
        updatedPencilElement,
        roomID,
        currentSlideId,
        currentSlide
      );
      break;
    case toolTypes.TEXT:
      elementsCopy[index] = {
        ...createElement({
          id,
          x1,
          y1,
          x2,
          y2,
          toolType: type,
          text,
          color, // Include color when updating
          currentSlideId,
          currentSlide,
          startTime: t
        }),
      };

      const updatedTextElement = elementsCopy[index];

      store.dispatch(
        updateElementInStore({
          elementData: updatedTextElement,
          slideId: currentSlideId,
        })
      );

      emitElementUpdate(
        updatedTextElement,
        roomID,
        currentSlideId,
        currentSlide
      );
      break;
    case toolTypes.IMAGE: {
      elementsCopy[index] = {
        ...createElement({
          id,
          x1,
          y1,
          x2,
          y2,
          toolType: type,
          src: src,
          color, // Add color parameter
          currentSlideId,
          currentSlide,
          startTime: t
        }),
      };

      const updatedImageElement = elementsCopy[index];
      store.dispatch(
        updateElementInStore({
          elementData: updatedImageElement,
          slideId: currentSlideId,
        })
      );
      console.log("\n\nUPDATE ELEMET IMAGE CLSSED ");
      emitElementUpdate(updatedImageElement, roomID, currentSlideId, currentSlide); // This was missing roomID!
      break;
    }

    default:
      throw new Error("Something went wrong when updating element");
  }
};
