/**
 * Utility for inverting colors when switching between light and dark themes
 */

import rough from "roughjs/bundled/rough.esm";
import { toolTypes } from "../../constants";

const generator = rough.generator();

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex) => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Handle shorthand hex (e.g., #fff)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
};

/**
 * Convert RGB to hex
 */
const rgbToHex = (r, g, b) => {
  const toHex = (n) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Invert a color
 */
export const invertColor = (color) => {
  if (!color || typeof color !== 'string') {
    return color;
  }
  
  // Handle common color names and exact matches
  const colorMap = {
    'white': '#1f2937', // White (light mode eraser) -> dark background
    '#ffffff': '#1f2937', // White -> dark background
    '#fff': '#1f2937', // White shorthand -> dark background
    'black': '#ffffff',
    '#000000': '#ffffff',
    '#000': '#fff',
    // Handle theme background colors (for eraser strokes)
    '#1f2937': '#ffffff', // Dark background (dark mode eraser) -> white (light mode background)
  };
  
  const lowerColor = color.toLowerCase();
  if (colorMap[lowerColor]) {
    return colorMap[lowerColor];
  }
  
  // Handle hex colors
  if (color.startsWith('#')) {
    try {
      const { r, g, b } = hexToRgb(color);
      const invertedR = 255 - r;
      const invertedG = 255 - g;
      const invertedB = 255 - b;
      return rgbToHex(invertedR, invertedG, invertedB);
    } catch (error) {
      console.warn('Failed to invert color:', color, error);
      return color;
    }
  }
  
  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    try {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0]);
        const g = parseInt(matches[1]);
        const b = parseInt(matches[2]);
        const a = matches[3] ? parseFloat(matches[3]) / 255 : undefined;
        
        const invertedR = 255 - r;
        const invertedG = 255 - g;
        const invertedB = 255 - b;
        
        if (a !== undefined) {
          return `rgba(${invertedR}, ${invertedG}, ${invertedB}, ${a})`;
        }
        return `rgb(${invertedR}, ${invertedG}, ${invertedB})`;
      }
    } catch (error) {
      console.warn('Failed to invert rgb color:', color, error);
      return color;
    }
  }
  
  // If we can't invert it, return as is
  return color;
};

/**
 * Regenerate rough element with new color
 */
