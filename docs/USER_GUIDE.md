# PR File Reorder - User Guide

Welcome to PR File Reorder! This guide will help you get the most out of this Chrome extension for collaborative file ordering in GitHub Pull Requests.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
  - [Manual Reordering](#manual-reordering)
  - [Collaborative Consensus](#collaborative-consensus)
  - [Quick Sort Presets](#quick-sort-presets)
  - [View All Orders](#view-all-orders)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Privacy & Permissions](#privacy--permissions)

---

## Installation

### From Chrome Web Store

1. Visit the [PR File Reorder page](chrome-web-store-link-here) on the Chrome Web Store
2. Click **Add to Chrome**
3. Click **Add extension** in the confirmation dialog
4. The extension icon will appear in your Chrome toolbar

### For Development

See the [README.md](../README.md) for development installation instructions.

---

## Quick Start

### Your First Reorder

1. **Navigate to a GitHub Pull Request**
   - Open any PR on GitHub.com or GitHub Enterprise Cloud
   - You'll see a new "Reorder Files" button near the top of the files list

2. **Click "Reorder Files"**
   - A modal window will appear showing all files in the PR
   - Files are initially shown in their current order (usually alphabetical)

3. **Drag and drop files**
   - Click and drag any file to reorder it
   - Drop it in the new position
   - The changes are shown immediately

4. **Save your order**
   - Click "Save & Apply" to apply your order
   - The PR files will reorder instantly
   - Your order is saved as a comment on the PR (hidden from normal view)

**That's it!** Your order is now live and other team members can see it.

---

## Features

### Manual Reordering

Drag and drop files to create a custom review order.

**How it works:**
- Click and hold on any file
- Drag it to the desired position
- Release to drop
- Visual feedback shows where the file will land

**Tips:**
- Reorder files to tell a story (README first, tests last, etc.)
- Group related files together (components with their tests)
- Put critical changes at the top

### Collaborative Consensus

Multiple team members can create their own orders, and the extension automatically calculates a consensus.

**How it works:**
1. Each person creates their own order by clicking "Reorder Files"
2. Orders are saved as hidden comments on the PR
3. The extension uses a **democratic voting algorithm** (Borda count) to calculate consensus
4. The consensus order is applied automatically for all viewers

**What is consensus?**
- The extension looks at all saved orders
- Each file's position is averaged across all orders
- Ties are broken using a fair voting system
- The result represents what most reviewers want

**Example:**
```
Alice's order:  [README.md, app.js, test.js]
Bob's order:    [app.js, README.md, test.js]
Carol's order:  [README.md, app.js, test.js]

Consensus:      [README.md, app.js, test.js]
(README appears first in 2/3 orders, so it wins)
```

### Quick Sort Presets

Apply common sorting patterns with one click.

**Available Presets:**

1. **Alphabetical (A-Z)**
   - Standard alphabetical order
   - Good for finding specific files quickly

2. **Reverse Alphabetical (Z-A)**
   - Reverse alphabetical order
   - Occasionally useful for specific workflows

3. **By Extension**
   - Groups files by type (.js, .css, .md, etc.)
   - Good for reviewing related file types together

4. **README First, Tests Last**
   - Documentation first, tests at the end
   - Great for initial PR review

5. **New Files First**
   - Recently added or renamed files appear first
   - Helps focus on new additions

6. **Most Changed First**
   - Files with most additions/deletions first
   - Focuses attention on biggest changes

**How to use presets:**
1. Open the reorder modal
2. Click the "Sort by" dropdown
3. Select a preset
4. The files reorder instantly
5. You can further customize by dragging files
6. Click "Save & Apply" when done

### View All Orders

See how everyone ordered the files and compare different approaches.

**How to access:**
1. Click "View All Orders" button (appears when multiple orders exist)
2. A modal shows:
   - **Consensus Order** (marked with a badge)
   - Each team member's individual order
   - Who created each order and when

**Features:**
- **Apply Any Order**: Click "Apply" next to any order to use it
- **Visual Diff**: See how orders differ from each other
- **Order Comparison**: Compare your order with others

---

## Keyboard Shortcuts

### Modal Controls

| Shortcut | Action |
|----------|--------|
| `Esc` | Close modal |

**Note:** More keyboard shortcuts coming soon (undo/redo, navigation, etc.)

---

## Best Practices

### For Individual Reviewers

1. **Start with README**
   - Put documentation and README files first
   - Helps reviewers understand context

2. **Group Related Files**
   - Keep components near their tests
   - Group files by feature/module

3. **Prioritize Critical Changes**
   - Put important files first
   - Complex logic before simple changes

4. **Consider Review Flow**
   - Think about the story you're telling
   - Make it easy to understand changes

### For Teams

1. **Discuss Ordering Strategy**
   - Agree on team conventions
   - Document preferences in CONTRIBUTING.md

2. **Review Consensus Regularly**
   - Check if consensus makes sense
   - Adjust your order if needed

3. **Communicate Context**
   - Use PR descriptions to explain ordering choices
   - Mention critical files in comments

4. **Respect Diverse Preferences**
   - Consensus accommodates everyone
   - Don't force a single "correct" order

### For PR Authors

1. **Set Initial Order**
   - Create an order that aids review
   - Guide reviewers through your changes

2. **Explain Your Ordering**
   - Add a comment explaining the order
   - Highlight key files

3. **Update as Needed**
   - Reorder when adding commits
   - Keep it relevant as PR evolves

---

## Troubleshooting

### The "Reorder Files" button doesn't appear

**Possible causes:**
- Not on a GitHub PR page
- Page hasn't fully loaded yet
- Extension is disabled

**Solutions:**
1. Refresh the page (Cmd/Ctrl + R)
2. Check that you're on a PR files page (URL should contain `/pull/`)
3. Check chrome://extensions and ensure PR File Reorder is enabled
4. Try reloading the extension (toggle off/on)

### Files don't reorder after saving

**Possible causes:**
- Browser cache issue
- GitHub's dynamic loading interfered

**Solutions:**
1. Refresh the page
2. Try reordering again
3. Check browser console for errors (F12)
4. Report the issue on GitHub

### My order isn't being saved

**Possible causes:**
- No write permissions on the PR
- Network connectivity issue
- Browser blocking the save

**Solutions:**
1. Check that you can comment on the PR normally
2. Check your internet connection
3. Look for error notifications from the extension
4. The extension falls back to local storage if needed

### Consensus order seems wrong

**How consensus works:**
- The extension averages all positions
- Uses Borda count voting for ties
- All orders have equal weight

**If it still seems wrong:**
1. View all orders to see what others chose
2. Create or update your own order
3. The consensus will update automatically
4. Remember: consensus is democratic, not perfect

### Extension is slow on large PRs

**For PRs with 100+ files:**
- Initial load may take a few seconds
- Drag and drop should still be smooth
- Consider using presets for faster sorting

**If performance is poor:**
1. Close other browser tabs
2. Disable other Chrome extensions temporarily
3. Report performance issues on GitHub

### I can't see other people's orders

**Check:**
1. Are you on the same PR?
2. Has anyone else created an order?
3. Try refreshing the page
4. Click "View All Orders" to see details

### The modal is stuck or won't close

**Solutions:**
1. Press `Esc` key
2. Click outside the modal
3. Refresh the page
4. Report as a bug if it persists

---

## Privacy & Permissions

### What data does the extension access?

The extension requires minimal permissions:

1. **GitHub Page Access** (`github.com/*`)
   - Read file information from PRs
   - Detect PR pages
   - Read existing order comments

2. **Storage Permission**
   - Save your preferences (last used preset, etc.)
   - Cache orders locally for performance
   - Fallback storage when offline

### What data is stored?

**Locally (on your device):**
- Your last used preset
- Cached file orders for performance
- Extension settings

**On GitHub (as PR comments):**
- Your file order choices
- Timestamp of when you created the order
- Your GitHub username (automatically included by GitHub)

### What data is NOT collected?

- ❌ No personal information
- ❌ No browsing history
- ❌ No data sent to external servers
- ❌ No analytics or tracking
- ❌ No telemetry

### Is my data shared?

**No.** The extension operates entirely between your browser and GitHub:
- All data stays in your browser or on GitHub
- No third-party servers involved
- No external APIs called
- Zero-infrastructure design

### Can I delete my data?

**Yes:**

1. **Local data**: Clear Chrome extension data
   - Go to `chrome://settings/clearBrowserData`
   - Select "Cookies and other site data"
   - Clear data

2. **GitHub data**: Delete your order comment
   - Your orders are saved as hidden PR comments
   - You can delete them like any other comment
   - Look for comments containing `<!-- file-order-data`

### Can others see my orders?

**Yes, by design:**
- File orders are collaborative
- All team members can see all orders
- This enables the consensus feature
- Orders are public to PR participants only (same as comments)

### Can I use the extension privately?

**Sort of:**
- If you don't click "Save & Apply", your order stays local
- You can use presets and manual sorting without saving
- The consensus feature requires saving to GitHub

---

## FAQ

### How is this different from GitHub's file tree?

GitHub's file tree shows files in alphabetical order. PR File Reorder lets you:
- Create custom orderings
- Collaborate on file order
- Apply smart sorting presets
- Guide reviewers through your changes

### Does this work on GitHub Enterprise?

Yes! The extension works on:
- GitHub.com
- GitHub Enterprise Cloud
- GitHub Enterprise Server (if accessible via browser)

### Will this slow down my PR reviews?

No. The extension is designed for performance:
- Loads in <100ms
- Doesn't block page rendering
- Works with GitHub's lazy loading
- Caches data locally

### Can I use this on mobile?

No. This is a Chrome browser extension. Mobile browsers don't support Chrome extensions.

### Is this officially supported by GitHub?

No. This is a third-party extension created by the community. It works alongside GitHub's features but is not affiliated with GitHub.

### What happens if GitHub changes their UI?

The extension uses multiple fallback selectors to handle GitHub DOM changes. If GitHub makes breaking changes:
1. The extension will attempt to adapt
2. You may see a warning or error
3. Updates will be released to fix compatibility
4. Report issues on the GitHub repository

### Can I contribute to the project?

Yes! PR File Reorder is open source. See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

### Where can I report bugs or request features?

Report issues and requests on the [GitHub Issues page](https://github.com/your-repo/issues).

---

## Getting Help

- **Documentation**: See [README.md](../README.md) for technical details
- **Issues**: Report bugs at [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: Join the conversation at [GitHub Discussions](https://github.com/your-repo/discussions)

---

## What's Next?

Upcoming features:
- ✨ Keyboard shortcuts (Ctrl+Z undo, arrow key navigation)
- ✨ Undo/Redo functionality
- ✨ Export/Import orders
- ✨ Smart sorting algorithms (dependency-based, change magnitude)
- ✨ File annotations

See our [roadmap](../docs/ROADMAP.md) for more details.

---

**Enjoy using PR File Reorder!** If you find it useful, please ⭐ star us on GitHub and share with your team.
