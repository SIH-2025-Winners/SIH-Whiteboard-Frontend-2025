import rough from "roughjs/bundled/rough.esm";
import { toolTypes } from "../../constants";
// Removed unused imports for cleaner code

const generator = rough.generator();

const generateRectangle = ({
  x1,
  y1,
  x2,
  y2,
  color,
  filling,
  fillStyle,
  currentSlideId,
  currentSlide,
}) => {
  console.log("generateRectangle called with color:", color);
  console.log(`\n\nfillinf style  here \n\n${fillStyle}\n\n`);
  const toFillColor = filling ? color : false;
  return generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
    fill: toFillColor,
    stroke: color || "red",
    hachureAngle: 60,
    hachureGap: 8,
    // fillStyle: "",
    fillStyle: fillStyle,
    currentSlideId,
    currentSlide,
  });
};

const generateLine = ({
  x1,
  y1,
  x2,
  y2,
  color,
  currentSlideId,
  currentSlide,
}) => {
  const strokeColor = color || "#000000";

  return generator.line(x1, y1, x2, y2, {
    stroke: strokeColor,
    strokeWidth: 2,
    roughness: 1,
    currentSlideId,
    currentSlide,
  });
};

const generateCircle = ({
  x1,
  y1,
  x2,
  y2,
  color,
  filling,
  fillStylee,
  currentSlideId,
  currentSlide,
}) => {
  const toFillColor = filling ? color : false;
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const centerX = Math.min(x1, x2) + width / 2;
  const centerY = Math.min(y1, y2) + height / 2;
  const radius = Math.max(width, height) / 2;

  return generator.circle(centerX, centerY, radius * 2, {
    fill: toFillColor,
    stroke: color || "blue",
    hachureAngle: 60,
    hachureGap: 8,
    fillStyle: fillStylee,
    currentSlideId,
    currentSlide,
  });
};

const generateTriangle = ({
  x1,
  y1,
  x2,
  y2,
  color,
  filling,
  fillStylee,
  currentSlideId,
  currentSlide,
}) => {
  const toFillColor = filling ? color : false;
  // Ensure the coordinates are valid numbers AND not identical
  if (
    isNaN(x1) ||
    isNaN(y1) ||
    isNaN(x2) ||
    isNaN(y2) ||
    (x1 === x2 && y1 === y2)
  ) {
    console.error("Invalid coordinates for triangle:", { x1, y1, x2, y2 });

    // Return a minimal triangle that won't cause issues
    return generator.polygon(
      [
        [x1, y1],
        [x1 + 1, y1],
        [x1, y1 + 1],
      ],
      {
        fill: toFillColor,
        stroke: color || "#FFD700",
        // fillStyle: "hachure",
        hachureAngle: 60,
        hachureGap: 8,
        roughness: 1,
        fillStyle: fillStylee,
        currentSlideId,
        currentSlide,
      }
    );
  }

  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  if (width < 2 && height < 2) {
    return generator.polygon(
      [
        [x1, y1],
        [x1 + 2, y1],
        [x1 + 1, y1 + 2],
      ],
      {
        fill: toFillColor,
        stroke: color || "#FFD700",
        // fillStyle: "hachure",
        hachureAngle: 60,
        hachureGap: 8,
        roughness: 1,
        fillStyle: fillStylee,
        currentSlideId,
        currentSlide,
      }
    );
  }

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  const x3 = minX + width / 2;
  const y3 = minY;

  return generator.polygon(
    [
      [minX, maxY],
      [maxX, maxY],
      [x3, y3],
    ],
    {
      fill: toFillColor,
      stroke: color || "#FFD700",
      // fillStyle: "hachure",
      hachureAngle: 60,
      hachureGap: 8,
      roughness: 1,
      fillStyle: fillStylee,
      currentSlideId,
      currentSlide,
    }
  );
};

const generateDiamond = ({
  x1,
  y1,
  x2,
  y2,
  color,
  filling,
  fillStylee,
  currentSlideId,
  currentSlide,
}) => {
  const toFillColor = filling ? color : false;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return generator.polygon(
    [
      [centerX, minY], // top
      [maxX, centerY], // right
      [centerX, maxY], // bottom
      [minX, centerY], // left
    ],
    {
      fill: toFillColor,
      stroke: color || "#FF6B6B",
      hachureAngle: 60,
      hachureGap: 8,
      fillStyle: fillStylee,
      currentSlideId,
      currentSlide,
    }
  );
};

const generateStar = ({
  x1,
  y1,
  x2,
  y2,
  color,
  filling,
  fillStylee,
  currentSlideId,
  currentSlide,
}) => {
  const toFillColor = filling ? color : false;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const width = maxX - minX;
  const height = maxY - minY;
  const outerRadius = Math.min(width, height) / 2;
  const innerRadius = outerRadius * 0.4;

  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + radius * Math.cos(angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(angle - Math.PI / 2);
    points.push([x, y]);
  }

  return generator.polygon(points, {
    fill: toFillColor,
    stroke: color || "#FFD700",
    hachureAngle: 60,
    hachureGap: 8,
    fillStyle: fillStylee,
    currentSlideId,
    currentSlide,
  });
};

