# Privacy Policy for PR File Reorder

**Last Updated:** February 16, 2026

## Overview

PR File Reorder is committed to protecting your privacy. This extension operates with a zero-backend architecture and collects no personal data.

## Data Collection

**We do not collect, transmit, or store any personal data.**

PR File Reorder operates entirely client-side in your browser. No data is sent to external servers, APIs, or third-party services operated by us.

## Local Storage

### Browser Local Storage

PR File Reorder uses your browser's localStorage to save your file ordering preferences locally on your device. This data:

- Stays on your device only
- Is never transmitted to external servers
- Can be cleared at any time via your browser settings
- Includes only file ordering preferences for GitHub PRs you've customized

### What We Store Locally

- File order preferences for specific Pull Requests
- Extension settings and preferences
- No personally identifiable information
- No tracking or analytics data

## GitHub Comment Storage

When you save and share a file order, PR File Reorder posts a comment to the GitHub Pull Request containing your file ordering preference. This functionality:

- Uses GitHub's standard comment API
- Stores data as GitHub PR comments (visible to all PR participants)
- Is subject to GitHub's Privacy Policy and Terms of Service
- Makes your file order public to all users with PR access
- Attributes the comment to your GitHub account

**Important:** File orders shared via GitHub comments are public and permanent (unless manually deleted via GitHub). They follow GitHub's data retention and privacy policies.

## Permissions

PR File Reorder requests minimal permissions necessary for functionality:

### Storage Permission

- **Purpose:** Save your local file ordering preferences in browser localStorage
- **Scope:** Local to your browser only
- **Data:** File paths and order preferences for PRs you've customized

### Host Permission (github.com)

- **Purpose:** Access and modify GitHub Pull Request file lists to enable reordering
- **Scope:** Only on GitHub.com domains matching Pull Request URLs
- **Access:** Read PR file lists, modify DOM to reorder files, post comments via GitHub's API

## Third-Party Data Sharing

**We share no data with third parties.**

The only external interaction is with GitHub's platform:

- **GitHub:** When you choose to save and share a file order, the extension posts a comment to the Pull Request using GitHub's API. This is a direct interaction between your browser and GitHub's servers, governed by GitHub's privacy policy.

## User Rights

### Your Data Control

- **Local Data:** You can clear all locally stored preferences at any time via your browser's extension settings or by clearing browser data
- **GitHub Comments:** You can delete any file order comments you've posted via GitHub's comment deletion feature
- **Extension Removal:** Uninstalling the extension removes all local data

### Data Portability

All file order data is stored in plaintext in GitHub comments and is exportable via GitHub's standard export features.

## Children's Privacy

PR File Reorder is intended for software developers and does not knowingly collect information from children under 13.

## Changes to This Privacy Policy

We may update this privacy policy to reflect changes in the extension's functionality or legal requirements. Updates will be posted at this URL with a new "Last Updated" date.

## Chrome Web Store Compliance

This extension complies with Chrome Web Store privacy requirements:

- Single Purpose: File reordering for GitHub Pull Requests
- Limited Permissions: Only storage and github.com host access
- No Remote Code: All code is bundled with the extension
- No Obfuscation: Source code is available on GitHub
- No Data Collection: Zero telemetry or analytics

## Contact Information

If you have questions about this privacy policy or the extension's data practices:

- **Email:** tom@tomron.io
- **GitHub Issues:** https://github.com/tomron/prify/issues

For GitHub-specific privacy questions, please refer to [GitHub's Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement).

## Open Source

PR File Reorder is open source software. You can review the complete source code, including all data handling logic, at: https://github.com/tomron/prify

---

*This privacy policy is version-controlled and maintained in the project repository.*
