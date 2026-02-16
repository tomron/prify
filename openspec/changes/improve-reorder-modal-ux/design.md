## Context

The reorder modal (`ui/reorder-modal.js`) is a drag-and-drop interface for file reordering in GitHub PRs. It currently uses vanilla JavaScript with basic DOM manipulation and minimal CSS styling. While functional, it lacks the polish and feedback expected in modern web UIs.

**Current State:**
- Basic drag-and-drop with no transition animations
- Minimal visual hierarchy (plain text, simple borders)
- Search functionality exists but provides limited feedback
- No empty state handling
- Basic accessibility (some ARIA attributes)
- All styles in `ui/styles.css`

**Constraints:**
- Must remain vanilla JavaScript (no frameworks)
- Chrome extension context (Manifest V3)
- No external dependencies (pure CSS animations)
- Cannot break existing functionality
- Must maintain current API surface

## Goals / Non-Goals

**Goals:**
- Add smooth, performant CSS animations for all interactions
- Enhance visual design to feel modern and professional
- Provide clear feedback for all user actions and states
- Improve accessibility to WCAG 2.1 AA standards
- Maintain <50ms interaction response time
- Keep bundle size increase under 15KB

**Non-Goals:**
- Not rewriting in a framework (React, Vue, etc.)
- Not adding external animation libraries (GSAP, Anime.js)
- Not changing the modal's core functionality or API
- Not implementing complex gesture controls (pinch, swipe)
- Not adding customizable themes (use GitHub's color palette)

## Decisions

### 1. CSS-only Animations vs JavaScript Animation Library

**Decision:** Use pure CSS transitions and animations with JavaScript class toggles.

**Rationale:**
- **Performance:** CSS animations run on the compositor thread, avoiding main thread jank
- **Bundle size:** Zero dependency cost vs 20-50KB for animation libraries
- **Simplicity:** Easier to maintain and debug
- **Browser support:** CSS transitions work in all modern browsers

**Alternatives considered:**
- **GSAP/Anime.js:** Rejected due to bundle size and unnecessary complexity for simple transitions
- **Web Animations API:** Considered but CSS is simpler and sufficient for our needs

**Trade-off:** Less control over complex timing curves, but our animations are simple enough.

### 2. Animation Performance Strategy

**Decision:** Use transform and opacity only, avoid layout-triggering properties.

**Rationale:**
- `transform` and `opacity` can be GPU-accelerated
- Avoids layout recalculation (no width/height/top/left animations)
- Will-change hints for active drag items
- Remove will-change after animation completes

**Implementation:**
- Drag lift: `transform: scale(1.02) translateY(-2px)` + `box-shadow`
- Drag hover indicator: `transform: translateX(8px)` on drop targets
- Modal entry: `opacity` + `transform: scale(0.95)`

### 3. Visual Hierarchy Approach

**Decision:** Use GitHub's existing color palette and spacing tokens, add subtle shadows and borders.

**Rationale:**
- Consistency with GitHub's UI reduces cognitive load
- Users already familiar with GitHub's design language
- No need to maintain custom color schemes

**Design tokens to use:**
- Colors: `--color-primer-*` variables from GitHub
- Spacing: 4px base grid (4, 8, 12, 16, 24, 32px)
- Shadows: Subtle layering (0 2px 8px rgba(0,0,0,0.1))
- Border radius: 6px for modal, 4px for items

### 4. Empty State Strategy

**Decision:** Show contextual empty state messages with actionable guidance.

**States to handle:**
- No files in PR (shouldn't happen, but defensive)
- All files filtered out by search
- Import operation with no matching files

**Message format:**
```
[Icon] Primary message
Secondary explanation or action
```

### 5. Loading State Pattern

**Decision:** Use inline spinners for async operations (export/import/share).

**Rationale:**
- Buttons remain in place (no layout shift)
- Clear which operation is in progress
- Can disable button to prevent double-clicks

**Implementation:**
- Replace button text with spinner + "Exporting..."
- Disable button during operation
- Restore original state on complete/error

### 6. Accessibility Enhancements

**Decision:** Add comprehensive ARIA live regions, improve focus management, enhance keyboard shortcuts.

**Enhancements:**
- **ARIA live region** for search result counts and operation status
- **Focus trapping** within modal when open
- **Focus return** to trigger button on close
- **Roving tabindex** for file list keyboard navigation
- **Announce** drag operations to screen readers
- **Visual focus indicators** with 3px outline offset

**Keyboard shortcuts:**
- `Ctrl/Cmd + K` or `/` - Focus search (already exists)
- `Ctrl/Cmd + ↑/↓` - Move item (already exists)
- `Enter` - Activate drag (new)
- `Space` - Drop item (new)
- `Esc` - Clear search or close modal (enhanced)

### 7. Responsive Design Approach

**Decision:** Add breakpoints for narrow modals (< 600px width).

**Rationale:**
- Some users may have smaller screens or narrow browser windows
- File paths can be long and should wrap gracefully

**Adjustments at < 600px:**
- Reduce modal padding (32px → 16px)
- Stack footer buttons vertically
- Reduce file item height (48px → 40px)
- Smaller font sizes (14px → 13px for paths)

## Risks / Trade-offs

**[Risk] CSS animations may not work in older browsers**
- **Mitigation:** Feature detection with `@supports` queries. Fall back to instant transitions if unsupported. Chrome extension targets modern Chrome only.

**[Risk] Animation performance issues on low-end devices**
- **Mitigation:** Use GPU-accelerated properties only (transform, opacity). Add `prefers-reduced-motion` media query to disable animations for users who prefer it.

**[Risk] Increased CSS bundle size**
- **Mitigation:** Estimated 8-12KB CSS addition. Acceptable given the UX improvement. Can minify and compress.

**[Risk] ARIA changes might confuse existing screen reader users**
- **Mitigation:** Test with NVDA/JAWS. Ensure changes are additive and don't break existing announcements. Use `aria-live="polite"` for non-critical updates.

**[Risk] Complex drag animations might interfere with drop detection**
- **Mitigation:** Keep animations short (200-300ms). Don't animate during active drag, only on lift/drop. Maintain simple DOM structure.

**[Trade-off] Pure CSS limits animation complexity**
- **Acceptance:** Our animations are simple enough. If we need complex choreography later, we can reconsider.

**[Trade-off] Using GitHub's color palette limits customization**
- **Acceptance:** Consistency with GitHub is more valuable than unique branding.

## Migration Plan

**Deployment:**
1. Add new CSS classes to `ui/styles.css` (non-breaking, classes not yet used)
2. Update `ui/reorder-modal.js` to add animation classes and enhanced ARIA
3. Test manually with screen readers and keyboard navigation
4. No feature flag needed (all changes are visual enhancements)

**Rollback:**
- If critical issues found, can remove animation classes without breaking functionality
- Core drag-and-drop logic unchanged, so reverting is low risk

**Testing checklist:**
- [ ] Drag-and-drop works smoothly with animations
- [ ] Search filtering updates with visual feedback
- [ ] Empty states display correctly
- [ ] Keyboard navigation works with visual focus
- [ ] Screen readers announce state changes
- [ ] `prefers-reduced-motion` disables animations
- [ ] Responsive layout works at narrow widths
- [ ] No performance degradation (check FPS in DevTools)

## Open Questions

1. **Should we add haptic feedback for drag operations?**
   - Probably not - Chrome extension APIs don't support this well
   - Defer until we see user feedback

2. **Should animations be customizable by users?**
   - No - adds complexity for minimal benefit
   - `prefers-reduced-motion` is sufficient for accessibility

3. **Should we add drag-and-drop sound effects?**
   - No - sounds are intrusive in professional settings
   - GitHub doesn't use UI sounds elsewhere
