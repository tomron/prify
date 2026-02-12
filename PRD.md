# Product Requirements Document: PR File Reorder

## Problem Statement

### Current State
GitHub displays files in Pull Requests in alphabetical order by default. While consistent, this ordering often obscures the logical flow of changes and makes code review less efficient.

**Key pain points:**
- Reviewers must mentally reorganize files to understand change context
- Critical files (README, configuration) may be buried in the list
- Dependencies and dependents are scattered
- Tests are intermixed with implementation
- Large refactors appear before small fixes that provide context

### Impact
- Slower code review cycles
- Increased cognitive load on reviewers
- Missed context leading to incomplete reviews
- Difficulty onboarding new team members to review process

## Solution

A Chrome extension that allows collaborative reordering of PR files with zero backend infrastructure.

### Core Principles
1. **Pure democracy** - All team members have equal input
2. **Never locked** - Orders can always be refined
3. **Public by default** - All orders visible to all reviewers
4. **Progressive enhancement** - Start simple, evolve intelligently

### Key Features

#### Phase 1: Manual Reordering + Democracy (MVP)
- Drag-and-drop interface to reorder files in PR view
- Store individual orders as hidden GitHub PR comments
- Calculate consensus from all submitted orders
- Apply consensus automatically when multiple orders exist
- View all individual orders and switch between them
- Local storage fallback for offline/no-permissions scenarios
- **NEW**: Undo/Redo functionality for mistake recovery
- **NEW**: Quick sort presets (alphabetical, by extension, README first, etc.)
- **NEW**: Export/Import orders for users without write permissions
- **NEW**: Keyboard shortcuts for power users (Ctrl+Shift+R to reorder, etc.)

#### Phase 1.5: Enhanced UX (Post-MVP)
- **NEW**: Collaborative annotations (explain why files are ordered a certain way)
- **NEW**: Order diff visualization (show how orders differ visually)
- **NEW**: Real-time collaboration indicator (show active reviewers)
- **NEW**: Order templates (save common patterns like "Frontend PR", "Bugfix PR")
- **NEW**: Visual file tree view (alternative to flat list)
- **NEW**: Statistics dashboard (usage metrics, time saved, consensus rates)

#### Phase 2: Smart Defaults
- Algorithm-based initial ordering (replaces alphabetical)
- Configurable strategies:
  - Dependency-aware (imports graph)
  - Change magnitude (small first)
  - Logical grouping (tests with implementation)
  - Directory depth (shallow to deep)
- User preference for default strategy
- **NEW**: AI-powered order suggestions using LLMs (analyze PR description + diffs)

#### Phase 3: Learning System
- Track user reordering patterns
- Learn team preferences over time
- Suggest orders based on historical data
- Analytics on review time correlation

## Architecture

### Technology Stack
- **Extension**: Manifest V3 Chrome Extension
- **Language**: Vanilla JavaScript (no framework dependencies)
- **Storage**: GitHub PR comments (primary) + chrome.storage.local (fallback)
- **Auth**: Implicit via GitHub session cookies
- **Testing**: Playwright for E2E, Jest for unit tests

### Storage Model

**GitHub Comment Format:**
```html
<!-- file-order-data
{
  "user": "username",
  "order": ["README.md", "src/engine.ts", "tests/engine.test.ts"],
  "timestamp": "2025-02-12T10:30:00Z",
  "version": "1.0"
}
-->
```

**Local Storage Schema:**
```javascript
{
  "pr-order:org/repo/123": {
    "order": ["file1.js", "file2.js"],
    "lastModified": "2025-02-12T10:30:00Z"
  },
  "settings": {
    "defaultStrategy": "dependency-aware",
    "autoApplyConsensus": true,
    "showNotifications": true
  }
}
```

### Consensus Algorithm

**Phase 1: Weighted Average Position**
```
For each file:
  1. Collect all positions from all orders
  2. Calculate average position
  3. Sort files by average position
```

**Future**: Median (robust to outliers), most-common-subsequence, or ML-based

### Component Architecture

