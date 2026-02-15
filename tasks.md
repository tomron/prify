# Tasks Breakdown: PR File Reorder

## Workflow Guidelines

### Git Workflow (MANDATORY FOR ALL TASKS)
1. **Before starting any task:**
   ```bash
   git worktree add ../pr-file-reorder-<task-id> -b feature/<task-id>-<description>
   cd ../pr-file-reorder-<task-id>
   ```

2. **During development:**
   - Write tests FIRST (TDD approach)
   - Run tests frequently: `npm test`
   - Use browser DevTools for manual testing
   - Use Playwright for E2E testing

3. **Before creating PR:**
   ```bash
   npm test                    # All tests pass
   npm run lint                # No lint errors
   npm run build              # Build succeeds
   ```

4. **After PR is merged:**
   ```bash
   cd ../pr-file-reorder       # Back to main worktree
   git worktree remove ../pr-file-reorder-<task-id>
   git branch -d feature/<task-id>-<description>
   ```

### Testing Requirements (MANDATORY)
- **Unit tests**: Every utility function, algorithm, parser
- **Integration tests**: Component interactions
- **E2E tests**: Critical user workflows with Playwright
- **Manual testing**: Use Chrome DevTools + real GitHub PRs
- **Test coverage**: Minimum 80% for Phase 1

---

## Phase 0: Setup & Infrastructure

### Task 0.1: Project Initialization
**ID**: `TASK-001`  
**Branch**: `feature/001-project-setup`  
**Priority**: P0 (Blocker)

**Description:**
Set up the project structure, build tooling, and development environment.

**Work Items:**
1. Initialize npm project
2. Set up directory structure (see PRD Architecture)
3. Configure ESLint + Prettier
4. Set up Jest for unit testing
5. Set up Playwright for E2E testing
6. Create basic manifest.json (Manifest V3)
7. Set up GitHub Actions for CI
8. Create README.md with setup instructions

**Tools/Commands:**
```bash
npm init -y
npm install --save-dev jest @playwright/test eslint prettier
mkdir -p content ui utils algorithms tests/{unit,e2e}
```

