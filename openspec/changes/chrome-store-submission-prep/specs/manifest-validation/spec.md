## ADDED Requirements

### Requirement: Manifest SHALL use Manifest V3 format
The extension manifest SHALL comply with Chrome Extension Manifest V3 specification.

#### Scenario: Manifest version is set to 3
- **WHEN** validating manifest.json
- **THEN** "manifest_version" field MUST be set to 3

#### Scenario: Deprecated V2 fields are not used
- **WHEN** reviewing manifest structure
- **THEN** no Manifest V2-only fields (like "browser_action") SHALL be present

### Requirement: Manifest SHALL include all required fields
The manifest SHALL include all fields required by Chrome Web Store for publication.

#### Scenario: Extension name is provided
- **WHEN** validating manifest
- **THEN** "name" field MUST be present and descriptive

#### Scenario: Version number is valid
- **WHEN** validating manifest
- **THEN** "version" field MUST be present and follow semantic versioning (e.g., "0.1.0")

#### Scenario: Description is provided
- **WHEN** validating manifest
- **THEN** "description" field MUST be present and match store listing short description

#### Scenario: Icons are specified
- **WHEN** validating manifest
- **THEN** "icons" field MUST include 16x16, 48x48, and 128x128 sizes

### Requirement: Manifest SHALL specify minimal necessary permissions
The manifest SHALL request only the minimum permissions required for extension functionality.

#### Scenario: Storage permission is justified
- **WHEN** reviewing permissions
- **THEN** "storage" permission MUST be present for storing user file order preferences

#### Scenario: Host permissions are scoped appropriately
- **WHEN** reviewing host_permissions
- **THEN** only "https://github.com/*" SHALL be requested (no broader permissions)

#### Scenario: No excessive permissions are requested
- **WHEN** validating permissions
- **THEN** no unnecessary permissions (like "tabs", "cookies", "webNavigation") SHALL be present

### Requirement: Manifest SHALL include valid Content Security Policy
The manifest SHALL include a Content Security Policy that meets Chrome Web Store security requirements.

#### Scenario: CSP is defined for extension pages
- **WHEN** validating manifest
- **THEN** "content_security_policy.extension_pages" MUST be present and restrictive

#### Scenario: Script sources are restricted
- **WHEN** reviewing CSP
- **THEN** script-src MUST only allow 'self' (no inline scripts, no external domains)

#### Scenario: Object sources are blocked
- **WHEN** reviewing CSP
- **THEN** object-src MUST be set to 'none'

### Requirement: Manifest SHALL reference valid file paths
All file paths referenced in the manifest SHALL exist and be accessible.

#### Scenario: Icon files exist
- **WHEN** validating manifest icons
- **THEN** all referenced icon files (16x16, 48x48, 128x128) MUST exist at specified paths

#### Scenario: Content script files exist
- **WHEN** validating content_scripts
- **THEN** all JS and CSS files referenced MUST exist (dist/content.js, ui/styles.css)

#### Scenario: Popup HTML exists
- **WHEN** validating action.default_popup
- **THEN** popup.html file MUST exist at specified path

### Requirement: Manifest SHALL specify appropriate content script matching
Content scripts SHALL be injected only on relevant GitHub PR pages.

#### Scenario: Content scripts match PR file pages
- **WHEN** validating content_scripts.matches
- **THEN** patterns MUST include GitHub PR URLs (*/pull/*, */pull/*/files)

#### Scenario: Content scripts use appropriate timing
- **WHEN** reviewing content script injection
- **THEN** "run_at" MUST be set to "document_idle" for DOM stability

### Requirement: Manifest SHALL be machine-readable and valid JSON
The manifest file SHALL be valid JSON with proper formatting.

#### Scenario: Manifest is valid JSON
- **WHEN** parsing manifest.json
- **THEN** file MUST be valid JSON without syntax errors

#### Scenario: Required fields are properly typed
- **WHEN** validating field types
- **THEN** version MUST be string, manifest_version MUST be number, permissions MUST be array

### Requirement: Manifest validation SHALL be automated
The manifest validation process SHALL include automated checks to catch common errors.

#### Scenario: JSON schema validation is available
- **WHEN** preparing for submission
- **THEN** an automated validation script MUST verify manifest against Manifest V3 schema

#### Scenario: File path validation is automated
- **WHEN** running validation checks
- **THEN** validation script MUST verify all referenced files exist

#### Scenario: Permission minimization is checked
- **WHEN** running validation checks
- **THEN** validation MUST flag any permissions not explicitly justified in documentation
