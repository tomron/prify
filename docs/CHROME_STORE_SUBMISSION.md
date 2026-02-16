# Chrome Web Store Submission Guide

This guide documents the complete process for submitting and updating the PR File Reorder extension on the Chrome Web Store.

## Table of Contents

1. [Pre-Submission Checklist](#pre-submission-checklist)
2. [Developer Account Setup](#developer-account-setup)
3. [Initial Submission Process](#initial-submission-process)
4. [Store Listing Configuration](#store-listing-configuration)
5. [Pricing and Distribution](#pricing-and-distribution)
6. [Privacy Practices Declaration](#privacy-practices-declaration)
7. [Review Process](#review-process)
8. [Handling Review Feedback](#handling-review-feedback)
9. [Update Submission Process](#update-submission-process)
10. [Rollback Process](#rollback-process)
11. [Troubleshooting](#troubleshooting)
12. [Support Resources](#support-resources)

---

## Pre-Submission Checklist

Before submitting to the Chrome Web Store, verify all items are complete:

### Code Quality
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes with zero errors/warnings
- [ ] `npm test` passes all tests
- [ ] Extension tested manually on GitHub PR

### Assets
- [ ] All required store assets created (`store/` directory)
- [ ] 128x128 icon in `store/icons/`
- [ ] 3-5 screenshots in `store/screenshots/` (1280x800 or 640x400)
- [ ] 440x280 promotional tile in `store/promotional/`
- [ ] Store listing copy completed in `store/listing.md`

### Documentation
- [ ] `PRIVACY.md` created and accessible at GitHub URL
- [ ] `README.md` updated with store link placeholder
- [ ] This submission guide reviewed

### Manifest Validation
- [ ] `node scripts/validate-manifest.js` passes
- [ ] All manifest file paths verified
- [ ] Permissions are minimal and justified

### Extension Package
- [ ] ZIP file created with all necessary files
- [ ] ZIP tested by loading as unpacked extension

---

## Developer Account Setup

### Registration

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with Google account (recommend using tomron@gmail.com or team account)
3. Accept Chrome Web Store Developer Agreement
4. Pay one-time $5 registration fee

### Payment

- **Fee:** $5 USD (one-time, non-refundable)
- **Payment Methods:** Credit card, debit card
- **Processing:** Immediate - account active after payment

### Account Verification

- Google may require identity verification for some accounts
- Verification process typically takes 1-2 business days
- Have government-issued ID ready if requested

---

## Initial Submission Process

### Step 1: Create New Extension Listing

1. Navigate to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item" button
3. Upload extension ZIP file (see [Creating Extension Package](#creating-extension-package))
4. Wait for upload to complete and initial automated checks

### Step 2: Creating Extension Package

Create a ZIP file containing:

```bash
# Navigate to project root
cd /Users/tomron/code/prify-chrome-store-prep

# Create ZIP (exclude dev files)
zip -r pr-file-reorder-v0.1.0.zip \
  manifest.json \
  popup.html \
  icons/ \
  dist/ \
  ui/ \
  content/ \
  utils/ \
  -x "*.DS_Store" \
  -x "node_modules/*" \
  -x "tests/*" \
  -x ".git/*" \
  -x "store/*" \
  -x "docs/*"
```

### Step 3: Verify ZIP Contents

Extract and verify the ZIP contains:
- `manifest.json`
- `popup.html`
- `icons/` directory with all icon files
- `dist/content.js` (bundled content script)
- `ui/styles.css`
- `ui/*.js` files
- `content/*.js` files
- `utils/*.js` files

**Do NOT include:**
- `node_modules/`
- `tests/`
- `.git/`
- `store/` (store assets uploaded separately)
- `docs/`
- Development configuration files

---

## Store Listing Configuration

After uploading the ZIP, configure the store listing:

### Product Details

1. **Extension Name:** PR File Reorder (matches manifest.json)
2. **Short Description:** Copy from `store/listing.md` (132 char max)
3. **Detailed Description:** Copy from `store/listing.md`
4. **Category:** Developer Tools
5. **Language:** English (United States)

### Store Listing Assets

1. **Icon:** Upload `store/icons/icon128.png` (128x128)
2. **Screenshots:** Upload all files from `store/screenshots/`
   - Upload in order (01, 02, 03, etc.)
   - Add captions describing each screenshot
3. **Small Promotional Tile:** Upload `store/promotional/promo-440x280.png` (440x280, required)
4. **Marquee Promotional Tile:** Optional (1400x560)
5. **Large Promotional Tile:** Optional (920x680)

### Screenshot Captions

- Screenshot 1: "GitHub PR files in default alphabetical order"
- Screenshot 2: "Drag-and-drop interface for reordering files"
- Screenshot 3: "Files reordered for logical review flow"
- Screenshot 4: "View all team members' file orders"
- Screenshot 5: "Consensus ordering applied automatically"

---

## Pricing and Distribution

### Pricing

- **Model:** Free
- **In-app Purchases:** None
- **Subscription:** None

### Distribution

1. **Visibility:** Public
2. **Geographic Distribution:** All countries
3. **Mature Content:** No
4. **Ads:** No

---

## Privacy Practices Declaration

Chrome Web Store requires completing a privacy questionnaire:

### Data Collection

**Question:** "Does your extension handle personal or sensitive user data?"
**Answer:** No

**Question:** "Does your extension collect user data?"
**Answer:** No

### Data Usage

**Question:** "Does your extension use remotely hosted code?"
**Answer:** No

**Question:** "Does your extension comply with the Chrome Web Store User Data Policy?"
**Answer:** Yes

### Required Fields

1. **Privacy Policy URL:** `https://github.com/tomron/prify/blob/main/PRIVACY.md`
2. **Permissions Justification:**
   - **storage:** Save user file order preferences locally
   - **https://github.com/*:** Access GitHub PR pages to enable file reordering

### Certification

- [ ] Certify that the extension complies with Chrome Web Store policies
- [ ] Certify that privacy policy accurately describes data handling
- [ ] Certify that extension does not collect personal data without disclosure

---

## Review Process

### Submission

1. Review all listing details
2. Click "Submit for Review"
3. Extension enters review queue

### Timeline

- **Typical Duration:** 1-3 business days
- **Complex Reviews:** Up to 7 business days
- **First Submission:** May take longer than updates

### Review Status

Check status in Developer Dashboard:

- **Pending Review:** In queue, not yet assigned to reviewer
- **In Review:** Actively being reviewed
- **Pending Developer Action:** Issues found, requires fixes
- **Approved:** Extension passed review, publishing
- **Published:** Live on Chrome Web Store

### Monitoring

1. Check Developer Dashboard daily for status updates
2. Monitor email for review feedback notifications
3. Be prepared to respond quickly to feedback

---

## Handling Review Feedback

### If Review Finds Issues

1. **Read Feedback Carefully:** Review all comments from Chrome Web Store team
2. **Understand Requirements:** Research cited policies if unclear
3. **Make Required Changes:** Update code, manifest, or listing as needed
4. **Re-upload:** Upload new ZIP with version number unchanged (for resubmission)
5. **Respond:** Add comments explaining changes made
6. **Resubmit:** Click "Resubmit for Review"

### Common Review Issues

- **Permissions Justification:** Explain why each permission is necessary
- **Privacy Policy:** Ensure policy matches actual data handling
- **Screenshots:** Verify screenshots show actual extension (not mockups)
- **Description Accuracy:** Ensure description matches functionality
- **Manifest Compliance:** Fix any manifest.json issues

---

## Update Submission Process

### When to Submit Updates

- Bug fixes
- New features
- Security patches
- UI improvements
- Manifest changes

### Version Numbering

Follow semantic versioning in `manifest.json`:

- **Patch:** 0.1.0 → 0.1.1 (bug fixes)
- **Minor:** 0.1.0 → 0.2.0 (new features, backward compatible)
- **Major:** 0.1.0 → 1.0.0 (breaking changes)

### Update Process

1. **Increment Version:** Update `version` field in `manifest.json`
2. **Build and Test:** Run full test suite
3. **Create ZIP:** Package extension with new version
4. **Upload:** In Developer Dashboard, click "Upload Updated Package"
5. **Update Listing:** Modify descriptions/screenshots if needed
6. **Submit:** Click "Submit for Review"

### What Triggers Re-Review

Full review required for:
- New permissions requested
- Changes to manifest permissions
- Significant functionality changes

Expedited review for:
- Bug fixes with no permission changes
- UI-only updates
- Description updates

### Rolling Updates

- Updates publish to users gradually (phased rollout)
- Monitor error reports during rollout
- Can halt rollout if critical issues discovered

---

## Rollback Process

### Unpublishing Extension

If critical issue found after publication:

1. Go to Developer Dashboard
2. Select the extension
3. Click "More Options" → "Unpublish"
4. Extension removed from store within minutes
5. Existing users keep extension but can't get updates

### Publishing Previous Version

1. Locate previous version ZIP file
2. Increment version number (Chrome requires newer version)
3. Upload as update
4. Submit for expedited review citing critical bug fix

### Emergency Contacts

For critical security issues:
- **Chrome Web Store Support:** Use Developer Dashboard support link
- **Security Issues:** Report at https://www.google.com/about/appsecurity/

---

## Troubleshooting

### Common Rejection Reasons

1. **Permissions Not Justified**
   - **Fix:** Add clear justification in Privacy Practices section
   - **Prevention:** Only request necessary permissions

2. **Privacy Policy Insufficient**
   - **Fix:** Ensure PRIVACY.md covers all data handling
   - **Prevention:** Review Chrome Web Store Privacy Policy requirements

3. **Screenshots Don't Match Extension**
   - **Fix:** Retake screenshots showing actual extension UI
   - **Prevention:** Use real GitHub PRs, not mockups

4. **Description Misleading**
   - **Fix:** Ensure description accurately represents functionality
   - **Prevention:** Be specific, avoid exaggeration

5. **Manifest Errors**
   - **Fix:** Run `node scripts/validate-manifest.js`
   - **Prevention:** Validate before every submission

### Manifest Validation Errors

**Error:** "File not found: dist/content.js"
**Fix:** Run `npm run build` before creating ZIP

**Error:** "Invalid icon dimensions"
**Fix:** Verify icons are exactly 16x16, 48x48, 128x128

**Error:** "Invalid version format"
**Fix:** Use semantic versioning (e.g., 0.1.0, not 0.1 or v0.1.0)

### Upload Errors

**Error:** "ZIP file too large"
**Fix:** Remove node_modules, tests, docs from ZIP

**Error:** "Invalid ZIP structure"
**Fix:** Ensure manifest.json is in ZIP root, not in subdirectory

---

## Support Resources

### Official Documentation

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Chrome Extension Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Chrome Web Store User Data Privacy](https://developer.chrome.com/docs/webstore/user_data/)
- [Chrome Web Store Best Practices](https://developer.chrome.com/docs/webstore/best_practices/)

### Developer Support

- **Chrome Web Store Support:** Available in Developer Dashboard (click "Support")
- **Chrome Extensions Google Group:** https://groups.google.com/a/chromium.org/g/chromium-extensions
- **Stack Overflow:** Tag questions with [google-chrome-extension]

### Project Resources

- **GitHub Repository:** https://github.com/tomron/prify
- **Issue Tracker:** https://github.com/tomron/prify/issues
- **Privacy Policy:** https://github.com/tomron/prify/blob/main/PRIVACY.md

---

## Quick Reference Commands

```bash
# Build extension
npm run build

# Lint code
npm run lint

# Run tests
npm test

# Validate manifest
node scripts/validate-manifest.js

# Create ZIP package
zip -r pr-file-reorder-v0.1.0.zip \
  manifest.json popup.html icons/ dist/ ui/ content/ utils/ \
  -x "*.DS_Store" -x "node_modules/*" -x "tests/*" -x ".git/*" -x "store/*" -x "docs/*"

# Test ZIP
unzip -l pr-file-reorder-v0.1.0.zip
```

---

*Last Updated: February 16, 2026*
*For questions or issues, contact tom@tomron.io or open a GitHub issue.*
