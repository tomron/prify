## ADDED Requirements

### Requirement: Search state feedback

The modal SHALL provide clear visual feedback for all search and filter states.

#### Scenario: User types in search box

- **WHEN** user types in the search input field
- **THEN** the file list updates to show only matching files
- **AND** the file count shows "X of Y files" where X is filtered count and Y is total
- **AND** the clear button (×) appears when search text is non-empty

#### Scenario: Search returns no results

- **WHEN** user's search query matches zero files
- **THEN** an empty state message is displayed: "No files match your search"
- **AND** the file count shows "0 of Y files"
- **AND** the empty state includes guidance to "Try a different search term"

#### Scenario: User clears search

- **WHEN** user clicks the clear button (×) or presses ESC in search field
- **THEN** the search input is cleared
- **AND** all files are shown again
- **AND** the file count shows "Y files" (total count)
- **AND** the clear button (×) is hidden

#### Scenario: Search results are highlighted

- **WHEN** search query matches files
- **THEN** matching text within file paths is highlighted
- **AND** highlights use a visually distinct color (yellow background)
- **AND** highlights are HTML-escaped to prevent XSS

### Requirement: Empty state messaging

The modal SHALL display contextual empty state messages when appropriate.

#### Scenario: PR has no files (edge case)

- **WHEN** PR contains zero files
- **THEN** an empty state message is displayed: "No files to reorder"
- **AND** the message includes explanation: "This PR has no changed files"
- **AND** the save button is disabled

#### Scenario: Import has no matching files

- **WHEN** user imports an order JSON but no paths match current PR files
- **THEN** a warning notification is shown: "No matching files found in import"
- **AND** the file list remains in its current order
- **AND** the user can continue editing

### Requirement: Operation loading states

The modal SHALL show loading indicators for async operations.

#### Scenario: User exports order

- **WHEN** user clicks the Export button
- **THEN** the button shows a spinner icon and text "Exporting..."
- **AND** the button is disabled to prevent double-clicks
- **AND** after completion, the button returns to "📥 Export" state

#### Scenario: User imports order

- **WHEN** user selects a file to import
- **THEN** the import button shows a spinner and text "Importing..."
- **AND** the button is disabled during processing
- **AND** after completion, the button returns to "📤 Import" state

#### Scenario: User shares order

- **WHEN** user clicks the Share button
- **THEN** the button shows a spinner and text "Generating..."
- **AND** the button is disabled during URL generation
- **AND** after completion, the button returns to "🔗 Share" state

#### Scenario: Async operation fails

- **WHEN** an async operation (export/import/share) fails
- **THEN** the button returns to its original state immediately
- **AND** an error notification is displayed (per error-feedback spec)
- **AND** the button remains enabled so user can retry

### Requirement: File count display

The modal SHALL display a clear count of visible vs. total files.

#### Scenario: No search active

- **WHEN** search field is empty
- **THEN** file count displays "Y files" where Y is total file count
- **AND** count is displayed in the header area below the search bar

#### Scenario: Search is active

- **WHEN** search field contains text
- **THEN** file count displays "X of Y files" where X is filtered count
- **AND** if X < Y, the count is styled to indicate filtering is active

### Requirement: Preset application feedback

The modal SHALL provide feedback when quick sort presets are applied.

#### Scenario: User selects a preset

- **WHEN** user selects a preset from the dropdown
- **THEN** the file list reorders immediately
- **AND** a subtle visual indication shows the reorder happened (brief highlight)
- **AND** the dropdown remains open for additional selections

#### Scenario: Preset application fails

- **WHEN** a preset fails to apply (e.g., missing metadata)
- **THEN** an error notification is shown: "Failed to apply preset"
- **AND** the file list remains in its previous order
- **AND** the preset dropdown resets to "Choose a preset..."

### Requirement: Visual hierarchy and design

The modal SHALL use clear visual hierarchy to guide user attention.

#### Scenario: Modal displays proper visual hierarchy

- **WHEN** modal is open
- **THEN** the title is prominently displayed with larger, bolder typography
- **AND** search bar is visually distinct with border and background
- **AND** file list has clear item separation (borders or spacing)
- **AND** buttons use consistent sizing and spacing
- **AND** primary action (Save) is visually emphasized vs. secondary actions

#### Scenario: File items show clear visual structure

- **WHEN** file list is displayed
- **THEN** drag handles are visually distinct (icon or grip pattern)
- **AND** file paths are the primary visual element (largest text)
- **AND** change stats (+/-) are smaller and color-coded (green/red)
- **AND** items have adequate spacing (minimum 8px between items)

### Requirement: Responsive design

The modal SHALL adapt gracefully to smaller screen sizes.

#### Scenario: Modal on narrow screen (<600px)

- **WHEN** browser width is less than 600px
- **THEN** modal padding is reduced from 32px to 16px
- **AND** footer buttons stack vertically instead of horizontally
- **AND** file item height is reduced to 40px (from 48px)
- **AND** file path font size is reduced to 13px (from 14px)
- **AND** all functionality remains accessible

#### Scenario: Long file paths wrap gracefully

- **WHEN** file paths exceed the available width
- **THEN** paths wrap to multiple lines instead of being cut off
- **AND** wrapped paths maintain readability with proper line height
