## 1. Setup and Foundation

- [x] 1.1 Review existing modal code and identify CSS class naming conventions
- [x] 1.2 Create CSS variable definitions for GitHub color palette references
- [x] 1.3 Set up spacing tokens (4px grid: 4, 8, 12, 16, 24, 32px)
- [x] 1.4 Define animation timing constants (200ms, 250ms, 300ms)

## 2. Visual Design Enhancements

- [x] 2.1 Add enhanced typography styles (font sizes, weights, line heights)
- [x] 2.2 Implement subtle box shadows for modal and items (0 2px 8px rgba(0,0,0,0.1))
- [x] 2.3 Add border radius styling (6px for modal, 4px for items)
- [x] 2.4 Style drag handles with clear visual affordance (icon or grip pattern)
- [x] 2.5 Improve file path text styling (hierarchy, color, sizing)
- [x] 2.6 Style change stats (+/-) with color coding (green/red) and smaller size
- [x] 2.7 Add proper spacing between file items (minimum 8px)
- [x] 2.8 Style buttons with consistent sizing, padding, and visual hierarchy
- [x] 2.9 Emphasize primary action (Save) button vs secondary actions
- [x] 2.10 Enhance search bar visual styling (border, background, padding)

## 3. Modal Animations

- [x] 3.1 Add modal entry animation (opacity + scale 0.95→1.0, 250ms)
- [x] 3.2 Add modal exit animation (opacity + scale 1.0→0.95, 200ms)
- [x] 3.3 Update modal open/close logic to trigger animation classes
- [x] 3.4 Ensure focus moves to first item after entry animation completes
- [x] 3.5 Ensure focus returns to trigger button after exit animation completes

## 4. Drag-and-Drop Animations

- [x] 4.1 Add drag lift animation (scale 1.02, translateY -2px, box-shadow, 200ms)
- [x] 4.2 Apply will-change hint on dragstart for GPU acceleration
- [x] 4.3 Add drag-over indicator animation (translateX 8px, 150ms)
- [x] 4.4 Add drop completion animation (smooth transition to new position)
- [x] 4.5 Add drag cancel animation (return to original position)
- [x] 4.6 Remove will-change hint after animations complete
- [x] 4.7 Test that animations don't interfere with drop detection

## 5. Micro-Interactions

- [x] 5.1 Add button hover transitions (background color, 100ms)
- [x] 5.2 Add button click effect (scale 0.98, 100ms)
- [x] 5.3 Add file item hover transition (background color, 100ms)
- [x] 5.4 Add preset dropdown interaction feedback
- [x] 5.5 Add smooth transitions for all interactive elements

## 6. Search and Filter Feedback

- [x] 6.1 Add file count display element in header ("X of Y files" format)
- [x] 6.2 Update file count when search input changes
- [x] 6.3 Show/hide clear button (×) based on search input state
- [x] 6.4 Style clear button with proper hover and click states
- [x] 6.5 Implement search result highlighting with yellow background
- [x] 6.6 Ensure highlighted text is HTML-escaped (security)
- [x] 6.7 Style filtered count differently when X < Y (indicate active filter)

## 7. Empty States

- [x] 7.1 Create empty state component structure (icon + primary + secondary text)
- [x] 7.2 Implement "No files match your search" empty state
- [x] 7.3 Add guidance text: "Try a different search term"
- [x] 7.4 Implement "No files to reorder" empty state (edge case)
- [x] 7.5 Add explanation: "This PR has no changed files"
- [x] 7.6 Disable save button when no files present
- [x] 7.7 Style empty states with proper spacing and visual hierarchy

## 8. Loading States

- [x] 8.1 Create loading spinner component (CSS-only animation)
- [x] 8.2 Add loading state to Export button (spinner + "Exporting..." text)
- [x] 8.3 Add loading state to Import button (spinner + "Importing..." text)
- [x] 8.4 Add loading state to Share button (spinner + "Generating..." text)
- [x] 8.5 Disable buttons during loading to prevent double-clicks
- [x] 8.6 Restore button original state after operation completes/fails
- [x] 8.7 Ensure loading states work for both success and error outcomes