const regenerateRoughElement = (element, newColor) => {
  if (!element || !element.roughElement) {
    return null;
  }

  const { x1, y1, x2, y2, type } = element;
  const options = element.roughElement.options || {};
  const filling = options.fill !== false && options.fill !== undefined;
  const fillStyle = options.fillStyle || 'hachure';

  try {
    switch (type) {
      case toolTypes.RECTANGLE:
      case 'rectangle':
        return generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
          fill: filling ? newColor : false,
          stroke: newColor,
          hachureAngle: 60,
          hachureGap: 8,
          fillStyle: fillStyle,
        });

      case toolTypes.LINE:
      case 'line':
        return generator.line(x1, y1, x2, y2, {
          stroke: newColor,
          strokeWidth: 2,
          roughness: 1,
        });

      case toolTypes.CIRCLE:
      case 'circle': {
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        const centerX = Math.min(x1, x2) + width / 2;
        const centerY = Math.min(y1, y2) + height / 2;
        const radius = Math.max(width, height) / 2;

        return generator.circle(centerX, centerY, radius * 2, {
          fill: filling ? newColor : false,
          stroke: newColor,
          hachureAngle: 60,
          hachureGap: 8,
          fillStyle: fillStyle,
        });
      }

      case toolTypes.TRIANGLE:
      case 'triangle': {
        const width = Math.abs(x2 - x1);
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
            fill: filling ? newColor : false,
            stroke: newColor,
            hachureAngle: 60,
            hachureGap: 8,
            roughness: 1,
            fillStyle: fillStyle,
          }
        );
      }

      case toolTypes.DIAMOND:
      case 'diamond': {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        return generator.polygon(
          [
            [centerX, minY],
            [maxX, centerY],
            [centerX, maxY],
            [minX, centerY],
          ],
          {
            fill: filling ? newColor : false,
            stroke: newColor,
            hachureAngle: 60,
            hachureGap: 8,
            fillStyle: fillStyle,
          }
        );
      }

      // Add other shape types
      case toolTypes.STAR:
      case 'star': {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const outerRadius = Math.min(maxX - minX, maxY - minY) / 2;
        const innerRadius = outerRadius * 0.4;

        const points = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          points.push([x, y]);
        }

        return generator.polygon(points, {
          fill: filling ? newColor : false,
          stroke: newColor,
          hachureAngle: 60,
          hachureGap: 8,
          fillStyle: fillStyle,
        });
      }

      case toolTypes.ARROW:
      case 'arrow': {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        const centerY = (minY + maxY) / 2;
        const arrowHeadWidth = (maxX - minX) * 0.3;
        const arrowBodyHeight = (maxY - minY) * 0.4;
        const arrowBodyY1 = centerY - arrowBodyHeight / 2;
        const arrowBodyY2 = centerY + arrowBodyHeight / 2;

        return generator.polygon(
          [
            [minX, arrowBodyY1],
            [maxX - arrowHeadWidth, arrowBodyY1],
            [maxX - arrowHeadWidth, minY],
            [maxX, centerY],
            [maxX - arrowHeadWidth, maxY],
            [maxX - arrowHeadWidth, arrowBodyY2],
            [minX, arrowBodyY2],
          ],
          {
            fill: filling ? newColor : false,
            stroke: newColor,
            hachureAngle: 60,
            hachureGap: 8,
            fillStyle: fillStyle,
          }
        );
      }

      case toolTypes.PENTAGON:
      case 'pentagon': {
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
          fill: filling ? newColor : false,
          stroke: newColor,
          hachureAngle: 60,
          hachureGap: 8,
          fillStyle: fillStyle,
        });
      }

      case toolTypes.HEXAGON:
      case 'hexagon': {
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
          fill: filling ? newColor : false,
          stroke: newColor,
          hachureAngle: 60,
          hachureGap: 8,
          fillStyle: fillStyle,
        });
      }

      case toolTypes.HEART:
      case 'heart': {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = minX + width / 2;
        const topY = minY + height * 0.3;

        const points = [];
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const angle = t * 2 * Math.PI;
          const x = centerX + (width * 0.15) * Math.pow(Math.sin(angle), 3);
          const y = topY - (height * 0.1) * (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) / 16;
          points.push([x, y]);
        }

        return generator.polygon(points, {
          fill: filling ? newColor : false,
          stroke: newColor,
          hachureAngle: 60,
          hachureGap: 8,
          fillStyle: fillStyle,
        });
      }

      case toolTypes.CLOUD:
      case 'cloud': {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        const width = maxX - minX;
        const height = maxY - minY;

        const cloudPath = `
          M ${minX + width * 0.15} ${maxY}
          Q ${minX + width * 0.05} ${minY + height * 0.8} ${minX + width * 0.1} ${minY + height * 0.6}
          Q ${minX} ${minY + height * 0.4} ${minX + width * 0.15} ${minY + height * 0.3}
          Q ${minX + width * 0.1} ${minY + height * 0.1} ${minX + width * 0.25} ${minY + height * 0.15}
          Q ${minX + width * 0.35} ${minY} ${minX + width * 0.5} ${minY + height * 0.1}
          Q ${minX + width * 0.65} ${minY} ${minX + width * 0.75} ${minY + height * 0.15}
          Q ${minX + width * 0.9} ${minY + height * 0.1} ${minX + width * 0.85} ${minY + height * 0.3}
          Q ${maxX} ${minY + height * 0.4} ${minX + width * 0.9} ${minY + height * 0.6}
          Q ${minX + width * 0.95} ${minY + height * 0.8} ${minX + width * 0.85} ${maxY}
          Z
        `;

        return generator.path(cloudPath, {
          fill: filling ? newColor : false,
          stroke: newColor,
          hachureAngle: 45,
          hachureGap: 6,
          fillStyle: fillStyle,
          roughness: 1.0,
          bowing: 0.6,
          strokeWidth: 2.5,
          curveTightness: 0,
        });
      }

      default:
        return element.roughElement;
    }
  } catch (error) {
    console.warn('Failed to regenerate rough element:', error);
    return element.roughElement;
  }
};

/**
 * Invert all colors in an element
 */
export const invertElementColors = (element) => {
  if (!element) return element;
  
  const invertedElement = { ...element };
  
  // Invert main color
  if (element.color) {
    const newColor = invertColor(element.color);
    invertedElement.color = newColor;

    // Regenerate rough element with new color for shapes
    if (element.roughElement) {
      const newRoughElement = regenerateRoughElement(element, newColor);
      if (newRoughElement) {
        invertedElement.roughElement = newRoughElement;
      }
    }
  }
  
  return invertedElement;
};

/**
 * Invert colors of all elements in an array
 */
export const invertAllElementColors = (elements) => {
  if (!Array.isArray(elements)) return elements;
  
  console.log(`🎨 Inverting colors for ${elements.length} elements`);
  const invertedElements = elements.map(element => invertElementColors(element));
  console.log(`✅ Color inversion complete`);
  
  return invertedElements;
};

/**
 * Check if a color is close to background color and should be inverted
 */
export const shouldInvertForTheme = (color, isDarkTheme) => {
  if (!color) return false;
  
  // If switching to dark theme and color is close to light background
  if (isDarkTheme && (
    color.toLowerCase() === '#ffffff' ||
    color.toLowerCase() === '#fff' ||
    color.toLowerCase() === 'white'
  )) {
    return true;
  }
  
  // If switching to light theme and color is close to dark background
  if (!isDarkTheme && (
    color.toLowerCase() === '#1f2937' ||
    color.toLowerCase() === '#000000' ||
    color.toLowerCase() === '#000' ||
    color.toLowerCase() === 'black'
  )) {
    return true;
  }
  
  return false;
};
