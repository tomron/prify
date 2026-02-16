# Chrome Web Store Assets

This directory contains all assets required for the Chrome Web Store listing.

## Directory Structure

```
store/
├── icons/           # Store listing icons
├── screenshots/     # Store screenshots
├── promotional/     # Promotional images
├── listing.md       # Store title, descriptions, category
└── README.md        # This file
```

## Asset Requirements

### Icons

**Required Sizes:**
- 128x128px - Primary store icon (PNG format)

**Guidelines:**
- High resolution, clear at small sizes
- Works on both light and dark backgrounds
- Follows Chrome Web Store icon design guidelines
- Maintains brand consistency with extension icons

**Source:** Icon files are sourced from the main `icons/` directory. The 128x128 icon is copied here for store submission.

**Current Icon:**
- Source file: `icons/icon128.png` (converted from `icons/icon128.svg`)
- SVG source: `icons/icon.svg`
- Generation script: `icons/generate-icons.cjs`

**Note:** If icon quality is insufficient for store submission, regenerate from SVG source at higher resolution or create a new design following Chrome Web Store guidelines.

### Screenshots

**Requirements:**
- Dimensions: 1280x800px or 640x400px
- Format: PNG or JPEG
- Minimum: 1 screenshot (recommended: 3-5)
- Show actual extension functionality on GitHub PR pages

**Screenshot Generation Process:**
1. Load extension as unpacked in Chrome
2. Navigate to test PR with 20-30 files
3. Set browser window to appropriate size
4. Set zoom level to 100%
5. Capture screenshots showing key features:
   - Default GitHub PR files view
   - Reorder modal with drag-and-drop
   - File list after reordering
   - Order viewer modal (optional)
   - Consensus ordering (optional)

**Test PR:** Use a PR with realistic content (20-30 files, mixed file types)

**Recommended Test PR:** Look for a merged PR in this repository with 20-30 files showing the extension's capabilities.

**Screenshot Naming Convention:**
- `01-default-view.png` - Default GitHub PR files view
- `02-reorder-modal.png` - Reorder modal with drag-and-drop
- `03-reordered-list.png` - File list after reordering
- `04-order-viewer.png` - Order viewer modal (optional)
- `05-consensus-viz.png` - Consensus ordering (optional)

### Promotional Images

**Small Tile (Required):**
- Dimensions: 440x280px
- Format: PNG or JPEG
- Must show actual extension UI (not mockups)

**Optional Sizes:**
- Marquee: 1400x560px
- Large tile: 920x680px

## Updating Store Assets

### When Screenshots Need Updates

Update screenshots when:
- Significant UI changes
- New major features added
- Visual bugs fixed that affected previous screenshots

### Update Process

1. Generate new screenshots following the process above
2. Save with version labels if archiving old ones
3. Update this README if process changes
4. Sync changes to Chrome Web Store Developer Console

### Updating Listing Copy

1. Edit `listing.md` with new content
2. Verify character limits (short description: 132 char max)
3. Update in Chrome Web Store Developer Console
4. Note: Description updates don't require full review if no functional changes

## Chrome Web Store Guidelines

- [Store listing best practices](https://developer.chrome.com/docs/webstore/best_practices/)
- [Icon design guidelines](https://developer.chrome.com/docs/webstore/images/)
- [Screenshot guidelines](https://developer.chrome.com/docs/webstore/images/#screenshots)