## 9. Enhanced Notifications

- [x] 9.1 Extend showNotification to support 'success' type (green styling)
- [x] 9.2 Extend showNotification to support 'warning' type (yellow/orange styling)
- [x] 9.3 Implement auto-dismiss for success/info (3-5 seconds)
- [x] 9.4 Keep error/warning notifications persistent until manual dismiss
- [x] 9.5 Add notification stacking (vertical, non-overlapping)
- [x] 9.6 Make each notification independently dismissible
- [x] 9.7 Add smooth position adjustment when notifications are dismissed
- [x] 9.8 Pause auto-dismiss timer on hover
- [x] 9.9 Add success notifications for export/import/share operations
- [x] 9.10 Add warning notification for partial import matches

## 10. Accessibility - ARIA Live Regions

- [x] 10.1 Add aria-live="polite" region for file count updates
- [x] 10.2 Add aria-live="polite" region for operation status (export/import/share)
- [x] 10.3 Add aria-live="assertive" region for drag operation announcements
- [x] 10.4 Announce search result count changes to screen readers
- [x] 10.5 Announce operation completions to screen readers
- [x] 10.6 Announce item position changes after reordering

## 11. Accessibility - Focus Management

- [x] 11.1 Implement focus trap within modal when open
- [x] 11.2 Ensure Tab key cycles only through modal elements
- [x] 11.3 Store reference to trigger button on modal open
- [x] 11.4 Return focus to trigger button on modal close
- [x] 11.5 Move focus to first file item after modal entry animation
- [x] 11.6 Ensure modal has role="dialog" and aria-modal="true"

## 12. Accessibility - Enhanced Keyboard Navigation

- [x] 12.1 Add Enter key handler to activate "drag mode" on focused item
- [x] 12.2 Add visual indication for drag mode (outline, background change)
- [x] 12.3 Announce "Drag mode activated" to screen readers
- [x] 12.4 Handle arrow keys in drag mode to move item position
- [x] 12.5 Add Space key handler to complete drop in drag mode
- [x] 12.6 Announce "Dropped at position X" to screen readers
- [x] 12.7 Add Esc key handler to cancel drag mode
- [x] 12.8 Announce "Drag cancelled" to screen readers
- [x] 12.9 Ensure existing Ctrl/Cmd + arrow shortcuts still work
- [x] 12.10 Update aria-label after each position change

## 13. Accessibility - Visual Focus Indicators

- [x] 13.1 Add 3px outline style for focused file items
- [x] 13.2 Add 2px outline offset for better visibility
- [x] 13.3 Use GitHub's focus color for outlines
- [x] 13.4 Ensure focus indicators work in light and dark modes
- [x] 13.5 Add focus ring styles for buttons
- [x] 13.6 Add focus indicator for search input (border color change)
- [x] 13.7 Ensure focus indicators are distinct from hover states

## 14. Accessibility - Screen Reader Support

- [x] 14.1 Update file item aria-labels to include position ("path, position X of Y")
- [x] 14.2 Update aria-labels after reordering
- [x] 14.3 Add aria-label to search input ("Search files")
- [x] 14.4 Add aria-label to clear button ("Clear search")
- [x] 14.5 Add aria-label to close button ("Close modal")
- [x] 14.6 Add aria-disabled="true" to disabled buttons
- [x] 14.7 Announce empty state messages to screen readers
- [x] 14.8 Ensure preset dropdown has associated label (for attribute)

## 15. Accessibility - Color Contrast

- [x] 15.1 Verify all text meets 4.5:1 contrast ratio (WCAG AA)
- [x] 15.2 Verify interactive elements meet 3:1 contrast ratio
- [x] 15.3 Verify focus indicators meet 3:1 contrast against background
- [x] 15.4 Test contrast in both light and dark modes
- [x] 15.5 Ensure highlights and color-coded elements have sufficient contrast

