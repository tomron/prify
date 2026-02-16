## ADDED Requirements

### Requirement: Store listing SHALL provide required metadata
The Chrome Web Store listing SHALL include all required metadata fields: extension name, short description, detailed description, category, and language.

#### Scenario: Extension name is provided
- **WHEN** preparing the store listing
- **THEN** extension name MUST match manifest.json name field ("PR File Reorder")

#### Scenario: Short description is provided
- **WHEN** preparing the store listing
- **THEN** short description MUST be concise (132 characters max) and accurately describe core functionality

#### Scenario: Detailed description is provided
- **WHEN** preparing the store listing
- **THEN** detailed description MUST explain features, benefits, and usage instructions in full detail

#### Scenario: Category is selected
- **WHEN** configuring store listing
- **THEN** extension MUST be categorized appropriately (Developer Tools category)

### Requirement: Store listing SHALL include required icon sizes
The store listing SHALL provide extension icons in all required sizes per Chrome Web Store guidelines.

#### Scenario: 128x128 icon is provided
- **WHEN** uploading extension package
- **THEN** extension MUST include 128x128px icon in manifest and as file

#### Scenario: Icons are visually consistent
- **WHEN** icons are displayed in store
- **THEN** all icon sizes MUST maintain visual consistency and brand identity

#### Scenario: Icons meet quality standards
- **WHEN** icons are reviewed
- **THEN** icons MUST be high-resolution, clear, and follow Chrome Web Store design guidelines

### Requirement: Store listing SHALL include promotional images
The store listing SHALL include at least one promotional image to showcase the extension visually.

#### Scenario: Small promotional tile is provided
- **WHEN** store listing is created
- **THEN** at least one 440x280px promotional tile image MUST be provided

#### Scenario: Promotional images show actual functionality
- **WHEN** promotional images are displayed
- **THEN** images MUST accurately represent the extension's actual UI and features

### Requirement: Store listing SHALL include screenshots
The store listing SHALL include screenshots demonstrating the extension's core functionality on GitHub PR pages.

#### Scenario: Minimum screenshot count is met
- **WHEN** uploading store listing
- **THEN** at least 1 screenshot MUST be provided (recommended: 3-5 screenshots)

#### Scenario: Screenshots use correct dimensions
- **WHEN** screenshots are uploaded
- **THEN** screenshots MUST be either 1280x800px or 640x400px

#### Scenario: Screenshots show extension in use
- **WHEN** screenshots are displayed
- **THEN** screenshots MUST show the extension working on actual GitHub PR pages with realistic data

#### Scenario: Screenshots cover key features
- **WHEN** reviewing screenshots
- **THEN** screenshots MUST demonstrate file reordering, drag-and-drop, and consensus ordering features

### Requirement: Store listing content SHALL be stored in version control
All store listing content SHALL be stored in the repository for version control and team collaboration.

#### Scenario: Store directory structure exists
- **WHEN** store assets are created
- **THEN** a `store/` directory MUST exist containing all listing assets

#### Scenario: Listing copy is documented
- **WHEN** store listing is prepared
- **THEN** `store/listing.md` MUST contain extension title, short description, and detailed description

#### Scenario: Asset organization is clear
- **WHEN** team members need to update assets
- **THEN** `store/README.md` MUST document the purpose and requirements of each asset type

### Requirement: Store listing SHALL support updates
The store listing SHALL be designed to support future updates without requiring complete recreation.

#### Scenario: Versioned screenshots are maintained
- **WHEN** UI changes require new screenshots
- **THEN** old screenshots MAY be archived with version labels for reference

#### Scenario: Listing copy can be updated
- **WHEN** feature updates require description changes
- **THEN** `store/listing.md` MUST be updated and changes reflected in Developer Console
