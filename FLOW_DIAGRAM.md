# Color Inversion Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    THEME SWITCHING FLOW                         │
└─────────────────────────────────────────────────────────────────┘

TEACHER SIDE:
═══════════════════════════════════════════════════════════════════

┌──────────────┐
│   Teacher    │
│ Clicks Theme │
│ Toggle Btn   │
└──────┬───────┘
       │
       ▼
┌────────────────────┐
│  TopToolbar.jsx    │
│  handleThemeToggle │
└──────┬─────────────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌──────────────────┐              ┌─────────────────┐
│  Redux Dispatch  │              │  Socket Emit    │
│  toggleTheme()   │              │  emitThemeChange│
└──────┬───────────┘              └────────┬────────┘
       │                                   │
       ▼                                   │
┌──────────────────────────────────┐      │
│   whiteboardSlice.js             │      │
│   toggleTheme reducer            │      │
│                                  │      │
│   1. Toggle isDarkTheme state    │      │
│   2. Call invertAllElementColors │      │
│   3. Update selectedColor        │      │
└──────┬───────────────────────────┘      │
       │                                   │
       ▼                                   │
┌──────────────────────────────────┐      │
│   colorInverter.js               │      │
│   invertAllElementColors()       │      │
│                                  │      │
│   For each element:              │      │
│   - Invert color property        │      │
│   - Regenerate rough element     │      │
│   - Preserve other properties    │      │
└──────┬───────────────────────────┘      │
       │                                   │
       ▼                                   │
┌──────────────────────┐                  │
│   Canvas Re-render   │                  │
│   - Apply new bg     │                  │
│   - Draw elements    │                  │
│   - Show inverted    │                  │
│     colors           │                  │
└──────────────────────┘                  │
                                          │
═══════════════════════════════════════════════════════════════════
STUDENT SIDE:                             │
═══════════════════════════════════════════════════════════════════
                                          │
                                          ▼
                              ┌────────────────────┐
                              │  Socket Message    │
                              │  Received          │
                              └──────┬─────────────┘
                                     │
                                     ▼
                         ┌──────────────────────┐
                         │  socketConn.js       │
                         │  "message" listener  │
                         │  Detects THEME_CHANGE│
                         └──────┬───────────────┘
                                │
                                ▼
                         ┌──────────────────────┐
                         │  Redux Dispatch      │
                         │  toggleTheme()       │
                         └──────┬───────────────┘
                                │
                                ▼
            ┌────────────────────────────────────────┐
            │   whiteboardSlice.js                   │
            │   toggleTheme reducer                  │
            │                                        │
            │   1. Toggle isDarkTheme state          │
            │   2. Call invertAllElementColors       │
            │   3. Update selectedColor              │
            └────────┬───────────────────────────────┘
                     │
                     ▼
            ┌────────────────────────────────────────┐
            │   colorInverter.js                     │
            │   invertAllElementColors()             │
            │                                        │
            │   For each element:                    │
            │   - Invert color property              │
            │   - Regenerate rough element           │
            │   - Preserve other properties          │
            └────────┬───────────────────────────────┘
                     │
                     ▼
            ┌────────────────────┐
            │   Canvas Re-render │
            │   - Apply new bg   │
            │   - Draw elements  │
            │   - Show inverted  │
            │     colors         │
            └────────────────────┘


═══════════════════════════════════════════════════════════════════
COLOR INVERSION DETAIL:
═══════════════════════════════════════════════════════════════════

ELEMENT TYPES HANDLED:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌──────────────┐        ┌──────────────────────────────┐    │
│  │   PENCIL     │────────▶│ Invert color property        │    │
│  │   (Freehand) │        │ Points array preserved       │    │
│  └──────────────┘        └──────────────────────────────┘    │
│                                                                │
│  ┌──────────────┐        ┌──────────────────────────────┐    │
│  │   SHAPES     │────────▶│ Invert color property        │    │
│  │ (Rect, Circle│        │ Regenerate roughElement      │    │
│  │  Triangle,   │        │ Preserve fill settings       │    │
│  │  etc.)       │        │ Preserve coordinates         │    │
│  └──────────────┘        └──────────────────────────────┘    │
│                                                                │
│  ┌──────────────┐        ┌──────────────────────────────┐    │
│  │   TEXT       │────────▶│ Invert color property        │    │
│  │              │        │ Text content preserved       │    │
│  └──────────────┘        └──────────────────────────────┘    │
│                                                                │
│  ┌──────────────┐        ┌──────────────────────────────┐    │
│  │   LINE       │────────▶│ Invert color property        │    │
│  │              │        │ Regenerate roughElement      │    │
│  └──────────────┘        └──────────────────────────────┘    │
│                                                                │
│  ┌──────────────┐        ┌──────────────────────────────┐    │
│  │   IMAGE      │────────▶│ No color inversion           │    │
│  │              │        │ (Images kept as-is)          │    │
│  └──────────────┘        └──────────────────────────────┘    │
│                                                                │
└────────────────────────────────────────────────────────────────┘


