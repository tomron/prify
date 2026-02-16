## ADDED Requirements

### Requirement: ARIA live regions for status updates

The modal SHALL use ARIA live regions to announce dynamic content changes to screen readers.

#### Scenario: Search results count changes

- **WHEN** user types in search and results are filtered
- **THEN** the file count is announced via an `aria-live="polite"` region
- **AND** the announcement includes "X of Y files" or "No files match your search"

#### Scenario: Operation completes

- **WHEN** an async operation completes (export/import/share)
- **THEN** the success message is announced via `aria-live="polite"`
- **AND** the announcement includes the operation result (e.g., "Order exported successfully")

#### Scenario: File order changes

- **WHEN** user reorders files via drag-and-drop or preset
- **THEN** the new position is announced (e.g., "Moved to position 3")
- **AND** announcement is made via `aria-live="assertive"` for immediate feedback

### Requirement: Focus management

The modal SHALL manage focus properly to ensure keyboard navigation works as expected.

#### Scenario: Modal opens

- **WHEN** modal is opened
- **THEN** focus moves to the first file item in the list
- **AND** focus is trapped within the modal (Tab cycles through modal elements only)
- **AND** the modal has `role="dialog"` and `aria-modal="true"`

#### Scenario: Modal closes

- **WHEN** modal is closed
- **THEN** focus returns to the element that triggered the modal (reorder button)
- **AND** focus trap is removed
- **AND** modal is removed from the DOM or hidden with `display: none`

#### Scenario: Search input receives focus via keyboard

- **WHEN** user presses Ctrl+K or / (forward slash)
- **THEN** focus moves to the search input
- **AND** any existing search text is selected for easy replacement
- **AND** the keyboard shortcut is documented in placeholder text

### Requirement: Enhanced keyboard navigation

The modal SHALL support comprehensive keyboard navigation for all interactions.

#### Scenario: Navigate between file items

- **WHEN** user presses ↑ or ↓ arrow keys
- **THEN** focus moves to the previous/next file item
- **AND** the focused item has a visible focus indicator (3px outline)
- **AND** focus wraps to the other end of the list when reaching boundaries

#### Scenario: Reorder file with keyboard

- **WHEN** user presses Ctrl/Cmd + ↑ or ↓ on a focused file item
- **THEN** the item moves up or down one position
- **AND** focus remains on the moved item
- **AND** the new position is announced to screen readers
- **AND** aria-label is updated to reflect new position

#### Scenario: Activate drag with keyboard

- **WHEN** user presses Enter on a focused file item
- **THEN** the item enters "drag mode" (visual indication)
- **AND** screen reader announces "Drag mode activated, use arrow keys to move"

#### Scenario: Move item in drag mode

- **WHEN** user presses ↑ or ↓ in drag mode
- **THEN** the item moves up or down one position
- **AND** the new position is previewed visually

#### Scenario: Complete drag with keyboard

- **WHEN** user presses Space or Enter in drag mode
- **THEN** the item is dropped at the current position
- **AND** drag mode is exited
- **AND** screen reader announces "Dropped at position X"

#### Scenario: Cancel drag with keyboard

- **WHEN** user presses Esc in drag mode
- **THEN** the item returns to its original position
- **AND** drag mode is exited
- **AND** screen reader announces "Drag cancelled"

### Requirement: Visual focus indicators

The modal SHALL provide clear visual indicators for keyboard focus.

#### Scenario: File item receives focus

- **WHEN** a file item is focused via keyboard
- **THEN** the item shows a 3px outline in GitHub's focus color
- **AND** the outline has 2px offset from the item boundary
- **AND** the outline is visible in both light and dark modes

#### Scenario: Button receives focus

- **WHEN** a button receives keyboard focus
- **THEN** the button shows a focus ring matching GitHub's focus style
- **AND** the ring is visible and distinct from hover state

#### Scenario: Search input receives focus

- **WHEN** search input receives focus
- **THEN** the input shows a focus ring or border color change
- **AND** the focus indicator is clearly visible

### Requirement: Screen reader announcements

The modal SHALL provide comprehensive screen reader support with proper ARIA labels.

#### Scenario: Modal structure is announced

- **WHEN** modal opens and focus moves to first item
- **THEN** screen reader announces the modal title "Reorder Files"
- **AND** announces the total number of files
- **AND** announces the current focused item and its position

#### Scenario: File item is announced

- **WHEN** user navigates to a file item
- **THEN** screen reader announces the file path
- **AND** announces the position (e.g., "position 3 of 15")
- **AND** announces change stats if available ("+10 -5 lines")
- **AND** announces drag handle as "draggable"

#### Scenario: Empty state is announced

- **WHEN** search results in no matches or PR has no files
- **THEN** the empty state message is announced
- **AND** guidance text is included in the announcement

### Requirement: Accessible search functionality

The search feature SHALL be fully accessible to screen reader and keyboard users.

#### Scenario: Search input has proper labels

- **WHEN** search input is rendered
- **THEN** it has `aria-label="Search files"`
- **AND** placeholder text indicates keyboard shortcuts
- **AND** the clear button has `aria-label="Clear search"`

#### Scenario: Search shortcuts are documented

- **WHEN** user focuses on search input
- **THEN** placeholder shows "Search files... (Ctrl+K or /)"
- **AND** shortcuts work as expected
- **AND** shortcuts don't conflict with browser defaults

### Requirement: Accessible buttons and controls

All interactive elements SHALL have proper accessible names and roles.

#### Scenario: Buttons have accessible names

- **WHEN** modal is rendered
- **THEN** all buttons have descriptive accessible names
- **AND** icon-only buttons (close, clear) have `aria-label` attributes
- **AND** disabled buttons have `aria-disabled="true"`

#### Scenario: Preset dropdown is accessible

- **WHEN** preset dropdown is rendered
- **THEN** it has a visible label "Quick sort:"
- **AND** label is associated with `<select>` via `for` attribute
- **AND** options have descriptive text
- **AND** keyboard navigation (↑↓) works in the dropdown

### Requirement: Color contrast compliance

All text and interactive elements SHALL meet WCAG 2.1 AA contrast requirements.

#### Scenario: Normal text has sufficient contrast

- **WHEN** modal is displayed in light or dark mode
- **THEN** all text has minimum 4.5:1 contrast ratio
- **AND** file paths are easily readable

#### Scenario: Interactive elements have sufficient contrast

- **WHEN** buttons, links, and controls are displayed
- **THEN** all interactive elements have minimum 3:1 contrast ratio
- **AND** focus indicators have minimum 3:1 contrast against background

### Requirement: High contrast mode support

The modal SHALL remain usable in high contrast mode.

#### Scenario: Windows High Contrast Mode

- **WHEN** user enables Windows High Contrast Mode
- **THEN** all text and borders remain visible
- **AND** focus indicators are clearly visible
- **AND** all functionality works identically
