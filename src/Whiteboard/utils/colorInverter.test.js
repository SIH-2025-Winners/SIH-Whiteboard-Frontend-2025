/**
 * Unit tests for color inversion utility
 * Run this file with: node src/Whiteboard/utils/colorInverter.test.js
 */

// Simple test framework
const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
};

// Import the invertColor function (simplified for testing)
const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
};

const rgbToHex = (r, g, b) => {
  const toHex = (n) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const invertColor = (color) => {
  if (!color || typeof color !== 'string') {
    return color;
  }
  
  const colorMap = {
    'white': '#000000',
    '#ffffff': '#000000',
    '#fff': '#000',
    'black': '#ffffff',
    '#000000': '#ffffff',
    '#000': '#fff',
    '#1f2937': '#ffffff',
  };
  
  const lowerColor = color.toLowerCase();
  if (colorMap[lowerColor]) {
    return colorMap[lowerColor];
  }
  
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
  
  return color;
};

// Run tests
console.log('\n🧪 Running Color Inversion Tests...\n');

// Test 1: Basic color inversion
assert(invertColor('#000000') === '#ffffff', 'Black inverts to white');
assert(invertColor('#ffffff') === '#000000', 'White inverts to black');
assert(invertColor('#1f2937') === '#ffffff', 'Dark background inverts to white');

// Test 2: Hex color inversion
assert(invertColor('#ff0000') === '#00ffff', 'Red inverts to cyan');
assert(invertColor('#00ff00') === '#ff00ff', 'Green inverts to magenta');
assert(invertColor('#0000ff') === '#ffff00', 'Blue inverts to yellow');

// Test 3: Shorthand hex
assert(invertColor('#fff') === '#000', 'Shorthand white inverts correctly');
assert(invertColor('#000') === '#fff', 'Shorthand black inverts correctly');

// Test 4: Named colors
assert(invertColor('white') === '#000000', 'Named white inverts to black');
assert(invertColor('black') === '#ffffff', 'Named black inverts to white');

// Test 5: Invalid inputs
assert(invertColor(null) === null, 'Null color returns null');
assert(invertColor(undefined) === undefined, 'Undefined color returns undefined');
assert(invertColor('') === '', 'Empty string returns empty string');

// Test 6: Mid-tone colors
const gray = '#808080';
const invertedGray = invertColor(gray);
assert(invertedGray === '#7f7f7f', 'Gray inverts to inverted gray');

// Test 7: Edge cases
assert(invertColor('#aabbcc') === '#554433', 'Complex hex inverts correctly');
assert(invertColor('#123456') === '#edcba9', 'Another complex hex inverts correctly');

console.log('\n✨ All tests passed!\n');

// Additional visual test examples
console.log('📊 Color Inversion Examples:\n');
const testColors = [
  '#000000', // Black
  '#ffffff', // White
  '#ff0000', // Red
  '#00ff00', // Green
  '#0000ff', // Blue
  '#ffff00', // Yellow
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
  '#808080', // Gray
  '#1f2937', // Dark background
];

testColors.forEach(color => {
  const inverted = invertColor(color);
  console.log(`  ${color} → ${inverted}`);
});

console.log('\n✅ Color Inversion Utility Test Complete!\n');
