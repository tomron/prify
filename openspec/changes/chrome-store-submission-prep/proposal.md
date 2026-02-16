## Why

The PR File Reorder extension is ready for broader adoption beyond the internal team. To publish on the Chrome Web Store, we need to ensure all submission requirements are met: validated manifest, store assets (icons, screenshots, descriptions), privacy policy, and compliance with Chrome Web Store policies. This enables wider distribution and testing with external teams.

## What Changes

- Create Chrome Web Store listing assets (store icons, promotional images, screenshots)
- Write store listing copy (title, short description, detailed description)
- Create privacy policy document
- Validate manifest.json meets all Chrome Web Store requirements
- Add screenshot generation workflow for store listing
- Create submission checklist documentation
- Set up store account and prepare for initial submission

## Capabilities

### New Capabilities
- `store-listing`: Store presence assets including title, descriptions, icons, screenshots, and promotional images
- `privacy-compliance`: Privacy policy document and data handling disclosures required by Chrome Web Store
- `manifest-validation`: Ensure manifest.json meets Chrome Web Store technical requirements and policies
- `submission-workflow`: Documentation and checklist for Chrome Web Store submission process

### Modified Capabilities
<!-- No existing capabilities require requirement changes -->

## Impact

**New Files**:
- `store/` directory with listing assets (icons, screenshots, descriptions)
- `PRIVACY.md` privacy policy document
- `docs/CHROME_STORE_SUBMISSION.md` submission guide

**Modified Files**:
- `manifest.json` - validation and potential adjustments for store compliance
- `README.md` - add Chrome Web Store installation link (after publication)

**Dependencies**:
- Chrome Web Store Developer account (one-time $5 registration fee)
- Store listing assets (icons in multiple sizes, screenshots, promotional images)

**Systems Affected**:
- Extension distribution model (adds Chrome Web Store alongside manual installation)
- Documentation (adds store-specific docs)
