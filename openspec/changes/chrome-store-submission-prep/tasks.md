## 1. Store Directory Setup

- [x] 1.1 Create `store/` directory structure (icons/, screenshots/, promotional/)
- [x] 1.2 Create `store/README.md` documenting asset requirements and update process
- [x] 1.3 Verify directory structure matches design document

## 2. Store Listing Content

- [x] 2.1 Create `store/listing.md` with extension title (must match manifest.json)
- [x] 2.2 Write short description (132 char max) in `store/listing.md`
- [x] 2.3 Write detailed description with features and usage instructions in `store/listing.md`
- [x] 2.4 Specify category (Developer Tools) in `store/listing.md`
- [x] 2.5 Review listing copy for accuracy and clarity

## 3. Store Icons

- [x] 3.1 Verify existing 128x128 icon meets Chrome Web Store design guidelines
- [x] 3.2 Copy 128x128 icon to `store/icons/` directory
- [x] 3.3 Test icon visibility on light and dark backgrounds
- [x] 3.4 Document icon source files in `store/README.md`

## 4. Screenshots

- [x] 4.1 Identify test PR to use for screenshots (20-30 files, realistic content)
- [x] 4.2 Document screenshot generation process in `store/README.md` (zoom level, window size)
- [ ] 4.3 Take screenshot 1: Default GitHub PR files view
- [ ] 4.4 Take screenshot 2: Reorder modal open with drag-and-drop in action
- [ ] 4.5 Take screenshot 3: File list after reordering applied
- [ ] 4.6 Take screenshot 4: Order viewer modal showing multiple user orders (optional)
- [ ] 4.7 Take screenshot 5: Consensus ordering visualization (optional)
- [ ] 4.8 Resize screenshots to 1280x800 or 640x400
- [ ] 4.9 Save screenshots to `store/screenshots/` with descriptive names
- [ ] 4.10 Verify screenshots accurately represent extension functionality

## 5. Promotional Images

- [ ] 5.1 Create 440x280 small promotional tile image
- [ ] 5.2 Save promotional image to `store/promotional/`
- [ ] 5.3 Verify promotional image shows actual extension UI (not mockup)

## 6. Privacy Policy

- [x] 6.1 Create `PRIVACY.md` in project root
- [x] 6.2 Add "Data Collection" section stating zero data collection/transmission
- [x] 6.3 Add "Local Storage" section explaining localStorage usage for preferences
- [x] 6.4 Add "GitHub Comment Storage" section explaining PR order storage in GitHub comments
- [x] 6.5 Add "Permissions" section explaining storage and github.com host permissions
- [x] 6.6 Add "Third-Party Sharing" section (GitHub only, as comment storage platform)
- [x] 6.7 Add "User Rights" section explaining data deletion via browser/GitHub
- [x] 6.8 Add contact information (email and GitHub issues link)
- [x] 6.9 Verify privacy policy is accessible at GitHub URL
- [x] 6.10 Review privacy policy against Chrome Web Store requirements

## 7. Manifest Validation

- [x] 7.1 Verify manifest_version is 3
- [x] 7.2 Verify name, version, description fields are present and accurate
- [x] 7.3 Verify icons field includes 16x16, 48x48, 128x128 sizes
- [x] 7.4 Verify all icon files exist at specified paths
- [x] 7.5 Verify permissions include only "storage" (no excessive permissions)
- [x] 7.6 Verify host_permissions include only "https://github.com/*"
- [x] 7.7 Verify content_security_policy is set correctly
- [x] 7.8 Verify content_scripts reference existing files (dist/content.js, ui/styles.css)
- [x] 7.9 Verify popup.html exists at specified path
- [x] 7.10 Create automated validation script (optional but recommended)
- [x] 7.11 Run validation checks and fix any issues

## 8. Submission Documentation

- [x] 8.1 Create `docs/CHROME_STORE_SUBMISSION.md`
- [x] 8.2 Document pre-submission checklist section
- [x] 8.3 Document Developer account setup section (registration, $5 fee)
- [x] 8.4 Document initial submission process section (create listing, upload ZIP)
- [x] 8.5 Document store listing configuration section (title, descriptions, screenshots)
- [x] 8.6 Document pricing and distribution settings section
- [x] 8.7 Document privacy practices declaration section (Chrome Web Store questionnaire)
- [x] 8.8 Document review process section (timeline, status monitoring)
- [x] 8.9 Document handling review feedback section
- [x] 8.10 Document update submission process section (version increment, triggers)
- [x] 8.11 Document rollback process section
- [x] 8.12 Document troubleshooting section (common rejection reasons)
- [x] 8.13 Add Chrome Web Store developer support links

## 9. Pre-Submission Validation

- [x] 9.1 Run `npm run build` to verify extension builds successfully
- [x] 9.2 Run `npm run lint` to ensure code quality
- [x] 9.3 Run `npm test` to verify all tests pass
- [ ] 9.4 Manually test extension on GitHub PR (load unpacked, test all features)
- [ ] 9.5 Create extension package ZIP file (all files except dev-only files)
- [ ] 9.6 Verify ZIP contains manifest.json, icons, dist/, ui/, popup.html
- [ ] 9.7 Test ZIP by loading as unpacked extension
- [ ] 9.8 Review all assets and documentation against checklists

## 10. README Updates

- [x] 10.1 Add placeholder section in README.md for Chrome Web Store link
- [x] 10.2 Note that Chrome Web Store link will be added after publication
- [x] 10.3 Update installation instructions to mention upcoming store availability

## 11. Final Review

- [ ] 11.1 Review `store/listing.md` content for accuracy and clarity
- [ ] 11.2 Review all screenshots for quality and accuracy
- [ ] 11.3 Review `PRIVACY.md` for completeness and compliance
- [ ] 11.4 Review `docs/CHROME_STORE_SUBMISSION.md` for completeness
- [ ] 11.5 Review manifest.json validation results
- [ ] 11.6 Confirm all pre-submission checklist items are complete
- [ ] 11.7 Commit all changes to feature branch
- [ ] 11.8 Create PR with summary of Chrome Web Store preparation work
