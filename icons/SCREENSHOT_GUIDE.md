# Screenshot Guide for Chrome Web Store

This guide explains how to generate screenshots for the Chrome Web Store listing.

## Requirements

Chrome Web Store requires:
- **At least 1 screenshot** (up to 5 total)
- **Recommended dimensions**: 1280x800 or 640x400
- **File format**: PNG or JPEG
- **Maximum file size**: 5MB per image

## What to Screenshot

Show the extension in action on a real GitHub Pull Request. Recommended screenshots:

1. **Main reorder modal** - Showing the drag-and-drop interface
2. **Order viewer** - Showing multiple user orders and consensus
3. **Applied consensus** - PR with reordered files
4. **Export/Share** - Showing the export/share functionality

## How to Generate Screenshots

### Method 1: Manual (Recommended for actual PR screenshots)

1. **Install the extension**:
   ```bash
   cd /path/to/pr-file-reorder
   npm run build
   # Open chrome://extensions
   # Enable Developer Mode
   # Click "Load unpacked"
   # Select the project directory
   ```

2. **Navigate to a GitHub PR**:
   - Go to any GitHub Pull Request (preferably one with 10+ files)
   - Example: https://github.com/facebook/react/pull/latest

3. **Open reorder modal**:
   - Click the "Reorder Files" button
   - Arrange some files by dragging

4. **Take screenshot**:
   - **macOS**: Cmd+Shift+4, then space, click window
   - **Windows**: Windows+Shift+S
   - **Chrome DevTools**: Cmd+Shift+P → "Capture screenshot"

5. **Resize if needed**:
   - Use Preview (macOS) or Paint (Windows) to resize to 1280x800

### Method 2: Automated with Playwright

Create a Playwright script to screenshot specific states:

```javascript
// scripts/generate-screenshots.js
import { chromium } from '@playwright/test';
import path from 'path';

async function generateScreenshots() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  // Load extension
  const extensionPath = path.join(process.cwd());
  await context.addInitScript({ path: extensionPath });

  const page = await context.newPage();

  // Navigate to a test PR (use a public repo)
  await page.goto('https://github.com/facebook/react/pull/latest');

  // Wait for extension to load
  await page.waitForTimeout(2000);

  // Screenshot 1: Initial state
  await page.screenshot({
    path: 'screenshots/01-initial-pr-view.png',
    fullPage: true
  });

  // Screenshot 2: Reorder modal
  await page.click('[data-testid="reorder-button"]');
  await page.waitForSelector('.pr-reorder-modal');
  await page.screenshot({
    path: 'screenshots/02-reorder-modal.png'
  });

  // Screenshot 3: Order viewer
  await page.click('[data-action="view-orders"]');
  await page.screenshot({
    path: 'screenshots/03-order-viewer.png'
  });

  await browser.close();
}

generateScreenshots().catch(console.error);
```

### Method 3: Use Promotional HTML Files

For initial submission (before having real usage):

1. **Open promotional HTML files**:
   ```bash
   open icons/promo-1400x560.html
   ```

2. **Set browser to exact dimensions**:
   - Open Chrome DevTools (Cmd+Option+I)
   - Click device toolbar (Cmd+Shift+M)
   - Set to "Responsive"
   - Enter dimensions (e.g., 1400x560)

3. **Take screenshot**:
   - Use Chrome's "Capture screenshot" feature in DevTools
   - Right-click → "Capture screenshot"

4. **Crop and resize**:
   - Crop to 1280x800 or 640x400 for Web Store

## Screenshot Checklist

Before submitting screenshots:

- [ ] Images are 1280x800 or 640x400 (or similar aspect ratio)
- [ ] File size is under 5MB each
- [ ] Images are clear and readable
- [ ] Show the extension's key features
- [ ] Use high-quality PNG format
- [ ] No sensitive information visible (private repos, tokens, etc.)
- [ ] Screenshots show realistic usage on GitHub PR pages
- [ ] At least one screenshot shows the main UI modal

## Tips for Great Screenshots

1. **Use a real PR** - Shows authentic usage
2. **Choose a clean PR** - Not too many files, clear file names
3. **Show key features** - Drag-and-drop, consensus, multiple orders
4. **Good lighting** - Light theme is often clearer in screenshots
5. **Annotate if helpful** - Add arrows or callouts to highlight features
6. **Test on different screens** - Screenshots should look good on various devices

## Storage Location

Store final screenshots in:
```
/screenshots/
  01-reorder-modal.png
  02-order-viewer.png
  03-applied-consensus.png
  04-export-share.png
```

Don't commit screenshots to git (add `/screenshots/` to `.gitignore`) unless they're small and reference images.
