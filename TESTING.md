# Testing Guide

This document provides comprehensive information about the testing infrastructure and best practices for the PR File Reorder extension.

## Overview

We use a multi-layered testing approach:

1. **Unit Tests** (Jest + jsdom) - Test individual functions and modules
2. **Integration Tests** (Jest + jsdom) - Test component interactions
3. **E2E Tests** (Playwright) - Test end-to-end workflows

## Test Coverage Goals

- **Unit Tests**: >85% coverage
- **Integration Tests**: All component interactions
- **E2E Tests**: All critical user workflows

## Running Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only E2E tests
npm run test:e2e

# Run tests in watch mode (unit tests only)
npm run test:watch
```

## Unit Testing

### Framework: Jest with jsdom

Unit tests focus on testing individual functions and modules in isolation.

### Writing Unit Tests

```javascript
// tests/unit/example.test.js
import { myFunction } from '../../utils/example.js';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });

  it('should handle edge case', () => {
    expect(() => myFunction(invalidInput)).toThrow('Error message');
  });
});
```

### Best Practices

1. **Test One Thing**: Each test should verify a single behavior
2. **Descriptive Names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Test Edge Cases**: Cover error conditions and boundary cases
5. **No External Dependencies**: Mock all external dependencies

### Mock Examples

```javascript
// Mock chrome.storage API
beforeEach(() => {
  global.chrome = {
    storage: {
      local: {
        get: jest.fn(),
        set: jest.fn(),
      },
    },
  };
});