COLOR INVERSION EXAMPLES:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Light Mode → Dark Mode                                       │
│  ─────────────────────────                                    │
│                                                                │
│  #000000 (Black)  ──────────▶  #ffffff (White)               │
│  #ffffff (White)  ──────────▶  #000000 (Black)               │
│  #ff0000 (Red)    ──────────▶  #00ffff (Cyan)                │
│  #00ff00 (Green)  ──────────▶  #ff00ff (Magenta)             │
│  #0000ff (Blue)   ──────────▶  #ffff00 (Yellow)              │
│  #1f2937 (DarkBG) ──────────▶  #ffffff (White)               │
│                                                                │
│  Formula: RGB(r, g, b) → RGB(255-r, 255-g, 255-b)            │
│                                                                │
└────────────────────────────────────────────────────────────────┘


ERASER BEHAVIOR:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Light Mode:                                                   │
│  ┌──────────────────────────────────────┐                    │
│  │ Eraser draws with #ffffff (White)    │                    │
│  │ Blends with white background         │                    │
│  │ When switched to dark mode:          │                    │
│  │   → White marks invert to black      │                    │
│  │   → Black marks blend with dark bg   │                    │
│  └──────────────────────────────────────┘                    │
│                                                                │
│  Dark Mode:                                                    │
│  ┌──────────────────────────────────────┐                    │
│  │ Eraser draws with #1f2937 (Dark)     │                    │
│  │ Blends with dark background          │                    │
│  │ When switched to light mode:         │                    │
│  │   → Dark marks invert to light       │                    │
│  │   → Light marks blend with white bg  │                    │
│  └──────────────────────────────────────┘                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘


SYNCHRONIZATION:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   Teacher                    Server                 Students   │
│     │                          │                        │      │
│     │   Theme Change           │                        │      │
│     ├──────────────────────────▶                        │      │
│     │   (via socket)           │                        │      │
│     │                          │   Theme Message        │      │
│     │                          ├────────────────────────▶      │
│     │                          │   (broadcast)          │      │
│     │                          │                        │      │
│     │   Local Inversion        │                        │      │
│     ├──────────┐               │                        │      │
│     │          │               │           Local        │      │
│     │          ▼               │           Inversion    │      │
│     │   ┌──────────┐           │                ┌───────┴────┐ │
│     │   │ Elements │           │                │  Elements  │ │
│     │   │ Inverted │           │                │  Inverted  │ │
│     │   └──────────┘           │                └────────────┘ │
│     │                          │                        │      │
│     ▼                          │                        ▼      │
│  Rendered                      │                    Rendered   │
│                                                                │
└────────────────────────────────────────────────────────────────┘


PERFORMANCE:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Elements    Processing Time    Status                        │
│  ─────────   ───────────────    ──────                        │
│      10      < 10ms             ✅ Instant                     │
│     100      < 100ms            ✅ Fast                        │
│    1000      < 500ms            ✅ Acceptable                  │
│   10000      < 2s               ⚠️  May be slow                │
│                                                                │
│  Processing: O(n) where n = number of elements                │
│  Memory: O(n) for storing inverted elements                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘


KEY FUNCTIONS:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  invertColor(color)                                           │
│  ├─ Input: String (hex, rgb, rgba, named)                    │
│  ├─ Process: Invert RGB values (255 - value)                 │
│  └─ Output: Inverted color string                            │
│                                                                │
│  invertElementColors(element)                                 │
│  ├─ Input: Single element object                             │
│  ├─ Process:                                                  │
│  │  1. Invert color property                                 │
│  │  2. Regenerate rough element if shape                     │
│  │  3. Preserve all other properties                         │
│  └─ Output: Element with inverted colors                     │
│                                                                │
│  invertAllElementColors(elements)                             │
│  ├─ Input: Array of elements                                 │
│  ├─ Process: Map over array, call invertElementColors        │
│  └─ Output: Array of elements with inverted colors           │
│                                                                │
│  regenerateRoughElement(element, newColor)                    │
│  ├─ Input: Element and new color                             │
│  ├─ Process: Use rough.js to regenerate shape                │
│  └─ Output: New rough element with inverted color            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Visual Example

### Before Theme Switch (Light Mode):
```
┌────────────────────────────────────────┐
│                                        │  White Background
│   ╔═════════════╗                      │
│   ║  Black Text ║  ← Visible           │
│   ╚═════════════╝                      │
│                                        │
│   ●●● Black Pencil Line  ← Visible    │
│                                        │
│   ┌──────────┐                         │
│   │   Red    │  ← Visible              │
│   │Rectangle │                         │
│   └──────────┘                         │
│                                        │
└────────────────────────────────────────┘
```

### After Theme Switch (Dark Mode):
```
┌────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  Dark Background
│░░╔═════════════╗░░░░░░░░░░░░░░░░░░░░░│
│░░║  White Text ║  ← Still Visible!   │
│░░╚═════════════╝░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░●●● White Pencil Line  ← Visible    │
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░┌──────────┐░░░░░░░░░░░░░░░░░░░░░░░│
│░░│   Cyan   │  ← Still Visible!      │
│░░│Rectangle │░░░░░░░░░░░░░░░░░░░░░░░│
│░░└──────────┘░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└────────────────────────────────────────┘
```

**All elements remain visible! 🎉**
