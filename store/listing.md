# Chrome Web Store Listing

## Extension Title

**PR File Reorder**

(Must match manifest.json name field)

## Short Description

(132 character maximum)

Collaborative file ordering in GitHub Pull Requests to improve code review efficiency

(Character count: 93)

## Detailed Description

### Overview

PR File Reorder transforms how teams review GitHub Pull Requests by enabling collaborative file ordering. Say goodbye to alphabetical chaos and hello to logical review flow.

### Key Features

**Drag-and-Drop Reordering**
- Instantly reorder PR files with intuitive drag-and-drop interface
- Move files to create logical review flow (dependencies first, tests last, etc.)
- Changes apply immediately to your view

**Collaborative Ordering**
- Share your file order with the team via GitHub PR comments
- View orders from all reviewers to understand different perspectives
- Consensus algorithm automatically applies the team's collective ordering

**Democratic Consensus**
- All reviewers have equal say in file ordering
- Orders are never locked - anyone can update anytime
- Transparent ordering shows everyone's preferences

**Zero Infrastructure**
- No backend servers or APIs required
- Orders stored as GitHub PR comments (using GitHub's infrastructure)
- Works entirely client-side with zero setup

**Privacy First**
- No data collection or external transmission
- Local preferences stored in browser only
- Orders are public GitHub comments - transparent by design

### How It Works

1. Open any GitHub Pull Request
2. Click the "Reorder Files" button on the PR files page
3. Drag files into your preferred review order
4. Click "Save" to apply and share your order
5. Team consensus automatically applies when multiple orders exist

### Perfect For

- Code review teams seeking better workflow efficiency
- PRs with many files where alphabetical order obscures logic
- Teams that value democratic decision-making
- Projects prioritizing reviewer experience

### Technical Details

- Works on GitHub.com and GitHub Enterprise Cloud
- Manifest V3 Chrome Extension
- Minimal permissions (storage + github.com access)
- Open source on GitHub

## Category

**Developer Tools**

## Language

English (United States)

## Privacy Policy URL

https://github.com/tomron/prify/blob/main/PRIVACY.md
