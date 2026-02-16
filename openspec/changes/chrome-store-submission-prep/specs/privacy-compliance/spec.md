## ADDED Requirements

### Requirement: Privacy policy SHALL exist and be publicly accessible
The extension SHALL have a privacy policy document that is publicly accessible via a stable URL.

#### Scenario: Privacy policy file exists
- **WHEN** preparing for Chrome Web Store submission
- **THEN** `PRIVACY.md` file MUST exist in the project root

#### Scenario: Privacy policy is accessible online
- **WHEN** submitting to Chrome Web Store
- **THEN** privacy policy MUST be accessible via GitHub URL (https://github.com/tomron/prify/blob/main/PRIVACY.md)

#### Scenario: Privacy policy URL is stable
- **WHEN** privacy policy URL is provided to Chrome Web Store
- **THEN** URL MUST remain valid and accessible for the lifetime of the extension

### Requirement: Privacy policy SHALL disclose data collection practices
The privacy policy SHALL clearly explain what data the extension collects, how it's used, and where it's stored.

#### Scenario: Data collection is disclosed
- **WHEN** users read the privacy policy
- **THEN** policy MUST explicitly state that no personal data is collected or transmitted to external servers

#### Scenario: Local storage usage is explained
- **WHEN** users read the privacy policy
- **THEN** policy MUST explain that file order preferences are stored in browser localStorage only

#### Scenario: GitHub comment storage is explained
- **WHEN** users read the privacy policy
- **THEN** policy MUST explain that file orders are stored as GitHub PR comments and subject to GitHub's privacy policy

### Requirement: Privacy policy SHALL disclose permissions usage
The privacy policy SHALL explain why each Chrome extension permission is required and how it's used.

#### Scenario: Storage permission is explained
- **WHEN** users review permissions
- **THEN** privacy policy MUST explain that "storage" permission is used for local file order preferences

#### Scenario: Host permissions are explained
- **WHEN** users review permissions
- **THEN** privacy policy MUST explain that "github.com" host permission is required to access and reorder PR file lists

#### Scenario: No excessive permissions are requested
- **WHEN** reviewing manifest permissions
- **THEN** only necessary permissions SHALL be requested (storage, github.com host access)

### Requirement: Privacy policy SHALL provide contact information
The privacy policy SHALL include contact information for privacy-related inquiries.

#### Scenario: Contact email is provided
- **WHEN** users have privacy questions
- **THEN** privacy policy MUST include a valid email address for privacy inquiries

#### Scenario: GitHub issues link is provided
- **WHEN** users want to report privacy concerns
- **THEN** privacy policy MUST reference GitHub issues as an alternative contact method

### Requirement: Privacy policy SHALL comply with Chrome Web Store requirements
The privacy policy SHALL meet all Chrome Web Store privacy policy requirements for extensions.

#### Scenario: Policy covers all required sections
- **WHEN** Chrome Web Store reviews privacy policy
- **THEN** policy MUST include sections for: data collection, data usage, data storage, third-party sharing, and user rights

#### Scenario: Third-party data sharing is addressed
- **WHEN** users review third-party sharing
- **THEN** policy MUST explicitly state that no data is shared with third parties except GitHub (as the PR comment storage platform)

#### Scenario: User rights are documented
- **WHEN** users want to know their rights
- **THEN** policy MUST explain that users can delete their local data via browser settings and remove PR comments via GitHub

### Requirement: Privacy policy SHALL be maintained and updated
The privacy policy SHALL be reviewed and updated whenever extension functionality or data practices change.

#### Scenario: Version control tracks changes
- **WHEN** privacy policy is updated
- **THEN** changes MUST be tracked via git commits with clear commit messages

#### Scenario: Update process is documented
- **WHEN** functionality changes require policy updates
- **THEN** submission workflow documentation MUST include privacy policy review as a required step
