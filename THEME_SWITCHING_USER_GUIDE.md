# Theme Switching with Color Inversion - User Guide

## Overview
The whiteboard now supports automatic color inversion when switching between light mode (whiteboard) and dark mode (blackboard). All existing drawings remain visible and readable!

## How to Use

### For Teachers:

1. **Switch Themes**:
   - Click the theme toggle button in the top toolbar
   - Icon changes between sun ☀️ (light mode) and moon 🌙 (dark mode)
   - All student views automatically update

2. **What Happens**:
   - Background changes (white ↔ dark gray)
   - All existing drawings automatically invert colors
   - New drawings use appropriate colors for the theme
   - Eraser works correctly on both backgrounds

### For Students:

- **Automatic Sync**: When teacher switches theme, your view updates automatically
- **All Drawings Visible**: Everything remains readable on the new background
- **No Manual Action Needed**: Just continue working normally

## Examples

### Light Mode (Whiteboard)
- Background: White
- Default color: Black
- Eraser: White (blends with background)
- Dark drawings: Visible
- Light drawings: Inverted to dark when switching from dark mode

### Dark Mode (Blackboard)
- Background: Dark Gray (#1f2937)
- Default color: White
- Eraser: Dark Gray (blends with background)
- Light drawings: Visible
- Dark drawings: Inverted to light when switching from light mode

## Visual Examples

### Scenario 1: Black Text on White Background
1. Draw with black pencil on white background
2. Switch to dark mode
3. **Result**: Text becomes white on dark background ✅

### Scenario 2: Using Eraser
1. Draw something in light mode
2. Erase parts with eraser (creates white marks)
3. Switch to dark mode
4. **Result**: Eraser marks become dark and blend with new background ✅

### Scenario 3: Colored Shapes
1. Draw red rectangle on white background
2. Switch to dark mode
3. **Result**: Rectangle becomes cyan (inverted red) on dark background ✅
4. Switch back to light mode
5. **Result**: Rectangle becomes red again ✅

## Color Inversion Table

| Original Color | Light Mode | Dark Mode |
|---------------|------------|-----------|
| Black (#000000) | Black on white | White on dark |
| White (#ffffff) | White on white | Black on dark |
| Red (#ff0000) | Red on white | Cyan on dark |
| Green (#00ff00) | Green on white | Magenta on dark |
| Blue (#0000ff) | Blue on white | Yellow on dark |
| Yellow (#ffff00) | Yellow on white | Blue on dark |
| Cyan (#00ffff) | Cyan on white | Red on dark |
| Magenta (#ff00ff) | Magenta on white | Green on dark |

## Benefits

### ✅ Always Visible
All drawings remain visible regardless of theme

### ✅ No Data Loss
All your work is preserved, just colors adapt

### ✅ Clean Eraser
Eraser marks blend perfectly with both backgrounds

### ✅ Synchronized
Everyone sees the same thing at the same time

### ✅ Works with Everything
- Pencil drawings
- Shapes (rectangle, circle, triangle, etc.)
- Text
- Lines
- Filled shapes
- Multiple colors

## Tips

1. **Best Practices**:
   - Use darker colors in light mode
   - Use lighter colors in dark mode
   - The system auto-inverts, so don't worry about color choices

2. **Eraser Behavior**:
   - Eraser always uses background color
   - Erased areas appear "clean" on current background
   - When switching themes, eraser marks invert like other elements

3. **Multiple Users**:
   - Only teacher can switch themes
   - All students receive updates automatically
   - Drawings from all users are inverted correctly

## Troubleshooting

### Issue: Colors don't look right after switching
- **Solution**: Refresh the page, colors should update automatically

### Issue: Eraser still visible after theme switch
- **Solution**: This is expected! Old eraser marks invert like other elements. New eraser uses new background color.

### Issue: Some elements not visible
- **Solution**: Check if they were drawn with background color. Try switching theme back and forth.

### Issue: Theme not syncing across devices
- **Solution**: Check internet connection. Make sure all devices are in the same room.

## Technical Notes

- Color inversion happens client-side (no server delay)
- All element types supported
- Rough.js shapes regenerated with new colors
- Images are not inverted (they keep original appearance)
- Text colors are inverted for readability

## Keyboard Shortcuts

Currently no keyboard shortcuts for theme switching. Use the button in the toolbar.

## Future Features

- Custom color themes
- Selective color inversion
- Theme presets
- Remember last theme preference

## Need Help?

If you encounter any issues with theme switching or color inversion:
1. Try refreshing the page
2. Check that you're using the latest version
3. Report bugs with screenshots showing the issue
4. Include information about which theme you switched from/to

---

**Enjoy using the new theme switching feature! 🎨**
