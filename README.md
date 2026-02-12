# PR File Reorder

Chrome extension for collaborative file ordering in GitHub Pull Requests to improve code review efficiency.

## Overview

This extension solves a real DevEx problem: GitHub's alphabetical file ordering obscures logical review flow. By allowing collaborative reordering with democratic consensus, teams can review code more efficiently.

### Key Features

- 🎯 **Manual Reordering**: Drag-and-drop interface to reorder files
- 🤝 **Democratic Consensus**: Multiple reviewers' orders are merged into a consensus
- 💾 **GitHub Comments Storage**: Orders stored as hidden PR comments (zero backend!)
- 🔄 **Always Editable**: Orders can be updated at any time
- 👁️ **Public by Default**: All orders visible to all team members

## Installation

### For Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pr-file-reorder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the project root directory

### For Users

_Coming soon: Chrome Web Store link_

## Development

### Project Structure

```
pr-file-reorder/
├── manifest.json              # Extension manifest (Manifest V3)
├── content/                   # Content scripts
│   ├── content.js            # Main content script entry point
│   ├── dom-manipulator.js    # DOM reordering logic
│   ├── github-api.js         # GitHub comment reading/writing
│   └── consensus.js          # Consensus calculation algorithms
├── ui/                        # UI components
│   ├── reorder-modal.js      # Drag-and-drop interface
│   ├── order-viewer.js       # View all orders modal
│   └── styles.css            # Extension styles
├── utils/                     # Utilities
│   ├── storage.js            # Storage abstraction
│   ├── parser.js             # GitHub DOM parser
│   └── logger.js             # Debugging utilities
├── algorithms/                # Phase 2: Smart sorting
└── tests/                     # Tests
    ├── unit/                  # Jest unit tests
    └── e2e/                   # Playwright E2E tests
```

### Testing

Run all tests:
```bash
npm test
```

Run unit tests only:
```bash
npm run test:unit
```

Run E2E tests only:
```bash
npm run test:e2e
```

Watch mode for unit tests:
```bash
npm run test:watch
```

### Linting and Formatting

Lint code:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

### Git Workflow

This project uses git worktrees for parallel development. Each task gets its own worktree and branch:

```bash
# Start new task
git worktree add ../pr-file-reorder-<task-id> -b feature/<task-id>-<description>
cd ../pr-file-reorder-<task-id>

# After PR is merged
cd ../pr-file-reorder
git worktree remove ../pr-file-reorder-<task-id>
git branch -d feature/<task-id>-<description>
```

See [CLAUDE.md](./CLAUDE.md) for detailed development workflow.

## Technology Stack

- **Vanilla JavaScript**: No framework dependencies for simplicity
- **Manifest V3**: Latest Chrome extension standard
- **Jest**: Unit testing
- **Playwright**: E2E testing
- **ESLint + Prettier**: Code quality and formatting

## Architecture

### Zero Backend

This extension uses GitHub PR comments for storage, eliminating the need for backend infrastructure:

- ✅ Zero hosting costs
- ✅ No auth implementation needed
- ✅ Works with GitHub's permission model
- ✅ Data stored where it's used

### Storage Model

Orders are stored as hidden HTML comments in PRs:

```html
<!-- file-order-data
{
  "user": "username",
  "order": ["README.md", "src/engine.ts", "tests/engine.test.ts"],
  "timestamp": "2025-02-12T10:30:00Z",
  "version": "1.0"
}
-->
```

## Contributing

1. Read [CLAUDE.md](./CLAUDE.md) for development guidelines
2. Check [tasks.md](./tasks.md) for available tasks
3. Follow the git worktree workflow
4. Write tests first (TDD approach)
5. Ensure all tests pass before creating PR

## Documentation

- [PRD.md](./PRD.md) - Product requirements and roadmap
- [CLAUDE.md](./CLAUDE.md) - Development workflow and patterns
- [tasks.md](./tasks.md) - Detailed task breakdown

## Roadmap

### Phase 1: MVP (Current)
- Manual drag-and-drop reordering
- GitHub comment storage
- Democratic consensus calculation
- Order viewer

### Phase 2: Smart Defaults
- Dependency-aware sorting
- Change magnitude sorting
- Logical grouping
- Configurable strategies

### Phase 3: Learning System
- Pattern tracking
- Team preference learning
- ML-based suggestions
- Review time analytics

## License

MIT

## Author

Tom Ron - Head of AI Transportation and DevEx
