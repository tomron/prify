# Troubleshooting Guide

This guide helps you diagnose and fix common issues with PR File Reorder.

## Table of Contents

- [Extension Not Loading](#extension-not-loading)
- [Reorder Button Missing](#reorder-button-missing)
- [Files Not Reordering](#files-not-reordering)
- [Orders Not Saving](#orders-not-saving)
- [Performance Issues](#performance-issues)
- [Consensus Problems](#consensus-problems)
- [UI/UX Issues](#uiux-issues)
- [Browser Console Errors](#browser-console-errors)
- [Getting More Help](#getting-more-help)

---

## Extension Not Loading

### Symptoms
- Extension icon not visible
- No PR File Reorder features appear on GitHub
- Extension appears in chrome://extensions but doesn't work

### Diagnosis Steps

1. **Check if extension is enabled**
   ```
   1. Go to chrome://extensions
   2. Find "PR File Reorder"
   3. Ensure the toggle is ON (blue)
   ```

2. **Check extension permissions**
   ```
   1. Click "Details" on the extension
   2. Verify "Site access" includes github.com
   3. If not, click "Site access" and select "On github.com"
   ```

3. **Check for conflicts**
   ```
   1. Disable other GitHub-related extensions
   2. Refresh GitHub PR page
   3. If it works, re-enable extensions one by one to find the conflict
   ```

### Solutions

**Solution 1: Reload the extension**
```
1. Go to chrome://extensions
2. Find "PR File Reorder"
3. Click the reload icon (circular arrow)
4. Refresh your GitHub page
```

**Solution 2: Reinstall the extension**
```
1. Remove the extension
2. Restart Chrome
3. Reinstall from Chrome Web Store
```

**Solution 3: Clear extension data**
```
1. Go to chrome://settings/clearBrowserData
2. Select "Cookies and other site data"
3. Time range: "Last hour"
4. Clear data
5. Reload extension
```

**Solution 4: Update Chrome**
```
1. Check Chrome version (chrome://settings/help)
2. Update if version < 120
3. Restart Chrome
```

---

## Reorder Button Missing

### Symptoms
- On a GitHub PR page but no "Reorder Files" button
- Extension is loaded but features don't appear

### Diagnosis Steps

1. **Verify you're on a PR page**
   - URL should contain `/pull/[number]`
   - You should be on the "Files changed" tab
   - NOT on "Conversation" or "Commits" tabs

2. **Check page load status**
   - Wait 5-10 seconds for page to fully load
   - GitHub uses lazy loading which may delay extension activation

3. **Inspect browser console**
   ```
   1. Press F12 (or Cmd+Opt+I on Mac)
   2. Go to Console tab
   3. Look for errors mentioning "PR-Reorder" or "prify"
   ```

### Solutions

**Solution 1: Refresh the page**
```
Press Cmd+R (Mac) or Ctrl+R (Windows/Linux)
Wait for full page load
```

**Solution 2: Navigate to Files tab**
```
Click "Files changed" tab at top of PR
Wait for files to load
```

**Solution 3: Hard refresh**
```
Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
This clears cache and reloads
```

**Solution 4: Check GitHub DOM structure**
```
If GitHub recently updated their UI:
1. Report the issue on our GitHub Issues page
2. Include your GitHub URL structure
3. We'll update the extension to support the new DOM
```

---

## Files Not Reordering

### Symptoms
- Click "Save & Apply" but files don't move
- Modal closes but nothing changes
- Order reverts after refresh

### Diagnosis Steps

1. **Check if files actually moved**
   ```
   Sometimes the change is subtle
   Look at the first and last files specifically
   ```

2. **Check browser console for errors**
   ```
   F12 → Console tab
   Look for red errors during save
   ```

3. **Verify you clicked "Save & Apply"**
   ```
   Cancel button discards changes
   Only "Save & Apply" persists the order
   ```

### Solutions

**Solution 1: Try again with a simple reorder**
```
1. Open reorder modal
2. Move just one file to the top
3. Save & Apply
4. If this works, try more complex reorders
```

**Solution 2: Use a preset first**
```
1. Open reorder modal
2. Select a preset (e.g., "Alphabetical")
3. Save & Apply
4. If presets work, drag-and-drop should too
```

**Solution 3: Check for dynamic loading conflicts**
```
If PR has 50+ files:
1. Scroll down to load all files first
2. Then open reorder modal
3. GitHub's lazy loading can interfere
```

**Solution 4: Clear localStorage**
```javascript
// In browser console (F12):
localStorage.removeItem('pr-file-order');
location.reload();
```

---

## Orders Not Saving

### Symptoms
- Order changes but doesn't persist across page reloads
- Other team members can't see your order
- "View All Orders" doesn't show your order

### Diagnosis Steps

1. **Check write permissions**
   ```
   Can you comment on the PR normally?
   If not, you don't have write permissions
   ```

2. **Check network connectivity**
   ```
   Are other GitHub features working?
   Can you post regular comments?
   ```

3. **Check for errors during save**
   ```
   F12 → Console
   Look for errors when clicking "Save & Apply"
   ```

4. **Look for PR comments**
   ```
   Check if a hidden comment was created
   Look for: <!-- file-order-data
   ```

### Solutions

**Solution 1: Verify permissions**
```
1. Try posting a regular comment on the PR
2. If you can't, you need write permissions
3. Ask repo owner to grant access
4. Or use export/import feature (if available)
```

**Solution 2: Check rate limiting**
```
Extension has a 5-second cooldown between saves
If you save too quickly:
1. Wait 5 seconds
2. Try saving again
```

**Solution 3: Use localStorage fallback**
```
If saves aren't working, the extension falls back to localStorage
Your order is saved locally but not shared
Look for a notification saying "Saved locally"
```

**Solution 4: Manual comment creation**
```
If automatic saving fails, you can manually create an order comment:

1. Copy this template:
<!-- file-order-data
{
  "user": "your-username",
  "order": ["file1.js", "file2.js", "file3.js"],
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0"
}
-->

2. Replace "your-username" and file names
3. Post as a PR comment
4. Refresh the page
```

---

## Performance Issues

### Symptoms
- Extension is slow
- Drag-and-drop is laggy
- Modal takes long to open
- Page freezes

### Diagnosis Steps

1. **Check PR size**
   ```
   How many files in the PR?
   < 50 files: Should be instant
   50-100 files: May take 1-2 seconds
   100+ files: May take 2-5 seconds
   200+ files: May be slow
   ```

2. **Check system resources**
   ```
   Open Chrome Task Manager (Shift+Esc)
   Check CPU and memory usage
   ```

3. **Check for other extensions**
   ```
   Disable all other extensions
   Test performance again
   ```

### Solutions

**Solution 1: Use presets for large PRs**
```
Instead of drag-and-drop:
1. Use "Quick Sort Presets"
2. Much faster for 100+ files
3. Can still fine-tune after
```

**Solution 2: Close other tabs**
```
Chrome performance improves with fewer tabs
Close unnecessary tabs
Restart Chrome if needed
```

**Solution 3: Disable other extensions**
```
1. Go to chrome://extensions
2. Disable extensions you're not using
3. Especially other GitHub extensions
4. Test performance
```

**Solution 4: Use Chrome's performance profiler**
```
1. F12 → Performance tab
2. Click Record
3. Open reorder modal
4. Stop recording
5. Look for slow operations
6. Report findings on GitHub Issues
```

---

## Consensus Problems

### Symptoms
- Consensus order doesn't make sense
- Your order isn't reflected in consensus
- Consensus changes unexpectedly

### Understanding Consensus

The consensus algorithm:
1. Averages all file positions across all orders
2. Uses Borda count voting for ties
3. Gives all orders equal weight
4. Updates automatically when orders change

### Common Scenarios

**Scenario 1: "My order is ignored"**
- Your order is included, but outvoted by others
- Consensus is democratic, not dictatorial
- Create a compelling order to influence consensus

**Scenario 2: "Consensus is alphabetical"**
- If only one person creates an order (or none), it defaults to alphabetical
- Encourage team members to create their orders

**Scenario 3: "Consensus changed after I saved"**
- Someone else created/updated their order
- Consensus recalculates automatically
- This is expected behavior

### Solutions

**Solution 1: View all orders to understand**
```
1. Click "View All Orders"
2. See what everyone chose
3. Understand why consensus is what it is
4. Adjust your order if needed
```

**Solution 2: Discuss with team**
```
1. Add a PR comment explaining your ordering rationale
2. Ask others to review their orders
3. Reach team consensus manually
```

**Solution 3: Verify order was saved**
```
1. Check "View All Orders" for your name
2. If missing, your order didn't save
3. Try saving again
```

---

## UI/UX Issues

### Modal Won't Close

**Solutions:**
1. Press `Esc` key
2. Click outside the modal
3. Click X button
4. Refresh page if stuck
5. Report if persistent

### Drag-and-Drop Not Working

**Solutions:**
1. Check if you're clicking and holding
2. Try a different mouse/trackpad
3. Disable browser extensions that might interfere
4. Use keyboard navigation (coming soon)

### Buttons Are Disabled

**Check:**
- Are you online?
- Do you have write permissions?
- Is the PR locked?
- Any error messages?

### Visual Glitches

**Solutions:**
1. Refresh page
2. Clear browser cache
3. Try different zoom level
4. Disable dark mode extensions
5. Report with screenshot

---

## Browser Console Errors

### How to Access Console

```
Windows/Linux: Press F12 or Ctrl+Shift+I
Mac: Press Cmd+Opt+I
Then click "Console" tab
```

### Common Errors

**Error: "Container not found"**
```
Meaning: Extension can't find GitHub's file container
Solution:
1. Refresh the page
2. Wait for files to load
3. Report if persistent
```

**Error: "Failed to post comment"**
```
Meaning: Couldn't save order to GitHub
Possible causes:
- No write permissions
- Network issue
- Rate limiting

Solution:
1. Check permissions
2. Check internet
3. Wait 5 seconds and retry
```

**Error: "Parser failed"**
```
Meaning: Extension can't parse file information
Solution:
1. GitHub may have changed their DOM
2. Report the error on GitHub Issues
3. Include your GitHub URL structure
```

### Reporting Console Errors

When reporting errors, include:
1. Full error message
2. Error stack trace (if available)
3. URL of the PR where it occurred
4. Steps to reproduce
5. Browser version (chrome://settings/help)

**Example error report:**
```
Error: Container not found
URL: https://github.com/owner/repo/pull/123
Steps:
1. Opened PR
2. Clicked "Reorder Files"
3. Got error

Browser: Chrome 120.0.6099.129
Extension version: 0.1.0
```

---

## Getting More Help

### Before Reporting an Issue

1. **Search existing issues**
   - Check if someone else reported it
   - Look at closed issues too

2. **Try in incognito mode**
   - Rules out extension conflicts
   - Rules out cache issues

3. **Try on a different PR**
   - Might be PR-specific

4. **Check your Chrome version**
   - Minimum: Chrome 120
   - Update if older

### Reporting a Bug

Create an issue on GitHub with:

**Title**: Brief description (e.g., "Reorder button doesn't appear on PR pages")

**Description**:
```markdown
## Bug Description
[Clear description of what's wrong]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [Expected vs actual result]

## Environment
- Browser: Chrome 120.0.6099.129
- OS: macOS 14.2
- Extension version: 0.1.0
- PR URL: https://github.com/owner/repo/pull/123

## Console Errors
[Paste any console errors]

## Screenshots
[If applicable]

## Additional Context
[Anything else relevant]
```

### Getting Community Help

- **GitHub Discussions**: Ask questions, share tips
- **Issues**: Report bugs, request features
- **Email**: [your-email] for security issues

---

## Debug Mode (for Advanced Users)

Enable debug logging:

```javascript
// In browser console:
localStorage.setItem('pr-reorder-debug', 'true');
location.reload();

// Check console for detailed logs
// Look for [PR-Reorder] prefix

// Disable debug mode:
localStorage.removeItem('pr-reorder-debug');
```

## Diagnostic Commands

Run these in browser console (F12) for diagnostics:

```javascript
// Check if extension is loaded
console.log(window.prifyExtensionLoaded ? 'Loaded' : 'Not loaded');

// Get extension version
console.log(chrome.runtime.getManifest().version);

// Check stored orders
chrome.storage.local.get(null, (items) => console.log(items));

// Clear all extension data
chrome.storage.local.clear(() => console.log('Cleared'));

// Get parser statistics
// (Available in debug mode)
console.log(window.prifyParserStats);
```

---

**Still stuck?** [Open an issue](https://github.com/your-repo/issues) with details and we'll help!