**Definition of Done:**
- [ ] Project builds successfully
- [ ] `npm test` runs (even with no tests yet)
- [ ] `npm run lint` passes
- [ ] Extension loads in Chrome (chrome://extensions)
- [ ] GitHub Actions CI pipeline configured
- [ ] README documents setup steps
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up after merge

**Tests Required:**
- Smoke test: Extension manifest validates
- CI pipeline runs successfully

---

### Task 0.2: Testing Infrastructure Setup
**ID**: `TASK-002`  
**Branch**: `feature/002-testing-setup`  
**Priority**: P0 (Blocker)  
**Dependencies**: TASK-001

**Description:**
Set up comprehensive testing infrastructure including Playwright for E2E testing of the Chrome extension.

**Work Items:**
1. Configure Playwright with Chrome extension support
2. Create test GitHub PR fixtures (mock HTML)
3. Set up test utilities (DOM helpers, assertion helpers)
4. Create example unit test for utils/
5. Create example E2E test (load extension on GitHub PR)
6. Document testing patterns and best practices

**Tools/Commands:**
```bash
npx playwright install chromium
npx playwright test
npm run test:e2e
```

**Definition of Done:**
- [ ] Playwright configured for Chrome extensions
- [ ] Mock GitHub PR HTML fixtures created
- [ ] Example tests pass
- [ ] Test documentation complete
- [ ] CI runs all tests
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Playwright can load extension in test browser
- Mock GitHub PR page loads correctly
- Example assertions work

---

## Phase 1: Core Functionality

### Task 1.1: GitHub DOM Parser
**ID**: `TASK-003`  
**Branch**: `feature/003-github-parser`  
**Priority**: P0 (Blocker)  
**Dependencies**: TASK-002

**Description:**
Build parser to extract file information from GitHub's PR DOM structure.

**Work Items:**
1. Create `utils/parser.js`
2. Implement `extractFiles()` - get all file elements
3. Implement `getFilePath(fileElement)` - extract file path
4. Implement `getFileMetadata(fileElement)` - additions, deletions, etc.
5. Handle edge cases: renamed files, binary files, submodules
6. Write comprehensive unit tests
7. Test against real GitHub PR pages

**Tools/Commands:**
```bash
# Manual testing
# Open chrome://extensions
# Load unpacked extension
# Navigate to a GitHub PR
# Open DevTools console
```

**Definition of Done:**
- [ ] Parser extracts all files from PR
- [ ] File paths are correct
- [ ] Metadata (additions, deletions) extracted
- [ ] Handles edge cases gracefully
- [ ] Unit test coverage >90%
- [ ] E2E test on real GitHub PR
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Parse PR with 5 files
- Unit: Handle renamed files
- Unit: Handle binary files
- Unit: Handle files with special characters
- E2E: Parse real GitHub PR page

---

### Task 1.2: Storage Abstraction Layer
**ID**: `TASK-004`  
**Branch**: `feature/004-storage-layer`  
**Priority**: P0 (Blocker)  
**Dependencies**: TASK-002

**Description:**
Create unified storage interface supporting both chrome.storage.local and GitHub comments.

**Work Items:**
1. Create `utils/storage.js`
2. Implement `saveOrder(prId, order)` - save to localStorage
3. Implement `loadOrder(prId)` - load from localStorage
4. Implement `loadAllOrders(prId)` - load from GitHub comments (Phase 1.4)
5. Create storage format versioning
6. Write unit tests with mock chrome.storage API
7. Test data persistence across page reloads

**Tools/Commands:**
```bash
# Test storage persistence
chrome.storage.local.get('pr-order:org/repo/123', console.log)
```

**Definition of Done:**
- [ ] Storage interface documented
- [ ] Save/load works with localStorage
- [ ] Data persists across reloads
- [ ] Versioning implemented
- [ ] Unit test coverage >85%
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Save and load order
- Unit: Handle missing data
- Unit: Version migration
- Integration: Persist across "reloads" (test simulation)

---

### Task 1.3: DOM Manipulator
**ID**: `TASK-005`  
**Branch**: `feature/005-dom-manipulator`  
**Priority**: P0 (Blocker)  
**Dependencies**: TASK-003

**Description:**
Implement logic to reorder file elements in GitHub's DOM.

**Work Items:**
1. Create `content/dom-manipulator.js`
2. Implement `reorderFiles(order)` - move DOM elements
3. Implement `getCurrentOrder()` - get current file order
4. Handle GitHub's dynamic loading (MutationObserver)
5. Ensure smooth animations/transitions
6. Write unit tests with JSDOM
7. Write E2E tests with Playwright

**Tools/Commands:**
```bash
# Playwright test
npx playwright test tests/e2e/reorder.spec.js
```

**Definition of Done:**
- [ ] Files reorder correctly in DOM
- [ ] Handles GitHub's lazy loading
- [ ] No visual glitches
- [ ] Works on different PR sizes (1-100+ files)
- [ ] Unit tests with JSDOM
- [ ] E2E test validates visual reordering
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Reorder 5 files
- Unit: Handle missing files
- E2E: Reorder files on real GitHub PR
- E2E: Verify visual order matches data order

---

### Task 1.4: Drag-and-Drop UI
**ID**: `TASK-006`  
**Branch**: `feature/006-drag-drop-ui`  
**Priority**: P0 (Blocker)  
**Dependencies**: TASK-005

**Description:**
Build drag-and-drop interface for manual file reordering.

**Work Items:**
1. Create `ui/reorder-modal.js`
2. Implement modal HTML/CSS
3. Add drag-and-drop event handlers
4. Add visual feedback (drag preview, drop zones)
5. Implement "Save & Apply" button
6. Implement "Cancel" button
7. Add keyboard shortcuts (Esc to close, etc.)
8. Write E2E tests with Playwright

**Tools/Commands:**
```bash
# Playwright test with drag-and-drop
npx playwright test tests/e2e/drag-drop.spec.js --headed
```

**Definition of Done:**
- [ ] Modal opens and closes correctly
- [ ] Files can be dragged and dropped
- [ ] Visual feedback is clear
- [ ] Save applies order
- [ ] Cancel reverts changes
- [ ] Keyboard shortcuts work
- [ ] E2E tests cover all interactions
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: Open modal
- E2E: Drag file to new position
- E2E: Save and verify order applied
- E2E: Cancel and verify order unchanged
- E2E: Keyboard shortcuts (Esc, Enter)

---

### Task 1.5: GitHub Comment Storage
**ID**: `TASK-007`  
**Branch**: `feature/007-github-comment-storage`  
**Priority**: P1 (Critical)  
**Dependencies**: TASK-004

**Description:**
Implement reading/writing orders as hidden GitHub PR comments.

**Work Items:**
1. Create `content/github-api.js`
2. Implement `postOrderComment(order)` - post hidden comment
3. Implement `extractOrdersFromComments()` - parse all orders
4. Handle authentication (use GitHub session)
5. Handle rate limiting gracefully
6. Handle errors (no write permission, network failures)
7. Write integration tests with mock GitHub API

**Tools/Commands:**
```bash
# Test on real GitHub PR
# Check comment is posted correctly
# Verify it's hidden from normal view
```

**Definition of Done:**
- [ ] Orders post as hidden comments
- [ ] Comments are parseable
- [ ] Handles auth correctly
- [ ] Graceful error handling
- [ ] Fallback to localStorage if posting fails
- [ ] Integration tests with mocked fetch
- [ ] E2E test on real GitHub PR (if possible)
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Integration: Mock posting comment
- Integration: Parse orders from mock comments
- Unit: Handle parsing errors
- E2E: Post and read comment on test PR

---

### Task 1.6: Consensus Algorithm
**ID**: `TASK-008`  
**Branch**: `feature/008-consensus-algorithm`  
**Priority**: P1 (Critical)  
**Dependencies**: TASK-004

**Description:**
Implement consensus calculation from multiple user orders.

**Work Items:**
1. Create `content/consensus.js`
2. Implement weighted average position algorithm
3. Implement tie-breaking rules
4. Handle edge cases (single order, conflicting orders)
5. Write comprehensive unit tests
6. Document algorithm with examples

**Tools/Commands:**
```bash
npm test -- consensus.test.js
```

**Definition of Done:**
- [ ] Algorithm produces stable consensus
- [ ] Handles 1 to 20+ orders
- [ ] Tie-breaking is deterministic
- [ ] Performance: <50ms for 100 files
- [ ] Unit test coverage >95%
- [ ] Algorithm documented with examples
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Single order (returns as-is)
- Unit: Two identical orders
- Unit: Two different orders (average)
- Unit: Three orders with outlier
- Unit: 20 orders with 100 files (performance)
- Unit: Handle missing files in some orders

---

### Task 1.7: Order Viewer UI
**ID**: `TASK-009`  
**Branch**: `feature/009-order-viewer-ui`  
**Priority**: P1 (Critical)  
**Dependencies**: TASK-008

**Description:**
Build UI to view all individual orders and switch between them.

**Work Items:**
1. Create `ui/order-viewer.js`
2. Implement modal showing all orders
3. Display consensus with visual indication
4. Show individual orders with user attribution
5. Implement "Apply" button for each order
6. Add visual diff between orders
7. Write E2E tests with Playwright

**Tools/Commands:**
```bash
npx playwright test tests/e2e/order-viewer.spec.js --headed
```

**Definition of Done:**
- [ ] Modal displays all orders correctly
- [ ] Consensus is clearly marked
- [ ] Can apply any order
- [ ] Visual diff is helpful
- [ ] UI is responsive and accessible
- [ ] E2E tests cover all interactions
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: Open viewer with 3 orders
- E2E: Apply consensus order
- E2E: Apply specific user's order
- E2E: Verify visual diff is accurate

---

### Task 1.8: Content Script Integration
**ID**: `TASK-010`  
**Branch**: `feature/010-content-script-integration`  
**Priority**: P0 (Blocker)  
**Dependencies**: TASK-003, TASK-005, TASK-006, TASK-007, TASK-008, TASK-009

**Description:**
Integrate all components into main content script with initialization logic.

**Work Items:**
1. Create `content/content.js`
2. Implement page detection (GitHub PR URLs)
3. Implement initialization flow
4. Add "Reorder" button to GitHub UI
5. Add order badge (count indicator)
6. Implement auto-apply consensus on page load
7. Add notification system (toasts)
8. Write end-to-end integration tests

**Tools/Commands:**
```bash
# Load extension in Chrome
# Navigate to GitHub PR
# Verify all features work
npx playwright test tests/e2e/integration.spec.js
```

**Definition of Done:**
- [ ] Extension activates on GitHub PR pages only
- [ ] Reorder button appears correctly
- [ ] Badge shows order count
- [ ] Auto-apply works on page load
- [ ] Notifications are clear and non-intrusive
- [ ] All E2E tests pass
- [ ] Manual testing on 5+ different PRs
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: Full workflow (open PR, reorder, save, reload, verify)
- E2E: Auto-apply consensus
- E2E: View other orders
- E2E: Apply different order
- E2E: Works on GitHub Enterprise Cloud

---

### Task 1.9: Error Handling & Edge Cases
**ID**: `TASK-011`  
**Branch**: `feature/011-error-handling`  
**Priority**: P1 (Critical)  
**Dependencies**: TASK-010

**Description:**
Comprehensive error handling and edge case coverage.

**Work Items:**
1. Handle network failures gracefully
2. Handle GitHub DOM structure changes
3. Handle no write permissions (fallback to localStorage)
4. Handle malformed order data
5. Add user-friendly error messages
6. Implement graceful degradation
7. Add error logging for debugging
8. Write tests for all error scenarios

**Tools/Commands:**
```bash
# Test with network disabled
# Test with invalid comment data
# Test on PR without write access
```

**Definition of Done:**
- [ ] All error paths tested
- [ ] User sees helpful error messages
- [ ] Extension never crashes
- [ ] Fallbacks work correctly
- [ ] Error logs are useful for debugging
- [ ] Test coverage includes all error paths
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Handle parsing errors
- Integration: Network failure during comment post
- Integration: Malformed comment data
- E2E: No write permissions scenario
- E2E: GitHub DOM structure change simulation

---

### Task 1.10: Performance Optimization
**ID**: `TASK-012`  
**Branch**: `feature/012-performance-optimization`  
**Priority**: P2 (Important)  
**Dependencies**: TASK-010

**Description:**
Optimize extension performance for large PRs and slow networks.

**Work Items:**
1. Profile extension performance
2. Optimize DOM manipulation (batch updates)
3. Implement virtual scrolling for 100+ files
4. Optimize consensus calculation
5. Lazy load orders (don't parse until needed)
6. Minimize main thread blocking
7. Write performance benchmarks

**Tools/Commands:**
```bash
# Chrome DevTools Performance tab
# Lighthouse CI
npm run benchmark
```

**Definition of Done:**
- [ ] Extension loads in <100ms
- [ ] Reordering 100 files takes <200ms
- [ ] Consensus calculation <50ms
- [ ] No jank during drag-and-drop
- [ ] Performance benchmarks pass
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Benchmark: Load time on PR with 1, 10, 100 files
- Benchmark: Reorder time for 100 files
- Benchmark: Consensus calculation for 20 orders
- E2E: Large PR (100+ files) works smoothly

---

## Phase 1.5: UX Enhancements (Post-MVP)

### Task 1.11: Undo/Redo Functionality
**ID**: `TASK-013-UX`
**Branch**: `feature/013-undo-redo`
**Priority**: P2 (Important)
**Dependencies**: TASK-004 (Storage)

**Description:**
Implement undo/redo functionality for file reordering with keyboard shortcuts.

**Work Items:**
1. Add history stack to storage layer
2. Implement undo() and redo() methods
3. Add Ctrl+Z / Ctrl+Y keyboard shortcuts
4. Update UI to show undo/redo buttons
5. Limit history to last 20 actions
6. Clear history on new PR navigation
7. Write unit and E2E tests

**Definition of Done:**
- [ ] Undo/redo works for all reorder operations
- [ ] Keyboard shortcuts functional
- [ ] History persists during session
- [ ] UI buttons update state correctly
- [ ] Unit tests for history management
- [ ] E2E tests for keyboard shortcuts
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: History stack operations
- E2E: Undo after reorder
- E2E: Redo after undo
- E2E: Ctrl+Z / Ctrl+Y shortcuts

---

### Task 1.12: Quick Sort Presets
**ID**: `TASK-014-UX`
**Branch**: `feature/014-sort-presets`
**Priority**: P2 (Important)
**Dependencies**: TASK-003 (Parser), TASK-005 (DOM Manipulator)

**Description:**
Add quick sort presets for common ordering patterns.

**Work Items:**
1. Create `utils/presets.js`
2. Implement sorting presets:
   - Alphabetical (A-Z)
   - Reverse Alphabetical (Z-A)
   - By file extension
   - README first, tests last
   - New files first
   - Most changed first
3. Add preset dropdown to UI
4. Save user's last used preset
5. Write tests for each preset

**Definition of Done:**
- [ ] All 6 presets implemented
- [ ] Preset selector in UI
- [ ] Last preset remembered
- [ ] Each preset tested
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Each preset algorithm
- E2E: Apply preset and verify order

---

### Task 1.13: Export/Import Orders
**ID**: `TASK-015-UX`
**Branch**: `feature/015-export-import`
**Priority**: P2 (Important)
**Dependencies**: TASK-004 (Storage)

**Description:**
Enable export/import of orders for users without write permissions.

**Work Items:**
1. Implement order export to JSON
2. Implement order import from JSON
3. Generate shareable URL (base64 encoded)
4. Add export/import buttons to UI
5. Add copy-to-clipboard for URLs
6. Handle import validation
7. Write tests

**Definition of Done:**
- [ ] Export downloads JSON file
- [ ] Import validates and loads JSON
- [ ] Shareable URL generation works
- [ ] Copy-to-clipboard functional
- [ ] Error handling for invalid imports
- [ ] E2E tests cover workflow
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: JSON serialization/deserialization
- E2E: Export, import, verify order
- E2E: Share via URL

---

### Task 1.14: Keyboard Shortcuts
**ID**: `TASK-016-UX`
**Branch**: `feature/016-keyboard-shortcuts`
**Priority**: P2 (Important)
**Dependencies**: TASK-006 (UI), TASK-009 (Order Viewer)

**Description:**
Implement comprehensive keyboard shortcuts for power users.

**Work Items:**
1. Create `utils/keyboard.js` hotkey handler
2. Implement shortcuts:
   - Ctrl+Shift+R: Open reorder modal
   - Ctrl+Shift+V: View all orders
   - Ctrl+Shift+C: Apply consensus
   - Esc: Close modal
   - ↑/↓: Navigate files
   - Ctrl+↑/↓: Move file up/down
3. Add keyboard shortcut help modal (?)
4. Prevent conflicts with GitHub shortcuts
5. Write E2E tests

**Definition of Done:**
- [ ] All shortcuts functional
- [ ] Help modal shows all shortcuts
- [ ] No conflicts with GitHub
- [ ] Shortcuts work in all modals
- [ ] E2E tests for each shortcut
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: Each keyboard shortcut
- E2E: Modal navigation
- E2E: No GitHub conflict test

---

### Task 1.15: Collaborative Annotations
**ID**: `TASK-017-UX`
**Branch**: `feature/017-annotations`
**Priority**: P3 (Nice to have)
**Dependencies**: TASK-007 (GitHub Comments)

**Description:**
Allow users to add explanatory notes to their file orders.

**Work Items:**
1. Extend order comment format with annotations
2. Add annotation input to reorder modal
3. Display annotations in order viewer
4. Show annotations as tooltips in consensus view
5. Update storage to handle annotations
6. Write tests

**Definition of Done:**
- [ ] Users can add notes per file
- [ ] Annotations stored in comments
- [ ] Annotations displayed in viewer
- [ ] Tooltips show annotations
- [ ] Tests cover annotation flow
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Annotation serialization
- E2E: Add, save, view annotations
- E2E: Annotations in consensus view

---

### Task 1.16: Order Diff Visualization
**ID**: `TASK-018-UX`
**Branch**: `feature/018-order-diff`
**Priority**: P2 (Important)
**Dependencies**: TASK-009 (Order Viewer)

**Description:**
Visual diff showing how two orders differ.

**Work Items:**
1. Create diff algorithm for order comparison
2. Design diff visualization UI (arrows, colors)
3. Add diff view to order viewer modal
4. Highlight moved files
5. Show position changes numerically
6. Write tests

**Definition of Done:**
- [ ] Diff shows file movements
- [ ] Visual representation clear
- [ ] Works for 100+ file orders
- [ ] Performance acceptable
- [ ] E2E tests verify visuals
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Diff algorithm
- E2E: View diff between orders
- E2E: Diff with large file count

---

### Task 1.17: Icon & Visual Assets
**ID**: `TASK-019-UX`
**Branch**: `feature/019-icons`
**Priority**: P1 (Critical for release)
**Dependencies**: None

**Description:**
Create all required visual assets for extension.

**Work Items:**
1. Design extension icon (16x16, 48x48, 128x128)
2. Create icons/ directory
3. Export icon in multiple formats
4. Create badge icons for status
5. Design loading spinner
6. Create promotional images (440x280, 920x680, 1400x560)
7. Screenshot generation for Web Store

**Definition of Done:**
- [ ] All icon sizes created
- [ ] Icons follow Chrome guidelines
- [ ] Badge icons functional
- [ ] Promotional images ready
- [ ] Screenshots captured
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: Icons render correctly
- Manual: Visual approval

---

### Task 1.18: Loading States & Feedback
**ID**: `TASK-020-UX`
**Branch**: `feature/020-loading-states`
**Priority**: P2 (Important)
**Dependencies**: TASK-006 (UI), TASK-010 (Content Script)

**Description:**
Add loading indicators and success/error feedback.

**Work Items:**
1. Create loading spinner component
2. Add loading states to all async operations
3. Implement toast notification system
4. Add success confirmation animations
5. Add error message display
6. Add skeleton screens for empty states
7. Write tests

**Definition of Done:**
- [ ] Loading spinners on all async ops
- [ ] Toast notifications work
- [ ] Success/error feedback clear
- [ ] Skeleton screens implemented
- [ ] Animations smooth
- [ ] E2E tests verify feedback
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: Loading state appears
- E2E: Success toast after save
- E2E: Error toast on failure

---

### Task 1.19: Search/Filter for Large File Lists
**ID**: `TASK-021-UX`
**Branch**: `feature/021-search-filter`
**Priority**: P1 (Critical)
**Dependencies**: TASK-006 (UI)

**Description:**
Add search/filter functionality for PRs with 50+ files to improve usability.

**Work Items:**
1. Add search input to reorder modal header
2. Implement fuzzy matching for file paths
3. Add "X of Y files shown" counter
4. Highlight matching text in file paths
5. Add clear filter button
6. Preserve order of filtered files
7. Add keyboard shortcut (Ctrl+K or /)
8. Write unit and E2E tests

**Definition of Done:**
- [ ] Search filters files in real-time
- [ ] Fuzzy matching works (e.g., "rdme" matches "README.md")
- [ ] Filtered files maintain relative order
- [ ] Clear button resets filter
- [ ] Filter works with keyboard navigation
- [ ] Search is case-insensitive
- [ ] E2E tests cover search workflow
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Fuzzy matching algorithm
- E2E: Search and filter files
- E2E: Clear filter
- E2E: Keyboard shortcut (Ctrl+K)
- E2E: Filter with large file list (100+ files)

---

### Task 1.20: File Preview/Context on Hover
**ID**: `TASK-022-UX`
**Branch**: `feature/022-file-preview`
**Priority**: P2 (Important)
**Dependencies**: TASK-006 (UI), TASK-003 (Parser)

**Description:**
Show file metadata and context on hover to help users make informed reordering decisions.

**Work Items:**
1. Create tooltip component
2. Extract file metadata (size, type, change summary)
3. Add hover delay (500ms)
4. Show full file path if truncated
5. Display file status (new, modified, deleted, renamed)
6. Add file type icons
7. Make tooltips accessible (keyboard triggerable)
8. Write tests

**Definition of Done:**
- [ ] Tooltip appears after 500ms hover
- [ ] Shows useful metadata (path, size, changes, type)
- [ ] Doesn't interfere with dragging
- [ ] Accessible to keyboard users
- [ ] Styling matches GitHub's design
- [ ] E2E tests verify tooltip content
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Tooltip data formatting
- E2E: Hover shows tooltip
- E2E: Tooltip doesn't block drag-and-drop
- E2E: Keyboard accessibility

---

### Task 1.21: Visual File Grouping and Separators
**ID**: `TASK-023-UX`
**Branch**: `feature/023-file-grouping`
**Priority**: P2 (Important)
**Dependencies**: TASK-006 (UI), TASK-003 (Parser)

**Description:**
Add visual organization to file lists with grouping and separators.

**Work Items:**
1. Implement separator/divider component
2. Add manual separator insertion UI
3. Auto-suggest groups based on:
   - Directory structure
   - File extensions
   - Related files (component + test)
4. Make groups collapsible
5. Add group labels
6. Ensure drag-and-drop works across groups
7. Persist separators in order data
8. Write tests

**Definition of Done:**
- [ ] Users can add/remove separators
- [ ] Groups are collapsible
- [ ] Auto-suggestions work
- [ ] Groups persist in saved order
- [ ] Visual hierarchy is clear
- [ ] Drag-and-drop works across groups
- [ ] E2E tests cover grouping workflow
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Group detection algorithm
- E2E: Add manual separator
- E2E: Collapse/expand groups
- E2E: Drag files between groups
- E2E: Persist and load groups

---

### Task 1.22: Enhanced Preset Management
**ID**: `TASK-024-UX`
**Branch**: `feature/024-preset-management`
**Priority**: P2 (Important)
**Dependencies**: TASK-014-UX (Sort Presets)

**Description:**
Advanced preset management with custom presets and better UX.

**Work Items:**
1. Add "Save as preset" functionality
2. Implement custom preset creation UI
3. Show preset descriptions on hover
4. Add preset preview before applying
5. Build preset management modal (edit, delete, reorder)
6. Mark frequently used presets with star
7. Enable preset export/import
8. Write tests

**Definition of Done:**
- [ ] Users can create custom presets
- [ ] Presets sync across PRs (localStorage)
- [ ] Preset management UI is intuitive
- [ ] Descriptions show on hover
- [ ] Custom presets can be exported/imported
- [ ] Star marking works
- [ ] E2E tests cover preset management
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Preset CRUD operations
- E2E: Create custom preset
- E2E: Edit/delete preset
- E2E: Export/import presets
- E2E: Star/unstar preset

---

### Task 1.23: Real-Time Collaboration Indicators
**ID**: `TASK-025-UX`
**Branch**: `feature/025-collaboration-indicators`
**Priority**: P2 (Important)
**Dependencies**: TASK-007 (GitHub Comments), TASK-009 (Order Viewer)

**Description:**
Show collaboration context in the UI to improve team coordination.

**Work Items:**
1. Add user count badge ("X people ordered")
2. Show last update timestamp and user
3. Display active users (last 5 minutes)
4. Add quick link to view all orders
5. Highlight conflicts in real-time
6. Update indicators when new orders posted
7. Write tests

**Definition of Done:**
- [ ] User count is accurate
- [ ] Last updated shows relative time (2m ago, 1h ago)
- [ ] Quick link to view orders works
- [ ] Non-intrusive design
- [ ] Updates when new orders posted
- [ ] E2E tests verify indicators
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Time formatting (relative timestamps)
- E2E: User count updates
- E2E: Last updated timestamp
- E2E: Quick link navigation

---

### Task 1.24: Enhanced Drag and Drop Feedback
**ID**: `TASK-026-UX`
**Branch**: `feature/026-drag-feedback`
**Priority**: P2 (Important)
**Dependencies**: TASK-006 (UI)

**Description:**
Improve visual feedback during drag-and-drop operations.

**Work Items:**
1. Add drop zone indicator line (between items)
2. Show ghost preview at drop position
3. Animate smooth transitions on drop
4. Add visual/haptic feedback on successful drop
5. Show "Drop here" placeholder text
6. Highlight valid drop zones
7. Support reduced motion preferences
8. Write tests

**Definition of Done:**
- [ ] Drop position always clear
- [ ] Animations smooth (60fps)
- [ ] No jarring transitions
- [ ] Works on all screen sizes
- [ ] Respects reduced motion preference
- [ ] E2E tests verify animations
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: Drop zone indicator appears
- E2E: Ghost preview shows
- E2E: Smooth drop animation
- Unit: Reduced motion detection

---

### Task 1.25: Onboarding and First-Time User Experience
**ID**: `TASK-027-UX`
**Branch**: `feature/027-onboarding`
**Priority**: P1 (Critical)
**Dependencies**: TASK-010 (Content Script)

**Description:**
Add guided onboarding tour for first-time users.

**Work Items:**
1. Create tour overlay component
2. Implement 4-5 step guided tour:
   - Step 1: Drag files to reorder
   - Step 2: Use presets for quick sorting
   - Step 3: Save your order
   - Step 4: View consensus
3. Add "Skip tour" and "Next" navigation
4. Show tour on first use only
5. Add "What's new" modal for updates
6. Add "Need help?" button in modal
7. Store tour completion state
8. Write tests

**Definition of Done:**
- [ ] Tour shows on first use only
- [ ] Tour is skippable
- [ ] Highlights relevant UI elements
- [ ] "Never show again" option works
- [ ] Tour is helpful, not annoying
- [ ] E2E tests cover tour flow
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: First-time tour appears
- E2E: Skip tour works
- E2E: Complete tour
- E2E: Tour doesn't show on second visit
- Unit: Tour state persistence

---

### Task 1.26: Accessibility Improvements
**ID**: `TASK-028-UX`
**Branch**: `feature/028-accessibility`
**Priority**: P2 (Important)
**Dependencies**: TASK-006 (UI), TASK-016-UX (Keyboard Shortcuts)

**Description:**
Comprehensive accessibility improvements to meet WCAG 2.1 AA standards.

**Work Items:**
1. Add ARIA live regions for dynamic updates
2. Improve screen reader announcements for drag-and-drop
3. Ensure full keyboard navigation
4. Test with screen readers (NVDA, JAWS)
5. Add skip links in modals
6. Ensure color contrast meets WCAG AA
7. Support Windows High Contrast mode
8. Add reduced motion preferences
9. Improve focus indicators visibility
10. Write accessibility tests

**Definition of Done:**
- [ ] Passes WCAG 2.1 AA standards
- [ ] Works with NVDA and JAWS
- [ ] Full keyboard navigation functional
- [ ] Color contrast ratios meet standards
- [ ] Reduced motion preference respected
- [ ] Screen reader announcements clear
- [ ] Focus trap in modals works correctly
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: Keyboard-only navigation
- E2E: Screen reader testing (manual)
- Unit: Color contrast validation
- E2E: Reduced motion mode
- Integration: ARIA live region updates

---

### Task 1.27: Dark Mode Refinements
**ID**: `TASK-029-UX`
**Branch**: `feature/029-dark-mode-refinements`
**Priority**: P3 (Nice to have)
**Dependencies**: TASK-006 (UI)

**Description:**
Polish dark mode to match GitHub's dark theme perfectly.

**Work Items:**
1. Audit all colors against GitHub's dark theme
2. Ensure consistent contrast ratios
3. Fix light mode artifacts in dark mode
4. Test all UI states (hover, active, disabled)
5. Add custom dark mode toggle if detection fails
6. Test toast notifications in dark mode
7. Verify loading overlays
8. Write visual regression tests

**Definition of Done:**
- [ ] All UI elements have proper contrast
- [ ] No light mode artifacts
- [ ] Consistent with GitHub's dark theme
- [ ] Tested in both light and dark modes
- [ ] Smooth mode switching
- [ ] Visual regression tests pass
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: Dark mode switching
- Visual: Screenshot comparison tests
- Unit: Color contrast calculations
- Manual: Visual approval in both modes

---

### Task 1.28: Bulk Selection and Operations
**ID**: `TASK-030-UX`
**Branch**: `feature/030-bulk-operations`
**Priority**: P2 (Important)
**Dependencies**: TASK-006 (UI)

**Description:**
Enable bulk file operations for efficient reordering of multiple files.

**Work Items:**
1. Add checkbox selection mode toggle
2. Implement Shift+Click range selection
3. Add "Select all" and "Select none" buttons
4. Create bulk operations menu:
   - Move to top/bottom
   - Group together
   - Apply preset to selected only
   - Remove from view (filter)
5. Update drag-and-drop to work with selections
6. Add keyboard shortcuts for selection
7. Write tests

**Definition of Done:**
- [ ] Selection works with mouse and keyboard
- [ ] Shift+Click selects range
- [ ] All bulk operations work correctly
- [ ] Visual feedback for selected files
- [ ] Easy to enter/exit selection mode
- [ ] E2E tests cover bulk workflows
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: Checkbox selection
- E2E: Shift+Click range selection
- E2E: Bulk move to top
- E2E: Bulk group together
- E2E: Select all/none

---

### Task 1.29: Workspace and Multi-PR Management
**ID**: `TASK-031-UX`
**Branch**: `feature/031-workspace-management`
**Priority**: P3 (Nice to have)
**Dependencies**: TASK-004 (Storage), TASK-024-UX (Preset Management)

**Description:**
Manage ordering preferences across multiple PRs and repositories.

**Work Items:**
1. Implement repository-specific workspace settings
2. Add "Apply order from PR #X" functionality
3. Save ordering templates per repository
4. Add recent orders list
5. Quick preset switching between PRs
6. Workspace settings sync via chrome.storage.sync
7. Write tests

**Definition of Done:**
- [ ] Presets are repository-specific
- [ ] Easy to import from other PRs
- [ ] Workspace settings sync across Chrome instances
- [ ] Non-intrusive UX
- [ ] Clear organization
- [ ] E2E tests cover workspace features
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Workspace data structure
- E2E: Save workspace preset
- E2E: Import order from another PR
- E2E: Settings sync (multi-device simulation)

---

### Task 1.30: Virtual Scrolling for Large PRs
**ID**: `TASK-032-UX`
**Branch**: `feature/032-virtual-scrolling`
**Priority**: P2 (Important)
**Dependencies**: TASK-006 (UI), TASK-012 (Performance)

**Description:**
Implement virtual scrolling for PRs with 200+ files to improve performance.

**Work Items:**
1. Implement virtual list component
2. Use Intersection Observer API
3. Render viewport + buffer (20 items)
4. Maintain scroll position on reorder
5. Ensure drag-and-drop works with virtual list
6. Add pagination option for 500+ files
7. Optimize re-renders
8. Write performance tests

**Definition of Done:**
- [ ] Smooth scrolling with 500+ files
- [ ] No lag during drag-and-drop
- [ ] Memory usage stays reasonable (<50MB)
- [ ] Works with search/filter
- [ ] Maintains accessibility
- [ ] Performance benchmarks pass
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Benchmark: Render time for 500 files
- Benchmark: Memory usage
- E2E: Scroll through large list
- E2E: Drag-and-drop in virtual list
- E2E: Search with virtual scrolling

---

### Task 1.31: Enhanced Order Comparison
**ID**: `TASK-033-UX`
**Branch**: `feature/033-order-comparison`
**Priority**: P2 (Important)
**Dependencies**: TASK-018-UX (Order Diff)

**Description:**
Enhanced order comparison with side-by-side view and similarity scoring.

**Work Items:**
1. Implement side-by-side comparison view
2. Calculate and display similarity score
3. Highlight major position changes (>10 positions)
4. Show file movement arrows in list
5. Add "Accept this file's position" per-file button
6. Add "Compare with..." dropdown to select orders
7. Show visual indicators for movement direction
8. Write tests

**Definition of Done:**
- [ ] Side-by-side view is clear
- [ ] Movement indicators are intuitive
- [ ] Similarity score is accurate (0-100%)
- [ ] Easy to merge changes
- [ ] Works with keyboard navigation
- [ ] E2E tests verify comparison features
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Similarity score algorithm
- E2E: Side-by-side comparison
- E2E: Accept file position
- E2E: Compare different orders
- Unit: Movement detection (up/down/unchanged)

---

## Phase 2: Smart Defaults

### Task 2.1: Dependency Graph Parser
**ID**: `TASK-013`  
**Branch**: `feature/013-dependency-parser`  
**Priority**: P2 (Important)  
**Dependencies**: TASK-010

**Description:**
Parse import/require statements to build dependency graph.

**Work Items:**
1. Create `algorithms/dependency.js`
2. Implement JavaScript import parsing (ES6 + CommonJS)
3. Implement Python import parsing
4. Implement Go import parsing
5. Build dependency graph data structure
6. Implement topological sort for ordering
7. Write unit tests with sample files

**Tools/Commands:**
```bash
npm test -- dependency.test.js
```

**Definition of Done:**
- [ ] Parses JS, Python, Go imports correctly
- [ ] Builds accurate dependency graph
- [ ] Topological sort produces valid order
- [ ] Handles circular dependencies
- [ ] Unit test coverage >85%
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Parse ES6 imports
- Unit: Parse CommonJS requires
- Unit: Parse Python imports
- Unit: Build graph from 10 files
- Unit: Topological sort
- Unit: Handle circular dependencies

---

### Task 2.2: Change Magnitude Algorithm
**ID**: `TASK-014`  
**Branch**: `feature/014-change-magnitude`  
**Priority**: P2 (Important)  
**Dependencies**: TASK-003

**Description:**
Sort files by size of changes (additions + deletions).

**Work Items:**
1. Create `algorithms/change-size.js`
2. Implement `sortByChangeSize(files)`
3. Handle edge cases (binary files, renamed files)
4. Add configurable thresholds (small/medium/large)
5. Write unit tests

**Definition of Done:**
- [ ] Sorts files correctly by change size
- [ ] Handles edge cases
- [ ] Configurable thresholds
- [ ] Unit test coverage >90%
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Sort 10 files by size
- Unit: Handle binary files
- Unit: Handle renamed files
- Unit: Apply thresholds

---

### Task 2.3: Logical Grouping Algorithm
**ID**: `TASK-015`  
**Branch**: `feature/015-logical-grouping`  
**Priority**: P2 (Important)  
**Dependencies**: TASK-003

**Description:**
Group related files together (tests with implementation, config with code).

**Work Items:**
1. Create `algorithms/grouping.js`
2. Implement file type detection
3. Implement grouping rules:
   - README/docs first
   - Tests with implementation
   - Config with related code
   - Tests last
4. Make rules configurable
5. Write unit tests

**Definition of Done:**
- [ ] Groups files logically
- [ ] Rules are configurable
- [ ] Handles edge cases
- [ ] Unit test coverage >90%
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- Unit: Group 10 mixed files
- Unit: Tests stay with implementation
- Unit: README appears first
- Unit: Custom rules work

---

### Task 2.4: Settings Page
**ID**: `TASK-016`  
**Branch**: `feature/016-settings-page`  
**Priority**: P2 (Important)  
**Dependencies**: TASK-013, TASK-014, TASK-015

**Description:**
Build extension settings page for algorithm selection and preferences.

**Work Items:**
1. Create `options.html` and `options.js`
2. Add algorithm selection dropdown
3. Add auto-apply consensus toggle
4. Add notification preferences
5. Add reset to defaults button
6. Persist settings in chrome.storage.sync
7. Write E2E tests

**Definition of Done:**
- [ ] Settings page accessible from extension icon
- [ ] All settings work correctly
- [ ] Settings persist across reloads
- [ ] Reset works
- [ ] E2E tests cover all settings
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: Open settings page
- E2E: Change algorithm, verify applied
- E2E: Toggle auto-apply
- E2E: Reset to defaults

---

### Task 2.5: Algorithm Integration
**ID**: `TASK-017`  
**Branch**: `feature/017-algorithm-integration`  
**Priority**: P2 (Important)  
**Dependencies**: TASK-016

**Description:**
Integrate smart sorting algorithms into main extension flow.

**Work Items:**
1. Update content script to use selected algorithm
2. Add "Apply smart sort" button
3. Show which algorithm is active
4. Compare smart sort vs alphabetical vs consensus
5. Write integration tests

**Definition of Done:**
- [ ] Smart sort applies on page load (if enabled)
- [ ] Can switch algorithms on the fly
- [ ] Visual indication of active algorithm
- [ ] Integration tests pass
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

**Tests Required:**
- E2E: Load PR with dependency algorithm
- E2E: Switch to change-size algorithm
- E2E: Compare with consensus
- Integration: All algorithms produce valid orders

---

## Phase 3: Learning System (Future)

### Task 3.1: Event Tracking System
**ID**: `TASK-018`  
**Branch**: `feature/018-event-tracking`  
**Priority**: P3 (Nice to have)  
**Dependencies**: TASK-010

**Description:**
Track user interactions for learning patterns.

**Work Items:**
1. Create `utils/analytics.js`
2. Implement event tracking (reorder, adopt, time-to-approval)
3. Store events in chrome.storage.local
4. Implement data export
5. Add privacy controls (opt-in)
6. Write tests

**Definition of Done:**
- [ ] Events tracked accurately
- [ ] No PII collected
- [ ] Privacy controls work
- [ ] Data exportable
- [ ] Tests pass
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

---

## Bug Fix Tasks (Critical Issues)

### BUG-001: Race Condition with Dynamic File Loading
**ID**: `BUG-001`
**Branch**: `bugfix/001-race-condition-dynamic-loading`
**Priority**: P1 (Critical)
**Dependencies**: TASK-005 (DOM Manipulator)

**Description:**
GitHub lazy-loads files in large PRs, causing parser to miss files or reorder to fail.

**Root Cause:**
- Parser runs once on page load
- GitHub dynamically adds files as user scrolls
- No MutationObserver to detect new files

**Work Items:**
1. Write failing test that reproduces issue
2. Implement MutationObserver in dom-manipulator.js
3. Add debouncing to prevent excessive re-parsing
4. Re-apply saved order when new files appear
5. Add unit and E2E tests
6. Add performance benchmark

**Definition of Done:**
- [ ] Bug reproduced with test
- [ ] MutationObserver implemented
- [ ] Debouncing prevents performance issues
- [ ] Order preserved with dynamic loading
- [ ] Tests pass
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

---

### BUG-002: No Cleanup on Page Navigation
**ID**: `BUG-002`
**Branch**: `bugfix/002-navigation-cleanup`
**Priority**: P1 (Critical)
**Dependencies**: TASK-010 (Content Script)

**Description:**
Extension leaves artifacts (event listeners, DOM elements) when navigating away from PR.

**Root Cause:**
- No navigation listener
- No cleanup function
- Memory leaks accumulate

**Work Items:**
1. Add navigation event listener
2. Implement cleanup() function
3. Remove injected UI elements
4. Clear event listeners
5. Cancel pending async operations
6. Write memory leak test
7. Add E2E navigation test

**Definition of Done:**
- [ ] Cleanup function implemented
- [ ] No memory leaks on navigation
- [ ] UI elements removed
- [ ] Event listeners cleared
- [ ] Tests pass
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

---

### BUG-003: Input Sanitization Missing
**ID**: `BUG-003`
**Branch**: `bugfix/003-input-sanitization`
**Priority**: P0 (Security)
**Dependencies**: TASK-006 (UI), TASK-007 (GitHub Comments)

**Description:**
User input (file paths, annotations, orders) not sanitized, XSS vulnerability.

**Root Cause:**
- Direct innerHTML usage
- No input validation
- No CSP enforcement

**Work Items:**
1. Audit all user input points
2. Replace innerHTML with textContent
3. Implement Shadow DOM for UI isolation
4. Add input validation/sanitization
5. Apply strict CSP
6. Write security tests
7. Security audit

**Definition of Done:**
- [ ] All inputs sanitized
- [ ] Shadow DOM isolation
- [ ] CSP enforced
- [ ] Security tests pass
- [ ] No XSS vulnerabilities
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

---

### BUG-004: Parser Fails on New GitHub DOM
**ID**: `BUG-004`
**Branch**: `bugfix/004-parser-robustness`
**Priority**: P2 (Important)
**Dependencies**: TASK-003 (Parser)

**Description:**
Parser may break if GitHub changes DOM structure, no error handling or fallback.

**Root Cause:**
- Parser assumes specific DOM structure
- No error boundaries
- No version detection

**Work Items:**
1. Add comprehensive error handling to parser
2. Implement DOM structure detection
3. Add fallback selectors (already partially done)
4. Add graceful degradation
5. Add error reporting/logging
6. Create test suite with mock DOMs
7. Add monitoring for GitHub changes

**Definition of Done:**
- [ ] Parser has error boundaries
- [ ] Fallbacks work correctly
- [ ] Graceful degradation tested
- [ ] Error logging functional
- [ ] Tests with various DOM structures
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

---

### Bug Fix Template
**ID**: `BUG-XXX`
**Branch**: `bugfix/XXX-short-description`
**Priority**: Varies

**Process:**
1. Create worktree: `git worktree add ../pr-file-reorder-bug-XXX -b bugfix/XXX-short-description`
2. Write failing test that reproduces bug
3. Fix bug
4. Verify test passes
5. Add regression test
6. Create PR
7. After merge: clean up worktree and branch

**Definition of Done:**
- [ ] Bug reproduced with test
- [ ] Fix implemented
- [ ] Test passes
- [ ] Regression test added
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

---

## Release Tasks

### Task R.1: Chrome Web Store Submission
**ID**: `TASK-019`  
**Branch**: `release/v1.0.0`  
**Priority**: P0 (for release)  
**Dependencies**: All Phase 1 tasks

**Description:**
Prepare and submit extension to Chrome Web Store.

**Work Items:**
1. Create store listing (description, screenshots, icons)
2. Prepare privacy policy
3. Create promotional images
4. Set up Chrome Web Store developer account
5. Package extension for submission
6. Submit for review
7. Address review feedback

**Definition of Done:**
- [ ] Extension published on Chrome Web Store
- [ ] Privacy policy accessible
- [ ] Store listing is compelling
- [ ] All review feedback addressed
- [ ] Documentation updated with install link

---

## Documentation Tasks

### Task D.1: User Documentation
**ID**: `TASK-020`  
**Branch**: `docs/user-guide`  
**Priority**: P1

**Description:**
Create comprehensive user documentation.

**Work Items:**
1. Write installation guide
2. Write user guide with screenshots
3. Write FAQ
4. Create video tutorial (optional)
5. Document keyboard shortcuts
6. Document troubleshooting

**Definition of Done:**
- [ ] Documentation covers all features
- [ ] Screenshots are current
- [ ] FAQ addresses common issues
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

---

### Task D.2: Developer Documentation
**ID**: `TASK-021`  
**Branch**: `docs/developer-guide`  
**Priority**: P2

**Description:**
Create developer documentation for contributors.

**Work Items:**
1. Write architecture overview
2. Document code structure
3. Write testing guide
4. Write contribution guidelines
5. Document release process
6. Add code examples

**Definition of Done:**
- [ ] New developers can onboard from docs
- [ ] Architecture is clearly explained
- [ ] Testing process documented
- [ ] PR created and reviewed
- [ ] Branch/worktree cleaned up

---

## Summary

**Total Tasks**: 21 main tasks + bug fixes as needed  
**Phase 1 (MVP)**: Tasks 0.1 - 1.10 (12 tasks)  
**Phase 2 (Smart Defaults)**: Tasks 2.1 - 2.5 (5 tasks)  
**Phase 3 (Learning)**: Task 3.1+ (1+ tasks)  
**Release & Docs**: Tasks R.1, D.1, D.2 (3 tasks)

**Estimated Timeline:**
- Phase 1: 3-4 weeks (with testing)
- Phase 2: 2-3 weeks
- Phase 3: 4-6 weeks

**Testing Coverage Goal:**
- Unit tests: >85% coverage
- E2E tests: All critical user workflows
- Integration tests: All component interactions