const generateArrow = ({
  x1,
  y1,
  x2,
  y2,
  color,
  filling,
  fillStylee,
  currentSlideId,
  currentSlide,
}) => {
  const toFillColor = filling ? color : false;
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const centerY = (minY + maxY) / 2;

  const arrowHeadWidth = width * 0.3;
  const arrowBodyHeight = height * 0.4;
  const arrowBodyY1 = centerY - arrowBodyHeight / 2;
  const arrowBodyY2 = centerY + arrowBodyHeight / 2;

  return generator.polygon(
    [
      [minX, arrowBodyY1], // top left of body
      [maxX - arrowHeadWidth, arrowBodyY1], // top right of body
      [maxX - arrowHeadWidth, minY], // top of arrow head
      [maxX, centerY], // tip of arrow
      [maxX - arrowHeadWidth, maxY], // bottom of arrow head
      [maxX - arrowHeadWidth, arrowBodyY2], // bottom right of body
      [minX, arrowBodyY2], // bottom left of body
    ],
    {
      fill: toFillColor,
      stroke: color || "#4ECDC4",
      hachureAngle: 60,
      hachureGap: 8,
      fillStyle: fillStylee,
      currentSlideId,
      currentSlide,
    }
  );
};

const generatePentagon = ({
  x1,
  y1,
  x2,
  y2,
  color,
  filling,
  fillStylee,
  currentSlideId,
  currentSlide,
}) => {
  const toFillColor = filling ? color : false;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const radius = Math.min(maxX - minX, maxY - minY) / 2;

  const points = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push([x, y]);
  }

  return generator.polygon(points, {
    fill: toFillColor,
    stroke: color || "#9B59B6",
    hachureAngle: 60,
    hachureGap: 8,
    fillStyle: fillStylee,
    currentSlideId,
    currentSlide,
  });
};

const generateHexagon = ({
  x1,
  y1,
  x2,
  y2,
  color,
  filling,
  fillStylee,
  currentSlideId,
  currentSlide,
}) => {
  const toFillColor = filling ? color : false;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const radius = Math.min(maxX - minX, maxY - minY) / 2;

  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push([x, y]);
  }

  return generator.polygon(points, {
    fill: toFillColor,
    stroke: color || "#E67E22",
    hachureAngle: 60,
    hachureGap: 8,
    fillStyle: fillStylee,
    currentSlideId,
    currentSlide,
  });
};

const generateHeart = ({
  x1,
  y1,
  x2,
  y2,
  color,
  filling,
  fillStylee,
  currentSlideId,
  currentSlide,
}) => {
  const toFillColor = filling ? color : false;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const width = maxX - minX;
  const height = maxY - minY;
  const centerX = minX + width / 2;
  const topY = minY + height * 0.3;

  // Create heart shape using curves (approximated with polygon)
  const points = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * 2 * Math.PI;
    // Heart equation: x = 16sin³(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
    const x = centerX + width * 0.15 * Math.pow(Math.sin(angle), 3);
    const y =
      topY -
      (height *
        0.1 *
        (13 * Math.cos(angle) -
          5 * Math.cos(2 * angle) -
          2 * Math.cos(3 * angle) -
          Math.cos(4 * angle))) /
        16;
    points.push([x, y]);
  }

  return generator.polygon(points, {
    fill: toFillColor,
    stroke: color || "#E74C3C",
    hachureAngle: 60,
    hachureGap: 8,
    fillStyle: fillStylee,
    currentSlideId,
    currentSlide,
  });
};

const generateCloud = ({
  x1,
  y1,
  x2,
  y2,
  color,
  filling,
  fillStylee,
  currentSlideId,
  currentSlide,
}) => {
  const toFillColor = filling ? color : false;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const width = maxX - minX;
  const height = maxY - minY;

  // Create a more realistic cloud using smooth curves
  // Cloud is made of connected curved sections that look more natural
  const cloudPath = `
    M ${minX + width * 0.15} ${maxY}
    Q ${minX + width * 0.05} ${minY + height * 0.8} ${minX + width * 0.1} ${
    minY + height * 0.6
  }
    Q ${minX} ${minY + height * 0.4} ${minX + width * 0.15} ${
    minY + height * 0.3
  }
    Q ${minX + width * 0.1} ${minY + height * 0.1} ${minX + width * 0.25} ${
    minY + height * 0.15
  }
    Q ${minX + width * 0.35} ${minY} ${minX + width * 0.5} ${
    minY + height * 0.1
  }
    Q ${minX + width * 0.65} ${minY} ${minX + width * 0.75} ${
    minY + height * 0.15
  }
    Q ${minX + width * 0.9} ${minY + height * 0.1} ${minX + width * 0.85} ${
    minY + height * 0.3
  }
    Q ${maxX} ${minY + height * 0.4} ${minX + width * 0.9} ${
    minY + height * 0.6
  }
    Q ${minX + width * 0.95} ${minY + height * 0.8} ${
    minX + width * 0.85
  } ${maxY}
    Z
  `;

  return generator.path(cloudPath, {
    fill: toFillColor,
    stroke: color || "#87CEEB", // Softer sky blue color
    hachureAngle: 45,
    hachureGap: 6,
    fillStyle: fillStylee,
    roughness: 1.0, // Smooth but still hand-drawn feel
    bowing: 0.6, // Add slight curvature variations
    strokeWidth: 2.5,
    curveTightness: 0, // Makes curves smoother
    currentSlideId,
    currentSlide,
  });
};

