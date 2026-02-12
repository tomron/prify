# Claude Context: PR File Reorder Extension

## Project Overview

**Name**: PR File Reorder Chrome Extension  
**Goal**: Collaborative file ordering in GitHub Pull Requests to improve code review efficiency  
**Architecture**: Client-side Chrome extension with zero backend (uses GitHub comments for storage)  
**Tech Stack**: Vanilla JavaScript, Manifest V3, Playwright, Jest

## Core Principles

1. **Pure democracy** - All reviewers have equal say in file ordering
2. **Never locked** - Orders can always be updated
3. **Public by default** - All orders visible to all team members
4. **Zero infrastructure** - No backend servers, APIs, or databases
5. **Test-driven** - Write tests first, code second
6. **Git discipline** - Every feature/bug gets its own worktree and branch

## Project Context

This extension solves a real DevEx problem: GitHub's alphabetical file ordering obscures logical review flow. By allowing collaborative reordering with democratic consensus, teams can review code more efficiently.

The user (Tom) is head of AI transportation and DevEx, has a Rugby Sevens background, and values both technical rigor and pragmatic shipping. He wants to start simple and iterate based on real usage.

## Development Workflow

### Before Starting Any Task

1. **Read the task details** in `tasks.md`
2. **Create git worktree**:
   ```bash
   git worktree add ../pr-file-reorder-<task-id> -b feature/<task-id>-<description>
   cd ../pr-file-reorder-<task-id>
   ```
3. **Review Definition of Done** - know what success looks like
4. **Write tests first** - TDD approach

### During Development

1. **Lint on every change**: `npm run lint` - Fix all errors before committing
2. **Test frequently**: `npm test` or `npm run test:watch`
3. **Use relevant tools**:
   - ESLint for code quality (must pass on every commit)
   - Playwright for E2E tests
   - Chrome DevTools for debugging
   - Jest for unit tests
4. **Keep commits atomic** - one logical change per commit
5. **Write descriptive commit messages**

**IMPORTANT**: Always run `npm run lint` before committing. All lint errors must be fixed. Zero tolerance for lint failures.

### Before Creating PR

1. **CRITICAL: No lint errors**: `npm run lint` - Must pass with zero errors
2. **All tests pass**: `npm test`
3. **Build succeeds**: `npm run build`
4. **Manual testing done**: Load extension, test on real GitHub PR
5. **Documentation updated**: Code comments, README if needed

**Pre-commit Checklist**:
```bash
npm run lint    # Must exit with code 0
npm test        # Must show all tests passing
npm run build   # Must complete without errors
```

If any of these fail, **DO NOT COMMIT**. Fix all issues first.

### After PR Merged

```bash
cd ../pr-file-reorder
git worktree remove ../pr-file-reorder-<task-id>
git branch -d feature/<task-id>-<description>
```

## File Structure

```
pr-file-reorder/
├── manifest.json              # Extension manifest (Manifest V3)
├── content/
│   ├── content.js            # Main content script entry point
│   ├── dom-manipulator.js    # DOM reordering logic
│   ├── github-api.js         # GitHub comment reading/writing
│   └── consensus.js          # Consensus calculation algorithms
├── ui/
│   ├── reorder-modal.js      # Drag-and-drop interface
│   ├── order-viewer.js       # View all orders modal
│   └── styles.css            # Extension styles
├── utils/
│   ├── storage.js            # Storage abstraction (localStorage + GitHub)
│   ├── parser.js             # GitHub DOM parser
│   └── logger.js             # Debugging utilities
├── algorithms/               # Phase 2: Smart sorting
│   ├── dependency.js         # Parse imports, topological sort
│   ├── change-size.js        # Sort by diff size
│   └── grouping.js           # Logical file grouping
├── tests/
│   ├── unit/                 # Jest unit tests
│   │   ├── parser.test.js
│   │   ├── consensus.test.js
│   │   └── ...
│   └── e2e/                  # Playwright E2E tests
│       ├── reorder.spec.js
│       ├── drag-drop.spec.js
│       └── integration.spec.js
├── docs/
│   ├── PRD.md               # Product requirements
│   ├── tasks.md             # Task breakdown
│   └── CLAUDE.md            # This file
└── package.json
```

## Key Technical Decisions

### Why No Backend?

**Rationale**: Reduces infrastructure complexity, deployment overhead, and costs. GitHub comments provide free, durable storage with built-in auth and permissions.

