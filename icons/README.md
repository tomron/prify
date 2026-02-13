# PR File Reorder - Visual Assets

This directory contains all visual assets for the PR File Reorder Chrome extension.

## Icon Files

### Main Extension Icons
- `icon.svg` - Master SVG icon (scalable)
- `icon16.png` - 16x16 toolbar icon
- `icon48.png` - 48x48 extension management icon
- `icon128.png` - 128x128 Chrome Web Store icon

### Badge Icons (Status Indicators)
- `badge-success.svg` - Success state (green checkmark)
- `badge-warning.svg` - Warning state (yellow exclamation)
- `badge-error.svg` - Error state (red X)
- `badge-info.svg` - Info state (blue i)

### UI Elements
- `spinner.svg` - Animated loading spinner

## Promotional Images

### HTML Templates (for screenshots)
These HTML files can be opened in a browser and screenshot at the specified dimensions:

- `promo-440x280.html` - Small promotional tile (440x280px)
- `promo-920x680.html` - Marquee promotional tile (920x680px)
- `promo-1400x560.html` - Large marquee tile (1400x560px)

### How to Generate Screenshots

1. Open each HTML file in Chrome
2. Set browser window to exact dimensions (use Chrome DevTools Device Mode)
3. Take screenshot using browser tools or:
   ```bash
   # Using Chrome headless
   chrome --headless --screenshot=promo-440x280.png --window-size=440,280 promo-440x280.html
   ```

## Generating PNG Icons

To generate PNG icons from the master SVG:

```bash
# Install sharp (if not already installed)
npm install --save-dev sharp

# Run the generator
node generate-icons.js
```

The script will create `icon16.png`, `icon48.png`, and `icon128.png` from the master `icon.svg`.

## Chrome Web Store Requirements

For Chrome Web Store submission, you need:

1. **Required Icons:**
   - ✓ 128x128 icon (icon128.png) - Main store listing icon
   - ✓ 48x48 icon (icon48.png) - Extension management
   - ✓ 16x16 icon (icon16.png) - Toolbar

2. **Promotional Images (optional but recommended):**
   - ✓ 440x280 small tile
   - ✓ 920x680 marquee tile
   - ✓ 1400x560 large marquee tile

3. **Screenshots:**
   - At least 1 screenshot required
   - Maximum 5 screenshots
   - Recommended: 1280x800 or 640x400
   - Should show the extension in action on a GitHub PR

## Design Guidelines

### Color Palette
- Primary Green: `#2da44e`
- Dark Green: `#1a7f37`
- Success: `#1a7f37`
- Warning: `#d4a72c`
- Error: `#cf222e`
- Info: `#0969da`

### Typography
- Font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Follows GitHub's design system for seamless integration

### Icon Design Principles
1. **Simple and recognizable** - Files with arrow showing reordering
2. **Consistent with GitHub** - Uses GitHub's green color scheme
3. **Scalable** - Works at all sizes (16px to 128px)
4. **Accessible** - High contrast, clear shapes

## Usage in Extension

The icons are referenced in `manifest.json`:

```json
{
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  }
}
```

Badge icons can be used in the UI via CSS or inline SVG.

## License

These assets are part of the PR File Reorder extension and follow the same license as the main project.
