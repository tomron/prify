## Context

The PR File Reorder extension is currently distributed via manual installation (loading unpacked extension). To reach wider adoption, we need to publish on the Chrome Web Store. The Chrome Web Store has specific technical, policy, and asset requirements that must be met before submission.

**Current State:**
- Working extension with Manifest V3
- Basic icons exist (16x16, 48x48, 128x128)
- No store listing assets or promotional materials
- No privacy policy or store documentation
- Manifest may need adjustments for store compliance

**Constraints:**
- Must maintain zero-backend architecture (no privacy concerns from data collection)
- Extension already works on GitHub.com - no functional changes needed
- Chrome Web Store Developer account required ($5 one-time fee)
- Store review process typically takes 1-3 business days

**Stakeholders:**
- Tom (project owner, will manage store account)
- Development team (will maintain store listing)
- End users (will install from Chrome Web Store)

## Goals / Non-Goals

**Goals:**
- Prepare all required assets for Chrome Web Store submission
- Ensure manifest.json meets all Chrome Web Store technical requirements
- Create clear privacy policy reflecting zero-backend architecture
- Document submission process for future updates
- Enable one-click installation via Chrome Web Store link

**Non-Goals:**
- Changing extension functionality or features
- Supporting Firefox or other browsers in this change
- Implementing analytics or telemetry
- Creating marketing website or landing page
- Automated submission pipeline (initial submission is manual)

## Decisions

### Decision 1: Asset Organization Strategy

**Chosen:** Create dedicated `store/` directory for all Chrome Web Store assets

**Rationale:**
- Separates store assets from extension runtime assets
- Makes it clear which assets are for distribution vs. functionality
- Easy to .gitignore if we want to exclude large promotional images

**Alternatives Considered:**
- Put everything in root directory → clutters the project
- Put in `icons/` → confuses runtime icons with store-only assets

**Structure:**
```
store/
  ├── icons/           # Store listing icons (128x128 required)
  ├── screenshots/     # Store screenshots (1280x800 or 640x400)
  ├── promotional/     # Optional promo images (440x280, 920x680, 1400x560)
  ├── listing.md       # Store title, descriptions, category
  └── README.md        # Instructions for updating store assets
```

### Decision 2: Privacy Policy Location and Format

**Chosen:** Create `PRIVACY.md` in project root, host on GitHub Pages

**Rationale:**
- Chrome Web Store requires publicly accessible privacy policy URL
- GitHub automatically renders markdown files
- Can use `https://github.com/tomron/prify/blob/main/PRIVACY.md` as the URL
- Keeps privacy policy version-controlled and auditable
- Easy to update without external hosting

**Alternatives Considered:**
- External website → requires separate hosting/maintenance
- Inline in manifest → not supported by Chrome Web Store
- Google Doc → not appropriate for version-controlled project

**Content Requirements:**
- Explain data collection (none in our case)
- Explain storage usage (localStorage only, no external transmission)
- Explain GitHub comment storage (PR orders stored as GitHub comments)
- Contact information for privacy inquiries

### Decision 3: Manifest Validation Approach

**Chosen:** Manual validation checklist + automated validation script

**Rationale:**
- Some requirements can be automated (schema validation, required fields)
- Some requirements need manual review (policy compliance, descriptions)
- Checklist ensures nothing is missed during submission

**Automated Checks:**
- Manifest V3 schema validation
- Required fields present (name, version, description, icons)
- Icon files exist at specified paths
- Permissions are minimal and justified
- Content Security Policy is set

**Manual Checks:**
- Description accurately reflects functionality
- Permissions are necessary and explained
- No prohibited functionality (crypto mining, data harvesting, etc.)
- Screenshots accurately represent the extension

### Decision 4: Screenshot Generation Strategy

**Chosen:** Manual screenshots with documented setup process

**Rationale:**
- Extension behavior is visual and interactive (drag-and-drop)
- Screenshots need to show real GitHub PR context
- Automated screenshot tools may not capture extension UI correctly
- Manual process ensures high-quality, accurate screenshots

**Documentation Will Include:**
- Test PR to use for screenshots
- Browser zoom level and window size
- Which extension states to capture (default, reorder modal open, order applied)
- Image dimensions and format requirements

**Alternatives Considered:**
- Playwright automated screenshots → harder to get exact visual states
- Mockups/designs → Chrome Web Store requires actual screenshots

### Decision 5: Submission Workflow Documentation

**Chosen:** Create `docs/CHROME_STORE_SUBMISSION.md` with step-by-step checklist

**Rationale:**
- First submission and updates have different processes
- Documentation ensures reproducibility
- Helps future maintainers understand the submission process
- Can serve as a template for future extensions

**Content Will Include:**
- Pre-submission checklist (assets ready, manifest validated, etc.)
- Developer Console steps (account setup, create listing, upload)
- Post-submission monitoring (review status, responding to feedback)
- Update process (version bumps, what triggers review)

## Risks / Trade-offs

### Risk: Store Review Rejection
**Mitigation:** Follow all published guidelines carefully, validate manifest, ensure accurate screenshots and descriptions. If rejected, address feedback and resubmit.

### Risk: Icon/Screenshot Quality Issues
**Mitigation:** Create high-resolution assets, test on retina displays, follow Chrome Web Store design guidelines for icon contrast and visibility.

### Risk: Privacy Policy Insufficiency
**Mitigation:** Be explicit about zero data collection, clearly explain GitHub comment storage, provide contact information. Reference Chrome Web Store privacy policy requirements.

### Trade-off: Manual Screenshot Process
**Impact:** Screenshots need manual updates when UI changes significantly.
**Accepted Because:** UI is relatively stable, visual quality is important for store listing, manual process is simple.

### Trade-off: Static Store Assets
**Impact:** No automated asset generation or validation pipeline.
**Accepted Because:** Store updates are infrequent (only with significant changes), manual review ensures quality, automation adds complexity for minimal benefit in MVP phase.

### Risk: Manifest Changes Required After Validation
**Mitigation:** Review Chrome Web Store policies thoroughly before creating checklist. Test manifest validation early. Be prepared to adjust permissions or CSP if needed.

## Migration Plan

**Phase 1: Asset Preparation (Pre-submission)**
1. Create `store/` directory structure
2. Generate or source all required icons and screenshots
3. Write store listing copy (title, descriptions)
4. Create `PRIVACY.md` privacy policy
5. Validate manifest.json against Chrome Web Store requirements

**Phase 2: Documentation**
1. Create `docs/CHROME_STORE_SUBMISSION.md` guide
2. Document asset update process in `store/README.md`
3. Update main README.md with placeholder for store link

**Phase 3: Submission**
1. Set up Chrome Web Store Developer account
2. Create new extension listing in Developer Console
3. Upload extension package (.zip)
4. Configure store listing (copy, screenshots, pricing, etc.)
5. Submit for review

**Phase 4: Post-Publication**
1. Update README.md with actual Chrome Web Store link
2. Monitor initial reviews and feedback
3. Respond to any store review feedback if needed

**Rollback Strategy:**
- If submission is rejected: Address feedback and resubmit
- If critical issue found post-publication: Unpublish listing via Developer Console
- If extension needs updates: Increment version, submit update (no unpublish needed)

## Open Questions

None - all technical decisions are straightforward for Chrome Web Store submission. If questions arise during implementation, document them in the tasks artifact.