```
pr-file-reorder/
├── manifest.json           # Extension manifest
├── content/
│   ├── content.js         # Main content script
│   ├── dom-manipulator.js # File reordering logic
│   ├── github-api.js      # Comment reading/writing
│   └── consensus.js       # Consensus algorithms
├── ui/
│   ├── reorder-modal.js   # Drag-and-drop interface
│   ├── order-viewer.js    # View all orders UI
│   └── styles.css         # Extension styles
├── utils/
│   ├── storage.js         # Local + GitHub storage abstraction
│   ├── parser.js          # Extract file info from GitHub DOM
│   └── logger.js          # Debug logging
├── algorithms/            # Phase 2
│   ├── dependency.js      # Parse imports for dependency graph
│   ├── change-size.js     # Sort by diff size
│   └── grouping.js        # Logical file grouping
└── tests/
    ├── e2e/              # Playwright tests
    └── unit/             # Jest tests
```

## User Experience

### Core Workflows

**Workflow 1: First-time user reorders files**
1. User opens PR on GitHub
2. Extension badge shows "⚡ Reorder files"
3. User clicks badge → drag-and-drop interface appears
4. User drags files into preferred order
5. User clicks "Save & Apply"
6. Extension posts hidden comment with order
7. Extension applies order immediately

**Workflow 2: Collaborative ordering**
1. User opens PR where others have already ordered
2. Extension shows "📊 3 reviewers have custom orders"
3. Extension auto-applies consensus order
4. User can click badge to see all individual orders
5. User can adopt specific person's order or create their own
6. When user saves new order, consensus recalculates

**Workflow 3: Viewing order details**
1. User clicks "📊 View all orders"
2. Modal shows:
   - Consensus order with "Apply" button
   - Each individual order with user, timestamp, "Apply" button
   - Visual diff showing how orders differ
3. User can switch between orders on the fly

### UI Components

**Reorder Button**
```
┌─────────────────────────────┐
│ Files changed (12)          │
│ [⚡ Reorder] [📊 3 orders]  │
└─────────────────────────────┘
```

**Drag-and-Drop Interface**
```
┌─────────────────────────────────┐
│ Reorder Files                   │
├─────────────────────────────────┤
│ 📄 README.md              [≡]   │
│ 📄 src/engine.ts          [≡]   │
│ 📄 tests/engine.test.ts   [≡]   │
│ 📄 config.yml             [≡]   │
├─────────────────────────────────┤
│ [Cancel] [Save & Apply]         │
└─────────────────────────────────┘
```

**Order Comparison Modal**
```
┌─────────────────────────────────────┐
│ Review Orders (3 people)            │
├─────────────────────────────────────┤
│ 🏆 Consensus                [Apply] │
│   1. README.md                      │
│   2. src/engine.ts                  │
│   3. tests/engine.test.ts           │
├─────────────────────────────────────┤
│ @tom (2 hours ago)          [Apply] │
│   1. README.md                      │
│   2. tests/engine.test.ts           │
│   3. src/engine.ts                  │
├─────────────────────────────────────┤
│ @sarah (30 min ago)         [Apply] │
│   1. tests/engine.test.ts           │
│   2. src/engine.ts                  │
│   3. README.md                      │
└─────────────────────────────────────┘
```

## Success Metrics

### Phase 1 (MVP)
- **Adoption**: 30% of team uses extension within 2 weeks
- **Engagement**: Average 2+ custom orders per PR
- **Consensus**: 60%+ of PRs reach order consensus

### Phase 2 (Smart Defaults)
- **Satisfaction**: 80% prefer smart default over alphabetical
- **Efficiency**: 20% reduction in "back to top" scrolling
- **Accuracy**: Smart default matches consensus 50%+ of time

### Phase 3 (Learning)
- **Time savings**: 15% faster code review cycles
- **Learning effectiveness**: ML order matches human 70%+ of time

## Development Phases

### Phase 1: Manual Reordering + Democracy (2-3 weeks)
**Deliverables:**
- Chrome extension with basic reorder UI
- GitHub comment storage implementation
- Consensus calculation algorithm
- Order viewer modal
- E2E test coverage

