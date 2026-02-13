# Loading the Extension in Chrome

## Initial Setup

1. **Build the extension** (required before loading):
   ```bash
   npm run build
   ```
   This creates the bundled `dist/content.js` file.

2. **Open Chrome Extensions page**:
   - Navigate to `chrome://extensions`
   - Or: Menu → Extensions → Manage Extensions

3. **Enable Developer Mode**:
   - Toggle "Developer mode" switch in top-right corner

4. **Load the extension**:
   - Click "Load unpacked"
   - Select the **root directory** of this project (`/Users/tomron/code/prify`)
   - The extension should now appear in your extensions list

## Verifying It Works

1. Navigate to a GitHub Pull Request (e.g., https://github.com/tomron/prify/pull/21)
2. **IMPORTANT: Click the "Files changed" tab** (the extension only works on this tab!)
3. Open Chrome DevTools (F12 or Cmd+Option+I)
4. Check the Console for logs:
   - `[PR-Reorder] Content script loaded`
   - `[PR-Reorder] Initializing on PR: ...`
   - `[PR-Reorder] Buttons injected`
5. Look for two new buttons in the PR Files section:
   - **↕️ Reorder Files** - Opens drag-and-drop modal
   - **👥 View Orders** - Shows all user orders and consensus

**Note**: If you're on the "Conversation" tab, you'll see the message:
```
[PR-Reorder] Not on Files tab yet. Extension will activate when you navigate to Files.
```
This is expected! Just click "Files changed" to activate the extension.

## After Making Changes

Every time you modify the source code:

1. **Rebuild**:
   ```bash
   npm run build
   ```
   Or use watch mode during development:
   ```bash
   npm run build:watch
   ```

2. **Reload extension in Chrome**:
   - Go to `chrome://extensions`
   - Find "PR File Reorder"
   - Click the circular reload icon

3. **Refresh the PR page** in your browser

## Troubleshooting

### "Uncaught SyntaxError: Cannot use import statement outside a module"
- **Cause**: Extension wasn't built, or using old cached version
- **Fix**: Run `npm run build` and reload extension

### Buttons don't appear on PR page
- **Check Console**: Look for errors or warnings in DevTools console
- **Verify selector**: GitHub may have changed their DOM structure
- **Check logs**: Look for `[PR-Reorder]` logs to see initialization status

### Extension icon shows but nothing happens
- **This is expected**: The popup is just informational
- **Actual functionality**: Look for buttons on the PR page itself (near "Files changed")

## Development Workflow

For active development with auto-reload:

1. Terminal 1 - Watch and rebuild:
   ```bash
   npm run build:watch
   ```

2. Terminal 2 - Run tests (optional):
   ```bash
   npm run test:watch
   ```

3. After each change:
   - Rollup auto-rebuilds (watch mode)
   - Reload extension in Chrome (manual)
   - Refresh PR page (manual)

## Production Build

For final testing before release:

```bash
npm run build && npm run lint && npm run format:check && npm test
```

All checks must pass before committing!