**Trade-offs**: 
- ✅ Zero hosting costs
- ✅ No auth implementation needed
- ✅ Works with GitHub's permission model
- ❌ Comments are append-only (can't edit)
- ❌ Slight increase in comment count

### Why Vanilla JavaScript?

**Rationale**: No build step complexity, faster load times, smaller bundle size.

**Trade-offs**:
- ✅ Simple deployment
- ✅ Fast performance
- ✅ Easy debugging
- ❌ More verbose code
- ❌ No type safety (consider JSDoc)

### Why Manifest V3?

**Rationale**: Chrome's current standard, required for Chrome Web Store.

**Trade-offs**:
- ✅ Future-proof
- ✅ Better security model
- ❌ More restrictive APIs
- ❌ Service workers instead of background pages

## Testing Strategy

### Unit Tests (Jest)

**What to test**:
- Pure functions (parsers, algorithms, calculations)
- Utility functions
- Edge cases and error handling

**Example**:
```javascript
// tests/unit/consensus.test.js
describe('calculateConsensus', () => {
  it('returns single order unchanged', () => {
    const orders = [{ order: ['a.js', 'b.js'] }];
    expect(calculateConsensus(orders)).toEqual(['a.js', 'b.js']);
  });
  
  it('averages positions for multiple orders', () => {
    const orders = [
      { order: ['a.js', 'b.js', 'c.js'] },
      { order: ['b.js', 'a.js', 'c.js'] }
    ];
    const result = calculateConsensus(orders);
    expect(result[0]).toBe('a.js'); // or 'b.js' depending on tie-breaking
  });
});
```

### Integration Tests (Jest + JSDOM)

**What to test**:
- Component interactions
- Storage layer with mocked chrome.storage
- DOM manipulation with JSDOM

**Example**:
```javascript
// tests/integration/storage.test.js
describe('Storage integration', () => {
  beforeEach(() => {
    global.chrome = {
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn()
        }
      }
    };
  });
  
  it('saves and loads orders', async () => {
    const order = ['a.js', 'b.js'];
    await saveOrder('org/repo/123', order);
    const loaded = await loadOrder('org/repo/123');
    expect(loaded).toEqual(order);
  });
});
```

### E2E Tests (Playwright)

**What to test**:
- Critical user workflows
- Extension behavior on real GitHub pages
- Visual validation

**Example**:
```javascript
// tests/e2e/reorder.spec.js
const { test, expect } = require('@playwright/test');

test('user can reorder files', async ({ page, context }) => {
  // Load extension
  const extensionPath = require('path').join(__dirname, '../../');
  await context.addInitScript({ path: extensionPath });
  
  // Navigate to test PR
  await page.goto('https://github.com/test/repo/pull/123');
  
  // Click reorder button
  await page.click('button:has-text("Reorder")');
  
  // Drag file
  await page.dragAndDrop('#file-a', '#file-b');
  
  // Save
  await page.click('button:has-text("Save")');
  
  // Verify order
  const files = await page.$$eval('.file', els => els.map(e => e.dataset.path));
  expect(files[0]).toBe('b.js');
  expect(files[1]).toBe('a.js');
});
```

### Manual Testing Checklist

Before each PR:
- [ ] Load extension in Chrome (chrome://extensions → Load unpacked)
- [ ] Navigate to real GitHub PR
- [ ] Test reorder flow end-to-end
- [ ] Test on GitHub Enterprise Cloud (if available)
- [ ] Test with large PR (50+ files)
- [ ] Test error cases (network disabled, no write permissions)
- [ ] Check console for errors
- [ ] Verify no memory leaks (DevTools Memory profiler)

## Common Patterns

### GitHub DOM Selectors

```javascript
// File list container
const fileContainer = document.querySelector('.files');

// Individual file elements
const files = document.querySelectorAll('.file');

// File path
const filePath = file.querySelector('.file-info a').textContent;

// Diff stats
const additions = parseInt(file.dataset.additions || '0');
const deletions = parseInt(file.dataset.deletions || '0');

// Comment form
const commentField = document.querySelector('#new_comment_field');
const submitButton = document.querySelector('.js-comment-button');
```

### Storage Pattern

```javascript
// Save order
async function saveOrder(prId, order) {
  const key = `pr-order:${prId}`;
  await chrome.storage.local.set({ [key]: {
    order,
    timestamp: new Date().toISOString()
  }});
}

// Load order
async function loadOrder(prId) {
  const key = `pr-order:${prId}`;
  const result = await chrome.storage.local.get(key);
  return result[key]?.order || null;
}
```

### GitHub Comment Format

```javascript
// Post order comment
async function postOrderComment(order) {
  const data = {
    user: getCurrentUser(),
    order: order,
    timestamp: new Date().toISOString(),
    version: "1.0"
  };
  
  const comment = `<!-- file-order-data\n${JSON.stringify(data, null, 2)}\n-->`;
  
  // Use GitHub's comment form to post
  const field = document.querySelector('#new_comment_field');
  field.value = comment;
  document.querySelector('.js-comment-button').click();
}

// Extract orders from comments
function extractOrdersFromComments() {
  const comments = document.querySelectorAll('.comment-body');
  const orders = [];
  
  comments.forEach(comment => {
    const match = comment.innerHTML.match(/<!-- file-order-data\n([\s\S]*?)\n-->/);
    if (match) {
      try {
        orders.push(JSON.parse(match[1]));
      } catch (e) {
        console.error('Failed to parse order:', e);
      }
    }
  });
  
  return orders;
}
```

## Error Handling Patterns

```javascript
// Graceful degradation
async function applyOrder(order) {
  try {
    reorderFiles(order);
  } catch (error) {
    console.error('Failed to reorder files:', error);
    showNotification('Failed to reorder files. Please refresh and try again.', 'error');
    // Revert to original order
    location.reload();
  }
}

// Network failure handling
async function postOrderComment(order) {
  try {
    await postComment(order);
  } catch (error) {
    if (error.message.includes('network')) {
      console.warn('Network error, saving locally only');
      await saveOrderLocally(order);
      showNotification('Saved locally. Will sync when online.', 'warning');
    } else {
      throw error;
    }
  }
}

// Permission handling
async function postComment(content) {
  if (!hasWritePermission()) {
    console.warn('No write permission, using localStorage only');
    await saveOrderLocally(content);
    showNotification('Saved locally. Share via export button.', 'info');
    return;
  }
  
  // Proceed with posting
}
```

## Debugging Tips

### Extension Debugging

```javascript
// Add debug logging
const DEBUG = true;

function log(...args) {
  if (DEBUG) console.log('[PR-Reorder]', ...args);
}

// Use in code
log('Reordering files:', order);
log('Consensus calculated:', consensus);
```

### Chrome DevTools

1. **Inspect extension**: Right-click extension icon → Inspect popup
2. **Console in content script**: Open DevTools on GitHub page
3. **Network tab**: Monitor GitHub API calls
4. **Performance tab**: Profile reordering performance
5. **Memory tab**: Check for memory leaks

### Playwright Debugging

```bash
# Run with headed browser
npx playwright test --headed

# Run with debug mode
npx playwright test --debug

# Run single test
npx playwright test tests/e2e/reorder.spec.js

# Show trace viewer
npx playwright show-trace trace.zip
```

## Performance Considerations

### DOM Manipulation

```javascript
// ❌ Bad: Multiple reflows
files.forEach(file => {
  container.appendChild(file);
});

// ✅ Good: Single reflow
const fragment = document.createDocumentFragment();
files.forEach(file => fragment.appendChild(file));
container.appendChild(fragment);
```

### Consensus Calculation

```javascript
// ❌ Bad: O(n²) for each file
files.forEach(file => {
  orders.forEach(order => {
    // Find position
  });
});

// ✅ Good: O(n) with Map
const positionMap = new Map();
orders.forEach(order => {
  order.files.forEach((file, pos) => {
    if (!positionMap.has(file)) positionMap.set(file, []);
    positionMap.get(file).push(pos);
  });
});
```

### Large PRs (100+ files)

```javascript
// Use IntersectionObserver for lazy rendering
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      renderFile(entry.target);
    }
  });
});

files.forEach(file => observer.observe(file));
```

## Common Pitfalls & Solutions

### Pitfall: GitHub DOM changes break extension

**Solution**: Use flexible selectors, add fallbacks
```javascript
function getFileContainer() {
  return document.querySelector('.files') 
      || document.querySelector('[data-target="diff-container"]')
      || document.querySelector('.js-diff-progressive-container');
}
```

### Pitfall: Race condition with GitHub's dynamic loading

**Solution**: Use MutationObserver
```javascript
const observer = new MutationObserver((mutations) => {
  const newFiles = mutations.flatMap(m => 
    Array.from(m.addedNodes).filter(n => n.classList?.contains('file'))
  );
  if (newFiles.length > 0) {
    handleNewFiles(newFiles);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
```

### Pitfall: Comment posting fails silently

**Solution**: Always check and provide feedback
```javascript
async function postComment(content) {
  const button = document.querySelector('.js-comment-button');
  const initialText = button.textContent;
  
  button.click();
  
  // Wait for comment to appear
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (button.textContent === initialText) {
    throw new Error('Comment failed to post');
  }
}
```

## Linting and Code Quality

### ESLint Must Pass

**Zero tolerance policy**: All code must pass `npm run lint` with zero errors before committing.

```bash
# Check for lint errors
npm run lint

# Auto-fix fixable issues
npm run lint -- --fix
```

**Common ESLint Errors to Avoid**:
- Unused variables (delete them or prefix with `_`)
- Missing semicolons (add them)
- Console statements in production (use conditional logging)
- Undefined variables (import or declare them)
- Inconsistent quotes (use single quotes)
- Trailing whitespace (remove it)

**If ESLint fails**:
1. Read the error message carefully
2. Fix the issue (don't disable the rule)
3. Run `npm run lint` again
4. Repeat until it passes
5. Only then run tests and commit

### Auto-fix Workflow

```bash
# Recommended: Auto-fix before every commit
npm run lint -- --fix
npm run lint  # Verify it passes
npm test      # Run tests
git add .
git commit -m "..."
```

## Code Style Guidelines

### Naming Conventions

- Functions: camelCase (`calculateConsensus`)
- Classes: PascalCase (`OrderViewer`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILES`)
- Private functions: underscore prefix (`_parseOrder`)

### File Organization

```javascript
// imports at top
import { something } from './utils.js';

// constants
const MAX_RETRIES = 3;

// main functions
export function publicFunction() {
  return _privateHelper();
}

// private helpers
function _privateHelper() {
  // ...
}
```

### Comments

```javascript
// ✅ Good: Explain why, not what
// Use weighted average to handle outliers better than median
const avgPosition = positions.reduce((a, b) => a + b) / positions.length;

// ❌ Bad: Obvious comment
// Calculate average position
const avgPosition = positions.reduce((a, b) => a + b) / positions.length;
```

### JSDoc for Public APIs

```javascript
/**
 * Calculate consensus order from multiple user orders
 * @param {Array<{user: string, order: string[]}>} orders - User orders
 * @returns {string[]} Consensus order (weighted average positions)
 * @throws {Error} If orders array is empty
 */
export function calculateConsensus(orders) {
  if (!orders.length) throw new Error('No orders provided');
  // ...
}
```

## Security Considerations

### Content Security Policy

```json
// manifest.json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### Sanitize User Input

```javascript
// ❌ Dangerous: Direct innerHTML
element.innerHTML = userInput;

// ✅ Safe: textContent or DOMPurify
element.textContent = userInput;
```

### GitHub Session Security

```javascript
// Never send GitHub cookies to external domains
// Never log sensitive data
// Always use HTTPS (GitHub enforces this)
```

## Useful Commands

```bash
# Development (IN THIS ORDER)
npm install                 # Install dependencies
npm run lint               # FIRST: Lint code (must pass)
npm test                   # SECOND: Run all tests
npm run test:watch         # Watch mode for development
npm run test:e2e          # E2E tests only
npm run build             # Build extension

# Recommended workflow
npm run lint && npm test && npm run build  # Run all checks

# Git workflow
git worktree list         # List all worktrees
git worktree prune       # Clean up deleted worktrees
git branch -d <branch>   # Delete merged branch
git branch -D <branch>   # Force delete branch

# Chrome extension
chrome://extensions      # Extension management
chrome://inspect        # Inspect service worker

# Debugging
npx playwright test --headed --debug
npx playwright codegen github.com  # Generate test code
```

## Resources

### Documentation
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [Playwright Docs](https://playwright.dev/)
- [Jest Docs](https://jestjs.io/)
- [GitHub REST API](https://docs.github.com/en/rest)

### Example PRs for Testing
- Small PR (5-10 files)
- Medium PR (20-30 files)
- Large PR (50+ files)
- PR with renamed files
- PR with binary files
- PR with submodules

### Browser Testing
- Chrome 120+
- GitHub.com
- GitHub Enterprise Cloud (if available)

## When to Ask for Help

**Ask Tom when**:
- Architectural decisions needed
- Trade-offs between simplicity and features
- Priority conflicts
- User feedback interpretation
- Product direction questions

**Ask team when**:
- GitHub DOM structure questions
- Performance optimization strategies
- Chrome extension best practices
- Testing strategy decisions

## Success Metrics

**Phase 1 MVP**:
- Extension loads without errors
- Can reorder files via drag-and-drop
- Orders persist in GitHub comments
- Consensus applies automatically
- Works on Chrome 120+ and GitHub.com/Enterprise Cloud
- Test coverage >80%

**Phase 2 Smart Defaults**:
- 4 sorting algorithms implemented
- Users prefer smart sort over alphabetical (survey)
- Algorithms produce sensible orders (manual review)

**Phase 3 Learning**:
- System learns from 50+ ordering sessions
- ML suggestions outperform Phase 2 algorithms
- Measurable reduction in review time

## Current Phase

**Active**: Phase 1 - MVP  
**Next Task**: See tasks.md for priority order  
**Current Focus**: Shipping basic functionality with excellent test coverage

Remember: Ship fast, test thoroughly, iterate based on usage. This is a DevEx tool for Tom's team first, broader adoption second.