// Updated createElement function with proper image handling
export const createElement = ({
  x1,
  y1,
  x2,
  y2,
  toolType,
  fillColorStyle,
  id,
  text,
  src,
  roomID,
  color,
  fill,
  strokeW,
  currentSlideId,
  currentSlide,
}) => {
  let roughElement;
  const elementColor = color || "#000000";
  console.log(
    `\n\nFILL STATE AT CREATE ELEMENT LINE 136 ${fillColorStyle} \n\n`
  );

  switch (toolType) {
    case toolTypes.RECTANGLE:
      roughElement = generateRectangle({
        x1,
        y1,
        x2,
        y2,
        color,
        filling: fill,
        fillStyle: fillColorStyle,
        currentSlideId,
        currentSlide,
      });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
        currentSlideId,
        currentSlide,
      };

    case toolTypes.LINE:
      roughElement = generateLine({
        x1,
        x2,
        y1,
        y2,
        color,
        currentSlideId,
        currentSlide,
      });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
        currentSlideId,
        currentSlide,
      };

    case toolTypes.TRIANGLE:
      roughElement = generateTriangle({
        x1,
        y1,
        x2,
        y2,
        color,
        fill,
        filling: fill,
        fillStylee: fillColorStyle,
        currentSlideId,
        currentSlide,
      });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor, // Fixed: was using color directly
        currentSlideId,
        currentSlide,
      };

    case toolTypes.CIRCLE:
      roughElement = generateCircle({
        x1,
        y1,
        x2,
        y2,
        color,
        fill,
        filling: fill,
        fillStylee: fillColorStyle,
        currentSlideId,
        currentSlide,
      });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
        currentSlideId,
        currentSlide,
      };

    case toolTypes.DIAMOND:
      roughElement = generateDiamond({
        x1,
        y1,
        x2,
        y2,
        color,
        filling: fill,
        fillStylee: fillColorStyle,
        currentSlideId,
        currentSlide,
      });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
        currentSlideId,
        currentSlide,
      };

    case toolTypes.STAR:
      roughElement = generateStar({
        x1,
        y1,
        x2,
        y2,
        color,
        filling: fill,
        fillStylee: fillColorStyle,
        currentSlideId,
        currentSlide,
      });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
        currentSlideId,
        currentSlide,
      };

    case toolTypes.ARROW:
      roughElement = generateArrow({
        x1,
        y1,
        x2,
        y2,
        color,
        filling: fill,
        fillStylee: fillColorStyle,
        currentSlideId,
        currentSlide,
      });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
        currentSlideId,
        currentSlide,
      };

    case toolTypes.PENTAGON:
      roughElement = generatePentagon({
        x1,
        y1,
        x2,
        y2,
        color,
        filling: fill,
        fillStylee: fillColorStyle,
        currentSlideId,
        currentSlide,
      });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
        currentSlideId,
        currentSlide,
      };

    case toolTypes.HEXAGON:
      roughElement = generateHexagon({
        x1,
        y1,
        x2,
        y2,
        color,
        filling: fill,
        fillStylee: fillColorStyle,
        currentSlideId,
        currentSlide,
      });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
        currentSlideId,
        currentSlide,
      };

    case toolTypes.HEART:
      roughElement = generateHeart({
        x1,
        y1,
        x2,
        y2,
        color,
        filling: fill,
        fillStylee: fillColorStyle,
        currentSlideId,
        currentSlide,
      });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
        currentSlideId,
        currentSlide,
      };

    case toolTypes.CLOUD:
      roughElement = generateCloud({
        x1,
        y1,
        x2,
        y2,
        color,
        filling: fill,
        fillStylee: fillColorStyle,
        currentSlideId,
        currentSlide,
      });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
        currentSlideId,
        currentSlide,
      };

    case toolTypes.PENCIL:
      return {
        id,
        type: toolType,
        points: [{ x: x1, y: y1 }],
        color: elementColor,
        strokeWidth: strokeW || 3, // Use strokeW parameter or default to 3,
        currentSlideId,
        currentSlide,
      };

    case toolTypes.IMAGE:
      // Create the element object with all necessary properties
      const element = {
        id,
        type: toolType,
        src: src || "",
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
        width: Math.abs(x2 - x1) || 200,
        height: Math.abs(y2 - y1) || 200,
        currentSlideId,
        currentSlide,
      };

      console.log("Created image element:", element);
      return element;

    case toolTypes.TEXT:
      return {
        id,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        text: text || "",
        color: elementColor,
        currentSlideId,
        currentSlide,
      };

    default:
      throw new Error("Something went wrong when creating element");
  }
};