## 16. Responsive Design

- [x] 16.1 Add CSS media query for screens < 600px
- [x] 16.2 Reduce modal padding at narrow width (32px → 16px)
- [x] 16.3 Stack footer buttons vertically at narrow width
- [x] 16.4 Reduce file item height at narrow width (48px → 40px)
- [x] 16.5 Reduce font sizes at narrow width (14px → 13px for paths)
- [x] 16.6 Ensure file paths wrap gracefully with proper line height
- [x] 16.7 Test modal functionality at narrow widths

## 17. Reduced Motion Support

- [x] 17.1 Add @media (prefers-reduced-motion: reduce) query
- [x] 17.2 Disable or reduce all animations within reduced motion query
- [x] 17.3 Use instant transitions (0ms duration) when reduced motion active
- [x] 17.4 Ensure all functionality works identically without animations
- [x] 17.5 Test with OS reduced motion setting enabled

## 18. Performance Optimization

- [x] 18.1 Verify only transform and opacity are used in animations
- [x] 18.2 Verify no layout-triggering properties (width, height, top, left) in animations
- [x] 18.3 Test animations maintain 60fps with DevTools Performance panel
- [x] 18.4 Test drag operations with 50+ files for responsiveness
- [x] 18.5 Ensure interaction response time is <50ms
- [x] 18.6 Verify will-change hints are added/removed appropriately
- [x] 18.7 Check CSS bundle size increase (<15KB target)

## 19. Testing and Validation

- [x] 19.1 Test all drag-and-drop interactions with animations
- [x] 19.2 Test search filtering with visual feedback and highlighting
- [x] 19.3 Test all empty states display correctly
- [x] 19.4 Test keyboard navigation (↑↓, Ctrl+↑↓, Enter, Space, Esc)
- [x] 19.5 Test modal open/close animations and focus management
- [x] 19.6 Test all loading states (export, import, share)
- [x] 19.7 Test success and error notifications with auto-dismiss
- [x] 19.8 Test with NVDA screen reader for ARIA announcements
- [x] 19.9 Test with JAWS screen reader for ARIA announcements
- [x] 19.10 Test with VoiceOver screen reader (macOS)
- [x] 19.11 Test color contrast with browser DevTools
- [x] 19.12 Test responsive design at various widths
- [x] 19.13 Test with prefers-reduced-motion enabled
- [x] 19.14 Test in high contrast mode (Windows)
- [x] 19.15 Verify no console errors or warnings

## 20. Code Quality and Documentation

- [x] 20.1 Run npm run lint and fix all errors/warnings
- [x] 20.2 Run npm run format to format code
- [x] 20.3 Add code comments for complex animation logic
- [x] 20.4 Update ARIA attributes with explanatory comments
- [x] 20.5 Document keyboard shortcuts in code comments
- [x] 20.6 Verify all security comments (innerHTML usage) are accurate
- [x] 20.7 Run npm run build to verify bundle builds successfully
- [x] 20.8 Run npm test to verify no tests broken

## 21. Manual QA

- [x] 21.1 Load extension in Chrome and navigate to test PR
- [x] 21.2 Verify modal opens smoothly with animation
- [x] 21.3 Drag and drop files, verify smooth animations
- [x] 21.4 Test search filtering and empty states
- [x] 21.5 Test all keyboard shortcuts work as expected
- [x] 21.6 Test export/import/share operations with loading states
- [x] 21.7 Test preset application with visual feedback
- [x] 21.8 Verify notifications appear and dismiss correctly
- [x] 21.9 Test on PR with 5-10 files (small)
- [x] 21.10 Test on PR with 20-30 files (medium)
- [x] 21.11 Test on PR with 50+ files (large)
- [x] 21.12 Verify performance remains smooth on large PRs
- [x] 21.13 Take screenshots/video for documentation
