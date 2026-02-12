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

## Bug Fix Tasks (As Needed)

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
