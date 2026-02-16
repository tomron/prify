## ADDED Requirements

### Requirement: Smooth drag-and-drop animations

The reorder modal SHALL provide smooth, GPU-accelerated animations for drag-and-drop interactions using CSS transforms and opacity changes only.

#### Scenario: User starts dragging a file item

- **WHEN** user begins dragging a file item
- **THEN** the item scales up slightly (1.02x) and lifts visually with a shadow
- **AND** the transform animation completes within 200ms
- **AND** a will-change hint is applied for GPU acceleration

#### Scenario: User drags over a drop target

- **WHEN** user drags an item over a valid drop target
- **THEN** the drop target shows a visual indicator (subtle translateX shift)
- **AND** the indicator animation completes within 150ms
- **AND** no layout recalculation occurs (transform only)

#### Scenario: User completes the drop

- **WHEN** user releases the dragged item
- **THEN** the item animates to its new position with a smooth transition
- **AND** the will-change hint is removed after animation completes
- **AND** all drag-over indicators are removed from other items

#### Scenario: User cancels drag operation

- **WHEN** user cancels a drag operation (ESC key or drag outside)
- **THEN** the item animates back to its original position
- **AND** all visual drag states are cleared

### Requirement: Modal entry and exit animations

The modal SHALL animate smoothly when opening and closing to reduce jarring transitions.

#### Scenario: Modal opens

- **WHEN** user clicks the reorder button
- **THEN** the modal fades in with opacity transition
- **AND** the modal scales from 0.95 to 1.0
- **AND** the animation completes within 250ms
- **AND** focus moves to the first file item after animation

#### Scenario: Modal closes

- **WHEN** user closes the modal (button, ESC, or overlay click)
- **THEN** the modal fades out with opacity transition
- **AND** the modal scales from 1.0 to 0.95
- **AND** the animation completes within 200ms
- **AND** focus returns to the trigger button after animation

### Requirement: Micro-interactions for UI elements

Interactive elements SHALL provide visual feedback through subtle animations to improve perceived responsiveness.

#### Scenario: User hovers over a button

- **WHEN** user hovers over any button
- **THEN** the button shows a subtle background color transition
- **AND** the transition completes within 100ms

#### Scenario: User clicks a button

- **WHEN** user clicks a button
- **THEN** the button shows a subtle scale-down effect (0.98x)
- **AND** the effect completes within 100ms

#### Scenario: User hovers over a file item

- **WHEN** user hovers over a file item (not dragging)
- **THEN** the item shows a subtle background color change
- **AND** the transition completes within 100ms

### Requirement: Reduced motion support

The modal SHALL respect user preferences for reduced motion to ensure accessibility.

#### Scenario: User has reduced motion preference enabled

- **WHEN** user has `prefers-reduced-motion: reduce` set in their OS
- **THEN** all animations are disabled or reduced to instant transitions
- **AND** functionality remains identical (only visual timing changes)
- **AND** drag-and-drop still works without animations

### Requirement: Animation performance

All animations SHALL be performant and not cause jank or frame drops.

#### Scenario: Animations run on the GPU

- **WHEN** any animation is active
- **THEN** only `transform` and `opacity` properties are animated
- **AND** no layout-triggering properties (width, height, top, left) are animated
- **AND** animations run on the compositor thread

#### Scenario: Long file lists maintain 60fps

- **WHEN** modal contains 50+ files
- **THEN** all animations maintain at least 60fps
- **AND** drag operations remain responsive (<50ms to visual feedback)