// Mock DOM elements
const mockElement = document.createElement('div');
mockElement.dataset.path = 'test.js';
document.body.appendChild(mockElement);
```

## E2E Testing

### Framework: Playwright

E2E tests verify complete user workflows in a real browser environment.

### Writing E2E Tests

```javascript
// tests/e2e/example.spec.js
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should perform workflow', async ({ page }) => {
    // Navigate to page
    await page.goto('https://github.com/user/repo/pull/123');

    // Interact with page
    await page.click('button:has-text("Reorder")');

    // Assert results
    await expect(page.locator('.modal')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Page Objects**: Create reusable page interaction patterns
2. **Selectors**: Prefer data attributes over CSS classes
3. **Wait Strategies**: Use Playwright's auto-waiting features
4. **Isolation**: Each test should be independent
5. **Cleanup**: Always clean up test data

### Extension Loading

For tests that need to load the Chrome extension:

```javascript
import { loadExtension } from './helpers/extension.js';

test('extension test', async () => {
  const { context, extensionId } = await loadExtension();

  try {
    const page = await context.newPage();
    // ... test code ...
  } finally {
    await context.close();
  }
});
```

**Note**: Extension loading tests require headed mode and are slower. Use sparingly.

## Test Helpers

### DOM Helpers (`tests/helpers/dom.js`)

Utilities for creating and manipulating DOM elements in tests:

```javascript
import {
  createMockFileElement,
  createMockFilesContainer,
  getFilePathsFromContainer,
} from '../helpers/dom.js';

// Create mock file element
const file = createMockFileElement('test.js', 10, 5);

// Create mock container with multiple files
const container = createMockFilesContainer([
  { path: 'a.js', additions: 10, deletions: 5 },
  { path: 'b.js', additions: 20, deletions: 10 },
]);

// Extract file paths
const paths = getFilePathsFromContainer(container);
```

### Assertion Helpers (`tests/helpers/assertions.js`)

Custom assertion functions for common test scenarios:

```javascript
import {
  assertArrayEquals,
  assertElementHasClass,
  assertThrows,
} from '../helpers/assertions.js';

// Assert arrays are equal
assertArrayEquals(actual, expected, 'Arrays should match');

// Assert element has class
assertElementHasClass(element, 'active', 'Element should be active');

// Assert function throws
assertThrows(() => myFunction(), 'Error message');
```

### Extension Helpers (`tests/e2e/helpers/extension.js`)

Utilities for loading and testing the Chrome extension:

```javascript
import {
  loadExtension,
  waitForExtension,
  createPRPage,
} from './helpers/extension.js';

// Load extension in browser
const { context, extensionId } = await loadExtension();

// Wait for extension to be ready on a page
await waitForExtension(page, 5000);

// Create page with mock PR content
const page = await createPRPage(context, htmlContent);
```

## Test Fixtures

Mock HTML files for testing without network dependencies:

### Simple PR Fixture

```html
<!-- tests/fixtures/github-pr-simple.html -->
<div class="files">
  <div class="file" data-path="a.js" data-additions="10" data-deletions="5">
    <div class="file-info"><a>a.js</a></div>
  </div>
</div>
```

### Full PR Fixture

`tests/fixtures/github-pr.html` - Complete GitHub PR page mockup with:
- Multiple files
- File metadata (additions, deletions)
- Comment section
- Comment form

## Common Testing Patterns

### Testing Array Utilities

```javascript
it('should handle empty array', () => {
  const result = myFunction([]);
  expect(result).toEqual([]);
});

it('should not mutate original array', () => {
  const input = [1, 2, 3];
  const original = [...input];
  myFunction(input);
  expect(input).toEqual(original);
});
```

### Testing DOM Manipulation

```javascript
it('should reorder elements in DOM', () => {
  const container = createMockFilesContainer([
    { path: 'a.js', additions: 10, deletions: 5 },
    { path: 'b.js', additions: 20, deletions: 10 },
  ]);
  document.body.appendChild(container);

  reorderFiles(['b.js', 'a.js']);

  const paths = getFilePathsFromContainer(container);
  expect(paths).toEqual(['b.js', 'a.js']);
});
```

### Testing Async Functions

```javascript
it('should load data asynchronously', async () => {
  const promise = loadData();
  await expect(promise).resolves.toBe(expectedData);
});

it('should handle errors', async () => {
  const promise = loadData('invalid');
  await expect(promise).rejects.toThrow('Error message');
});
```

### Testing Error Handling

```javascript
it('should throw on invalid input', () => {
  expect(() => myFunction(null)).toThrow('Invalid input');
});

it('should return default on error', () => {
  const result = myFunctionWithDefault(invalidInput);
  expect(result).toBe(defaultValue);
});
```

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm run test:unit -- array-utils.test.js

# Run tests matching pattern
npm run test:unit -- --testNamePattern="should handle edge case"

# Run with coverage
npm run test:unit -- --coverage

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests

```bash
# Run with headed browser
npx playwright test --headed

# Run with debug mode
npx playwright test --debug

# Run specific test file
npx playwright test extension-loading.spec.js

# Generate test code (codegen)
npx playwright codegen github.com
```

### Playwright Debugging Tips

1. **Screenshots**: Automatically captured on failure
2. **Videos**: Recorded for failed tests
3. **Trace Viewer**: View detailed test execution
   ```bash
   npx playwright show-trace trace.zip
   ```
4. **Slow Motion**: Add `slowMo: 100` to launch options
5. **Pause Test**: Use `await page.pause()` to pause execution

## CI/CD Integration

Tests run automatically on:
- Push to `main` branch
- Pull request creation
- Pull request updates

### GitHub Actions

See `.github/workflows/ci.yml` for CI configuration.

The CI pipeline:
1. Runs linter
2. Checks code formatting
3. Runs unit tests
4. Runs E2E tests
5. Uploads test artifacts

## Performance Testing

### Benchmarking

For performance-critical code, add benchmarks:

```javascript
it('should calculate consensus in <50ms for 100 files', () => {
  const start = Date.now();
  calculateConsensus(largeDataset);
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(50);
});
```

### Memory Leaks

Check for memory leaks in long-running operations:

```javascript
it('should not leak memory', () => {
  const initialMemory = process.memoryUsage().heapUsed;

  for (let i = 0; i < 1000; i++) {
    myFunction();
  }

  const finalMemory = process.memoryUsage().heapUsed;
  const increase = (finalMemory - initialMemory) / 1024 / 1024; // MB

  expect(increase).toBeLessThan(10); // Less than 10MB increase
});
```

## Test Organization

```
tests/
├── unit/                    # Jest unit tests
│   ├── setup.test.js       # Jest setup verification
│   ├── array-utils.test.js # Array utilities tests
│   └── ...                 # More unit tests
├── e2e/                     # Playwright E2E tests
│   ├── setup.spec.js       # Playwright setup verification
│   ├── extension-loading.spec.js
│   └── helpers/            # E2E-specific helpers
│       └── extension.js
├── fixtures/                # Test data and mock files
│   ├── github-pr.html
│   └── github-pr-simple.html
└── helpers/                 # Shared test utilities
    ├── dom.js              # DOM manipulation helpers
    └── assertions.js        # Custom assertions
```

## Coverage Reports

After running unit tests with coverage:

```bash
npm run test:unit -- --coverage
```

View coverage report:
- Console output shows summary
- Detailed HTML report in `coverage/` directory
- Open `coverage/lcov-report/index.html` in browser

## Troubleshooting

### Jest Issues

**Problem**: "SyntaxError: Cannot use import statement outside a module"
**Solution**: Ensure `package.json` has `"type": "module"` and use `NODE_OPTIONS=--experimental-vm-modules`

**Problem**: "ReferenceError: chrome is not defined"
**Solution**: Mock chrome APIs in test setup:
```javascript
global.chrome = { storage: { local: { get: jest.fn(), set: jest.fn() } } };
```

### Playwright Issues

**Problem**: "browserType.launch: Executable doesn't exist"
**Solution**: Run `npx playwright install chromium`

**Problem**: "Test timeout exceeded"
**Solution**: Increase timeout in config or use `test.setTimeout(60000)`

**Problem**: "Extension not loading"
**Solution**: Extensions require headed mode (`headless: false`)

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Chrome Extension Testing](https://developer.chrome.com/docs/extensions/mv3/tut_testing/)

## Getting Help

If you encounter testing issues:

1. Check this documentation
2. Review existing test examples
3. Check console/error messages
4. Ask the team for help
5. Update this documentation with solutions!