**Success Criteria:**
- Can reorder files via drag-and-drop
- Orders persist in PR comments
- Consensus auto-applies when 2+ orders exist
- Works on github.com and GitHub Enterprise Cloud

### Phase 2: Smart Defaults (2-3 weeks)
**Deliverables:**
- 4 sorting algorithms implemented
- Settings page for algorithm selection
- Algorithm performance comparison UI
- Documentation for each strategy

**Success Criteria:**
- Algorithms produce non-alphabetical orderings
- Users can switch strategies in settings
- Algorithms handle edge cases (new files, renames)

### Phase 3: Learning System (4-6 weeks)
**Deliverables:**
- Event tracking system
- Pattern analysis engine
- ML-based ordering suggestions
- Analytics dashboard

**Success Criteria:**
- System learns from 50+ PR ordering sessions
- Suggestions outperform Phase 2 algorithms
- Analytics show measurable review time impact

## Technical Considerations

### Browser Compatibility
- Primary: Chrome 120+
- Future: Firefox, Edge (Manifest V3 compatible)

### GitHub Compatibility
- github.com (primary)
- GitHub Enterprise Cloud (tested)
- GitHub Enterprise Server (untested, likely works)

### Performance
- Extension load time: <100ms
- Consensus calculation: <50ms for 100 files
- DOM manipulation: <200ms for reordering

### Security
- No external network requests
- No sensitive data collection
- GitHub session cookies only (read-only for comments)

### Privacy
- All data stored in public GitHub comments or local browser storage
- No tracking or analytics to external services
- Users control all data via GitHub permissions

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| GitHub DOM changes break extension | High | Comprehensive selectors, graceful degradation, automated testing, DOM change detection |
| Comment spam concerns | Medium | Hidden comments, compression, version tracking, rate limiting |
| Consensus conflicts | Low | Clear UI showing all orders, easy switching, confidence scores |
| Performance with large PRs (500+ files) | Medium | Virtual scrolling, lazy loading, algorithm optimization, caching |
| Users without write permissions | Low | Local storage fallback, share via URL, export/import functionality |
| **NEW**: XSS vulnerabilities | High | Shadow DOM isolation, strict CSP, input sanitization |
| **NEW**: Race conditions with dynamic loading | Medium | MutationObserver, debounced re-parsing, operation queuing |
| **NEW**: No user onboarding | Medium | First-time tutorial, inline help, empty states with guidance |
| **NEW**: Lack of error feedback | Medium | Toast notifications, loading states, user-friendly error messages |

## Future Enhancements

**Post-Phase 3:**
- Browser extension for Firefox, Safari
- Integration with GitHub CLI
- API for programmatic ordering
- Slack/Teams bot for sharing orders
- VS Code extension for pre-commit ordering
- Analytics on team review patterns
- Custom sorting rule builder (no-code)
- Import/export ordering templates

## Open Questions

1. Should we support GitHub Enterprise Server? (Requires testing)
2. How to handle file renames between order save and apply?
3. Should consensus require minimum threshold (e.g., 3+ orders)?
4. Rate limiting for comment posting (GitHub API limits)?
5. Versioning strategy for comment format changes?
6. **NEW**: Should we add TypeScript for type safety? (Trade-off: complexity vs safety)
7. **NEW**: What's the maximum PR size we should support? (500? 1000 files?)
8. **NEW**: Should we implement conflict resolution when orders diverge significantly?
9. **NEW**: How to handle accessibility for screen readers with dynamic reordering?
10. **NEW**: Should annotations be part of consensus or separate?

## Appendix

### Related Work
- GitHub file tree sidebar (doesn't solve review order)
- ReviewNB (Jupyter notebook reviews, different problem)
- Gerrit's file organization (server-side, not PR-based)

### Research References
- "The Psychology of Code Review" (Microsoft Research)
- "Optimizing Developer Workflows" (Google Engineering Blog)
- Chrome Extension Best Practices (Google Developer Docs)
