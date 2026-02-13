# Frequently Asked Questions (FAQ)

## General Questions

### What is PR File Reorder?

PR File Reorder is a Chrome extension that lets you customize the order of files in GitHub Pull Requests. Instead of viewing files alphabetically, you and your team can collaboratively decide on the best review order.

### Why would I want to reorder files?

GitHub's default alphabetical ordering often obscures the logical flow of changes. Reordering helps:
- **Tell a story**: Put README first, introduce context before implementation
- **Guide reviewers**: Highlight critical files, group related changes
- **Save time**: Reduce cognitive load, make reviews more efficient
- **Collaborate**: Team consensus ensures everyone reviews in an optimal order

### How much does it cost?

**Free!** PR File Reorder is completely free and open source.

### Do I need to create an account?

No. The extension uses your existing GitHub account. No additional registration needed.

---

## Installation & Setup

### Which browsers are supported?

Currently, only **Google Chrome** and **Chromium-based browsers** (Edge, Brave, etc.) are supported.

### Does this work on Firefox/Safari?

Not yet. We're focusing on Chrome first, but Firefox support may come in the future.

### How do I install the extension?

See the [Installation section](USER_GUIDE.md#installation) in the User Guide.

### Can I use this on GitHub Enterprise?

Yes! The extension works on:
- ✅ GitHub.com
- ✅ GitHub Enterprise Cloud
- ✅ GitHub Enterprise Server (browser-accessible instances)

### Why does the extension need permissions?

The extension needs minimal permissions:
- **GitHub access**: To read PR files and save orders as comments
- **Storage**: To cache data and save your preferences

See [Privacy & Permissions](USER_GUIDE.md#privacy--permissions) for details.

---

## Using the Extension

### How do I reorder files?

1. Open any GitHub Pull Request
2. Click the "Reorder Files" button
3. Drag and drop files to reorder them
4. Click "Save & Apply"

See the [Quick Start guide](USER_GUIDE.md#quick-start) for details.

### Can I reorder files without saving?

Yes! You can drag files around to visualize different orders. The order only persists when you click "Save & Apply".

### What are "Quick Sort Presets"?

Presets are one-click sorting options:
- Alphabetical, Reverse Alphabetical
- By file extension
- README first, tests last
- New files first
- Most changed first

See [Quick Sort Presets](USER_GUIDE.md#quick-sort-presets) for details.

### How do I undo a reorder?

Currently, you can:
1. Click "Cancel" before saving to discard changes
2. Create a new order to replace the old one
3. Click "View All Orders" and apply a different order

**Coming soon**: Full undo/redo with Ctrl+Z support.

### Can I see how other people ordered the files?

Yes! Click "View All Orders" to see:
- Everyone's individual orders
- The consensus order
- Visual diffs between orders

### What is "consensus order"?

When multiple team members create orders, the extension calculates a democratic consensus using a **Borda count voting algorithm**. Each file's position is averaged across all orders, with ties broken fairly.

### Do I need write permissions on the PR?

**For full functionality, yes.** To save orders as PR comments, you need write access.

**Fallback**: If you don't have write access, orders are saved locally and won't be shared with the team.

### How are orders stored?

Orders are saved as **hidden PR comments**. They look like this:

```html
<!-- file-order-data
{
  "user": "yourname",
  "order": ["file1.js", "file2.js", ...],
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0"
}
-->
```

These comments are hidden from normal GitHub view but visible to the extension.

---

## Troubleshooting

### The extension isn't working. What should I do?

1. **Refresh the page** (Cmd/Ctrl + R)
2. **Check you're on a PR page** (URL contains `/pull/`)
3. **Verify extension is enabled** (chrome://extensions)
4. **Check browser console** for errors (F12 → Console tab)
5. **Report the issue** on GitHub if it persists

### The "Reorder Files" button doesn't appear

**Common causes:**
- Page hasn't fully loaded
- Not on a PR files tab
- Extension is disabled
- Conflicting extension

**Solutions:**
- Wait a few seconds for page to load
- Navigate to the "Files changed" tab
- Check chrome://extensions
- Disable other GitHub extensions temporarily

### Files won't reorder after I click "Save & Apply"

**Try:**
1. Refresh the page
2. Check browser console for errors
3. Try reordering again
4. Report as a bug

### I can't drag files

**Possible causes:**
- Another extension is interfering
- Browser accessibility settings
- Mouse/trackpad issue

**Solutions:**
- Disable other extensions
- Try on a different computer/browser
- Use keyboard navigation (coming soon)

### The consensus order seems weird

Remember: consensus is democratic, not perfect. It averages everyone's preferences.

**To influence consensus:**
- Create or update your own order
- Encourage team members to create orders
- View all orders to understand different perspectives

### The extension is slow

**For large PRs (100+ files):**
- Initial load may take 2-3 seconds
- This is normal

**If it's very slow:**
- Close other browser tabs
- Disable other Chrome extensions
- Check CPU/memory usage
- Report performance issues

### My order disappeared

**Check:**
1. Did you click "Save & Apply"? (orders aren't saved otherwise)
2. Was the PR updated with new commits?
3. Do you have write permissions?

**If you saved and it's gone:**
- Check GitHub comments for the hidden order data
- Report as a bug

---

## Privacy & Security

### Does the extension collect my data?

**No.** The extension collects zero data. No analytics, no tracking, no telemetry.

### Where is my data stored?

- **Locally**: Browser storage (preferences, cache)
- **GitHub**: PR comments (your orders)
- **Nowhere else**: No external servers

### Can others see my orders?

Yes. Orders are collaborative by design. Anyone who can see the PR can see all orders (including yours).

### Is this secure?

Yes. The extension:
- ✅ Uses strict Content Security Policy (CSP)
- ✅ Sanitizes all user input (XSS prevention)
- ✅ No external API calls
- ✅ Open source (auditable)
- ✅ Follows Chrome extension security best practices

### Can I delete my order?

Yes. Your order is stored as a PR comment. You can delete it like any other comment:
1. Find the comment (look for `<!-- file-order-data`)
2. Delete it
3. The consensus will update automatically

---

## Collaboration

### How many people can reorder files?

Unlimited! Everyone with PR access can create an order.

### What happens if we disagree on ordering?

The consensus algorithm finds a middle ground. It's democratic, so:
- No single person's order dominates
- Everyone's opinion is weighted equally
- The result represents the team's collective preference

### Can I force my order on others?

No. The consensus is democratic. You can only influence it by creating your own order.

### Should our team agree on a standard order?

It's up to you! Some teams prefer:
- **Flexible**: Let consensus emerge naturally
- **Structured**: Agree on conventions (README first, etc.)

Both approaches work. Document your preference in CONTRIBUTING.md.

### What if someone creates a bad order?

You can:
1. Create your own order to influence consensus
2. Comment on the PR to discuss
3. Ask them to update their order
4. The consensus will balance everyone's input

---

## Technical Questions

### How does the consensus algorithm work?

The extension uses **Borda count voting**:
1. Each file gets points based on its position in each order
2. Points are averaged across all orders
3. Files are sorted by average points
4. Ties are broken using the Borda count method

**Example:**
```
Alice: [A, B, C]  → A:3pts, B:2pts, C:1pt
Bob:   [B, A, C]  → B:3pts, A:2pts, C:1pt

Average: A:2.5pts, B:2.5pts, C:1pt
Borda tiebreak: B wins (higher Borda score)

Result: [B, A, C]
```

### Does this work with GitHub's file tree?

Yes. The extension works alongside GitHub's file tree. It doesn't replace it.

### What happens if GitHub changes their UI?

The extension uses **6 fallback selectors** to handle DOM changes. If GitHub breaks something:
1. The extension attempts to adapt automatically
2. An update will be released if needed
3. You can report compatibility issues

### Can I use this with other GitHub extensions?

Usually yes, but some extensions may conflict. Known compatible extensions:
- ✅ Refined GitHub
- ✅ GitHub Dark Theme
- ✅ Octotree

If you experience conflicts, try disabling other extensions temporarily.

### Does this work offline?

Partially. You can:
- ✅ View previously cached orders
- ✅ Reorder files (but not save to GitHub)
- ❌ Load new orders from GitHub
- ❌ See consensus updates

### What's the maximum number of files supported?

Tested with PRs containing:
- ✅ 1-50 files: Excellent performance
- ✅ 50-100 files: Good performance
- ✅ 100-200 files: Acceptable performance
- ⚠️ 200+ files: May be slow (but still works)

### Can I use this via API?

No. This is a browser extension, not an API service. However, orders are stored as GitHub comments, so you could read them via GitHub's API.

---

## Contributing & Development

### Is this open source?

Yes! PR File Reorder is open source under the MIT license.

### Can I contribute?

Absolutely! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### I found a bug. What should I do?

Report it on [GitHub Issues](https://github.com/your-repo/issues) with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser console errors (if any)

### I have a feature idea

Great! Open a [GitHub Discussion](https://github.com/your-repo/discussions) or create a feature request issue.

### How can I help?

Ways to contribute:
- 🐛 Report bugs
- ✨ Suggest features
- 📝 Improve documentation
- 🧪 Test the extension
- 💻 Submit code contributions
- ⭐ Star the project on GitHub
- 📢 Share with your team

---

## Roadmap & Future Features

### What features are coming next?

**Phase 1.5 (In Progress):**
- Undo/Redo with Ctrl+Z
- Comprehensive keyboard shortcuts
- Export/Import orders

**Phase 2 (Planned):**
- Smart sorting algorithms:
  - Dependency-based ordering
  - Change magnitude sorting
  - Logical file grouping
- Settings page for customization

**Phase 3 (Future):**
- ML-based order suggestions
- Pattern learning from usage

See the full [roadmap](ROADMAP.md) for details.

### Will there be a Firefox version?

Possibly in the future, but Chrome is the priority for now.

### Will there be a mobile version?

No. Mobile browsers don't support Chrome extensions. However, orders saved by desktop users will apply to mobile GitHub view (though you can't create/edit them on mobile).

---

## Still Have Questions?

- 📖 Read the [User Guide](USER_GUIDE.md)
- 🐛 Report issues on [GitHub](https://github.com/your-repo/issues)
- 💬 Join discussions on [GitHub Discussions](https://github.com/your-repo/discussions)
- 📧 Contact: [your-email@example.com]

**Happy reviewing!** 🎉
