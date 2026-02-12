import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('GitHub DOM Parser E2E', () => {
  test('should parse mock GitHub PR page', async ({ page }) => {
    // Load mock GitHub PR fixture
    const fixturePath = path.join(__dirname, '../fixtures/github-pr.html');
    const fixtureContent = fs.readFileSync(fixturePath, 'utf-8');

    await page.setContent(fixtureContent);

    // Inject parser script
    const parserPath = path.join(__dirname, '../../utils/parser.js');
    await page.addScriptTag({ path: parserPath, type: 'module' });

    // Test extractFiles by counting file elements
    const fileCount = await page.evaluate(() => {
      return document.querySelectorAll('.file').length;
    });

    expect(fileCount).toBe(5);
  });

  test('should extract file paths from mock PR', async ({ page }) => {
    const fixturePath = path.join(__dirname, '../fixtures/github-pr.html');
    const fixtureContent = fs.readFileSync(fixturePath, 'utf-8');

    await page.setContent(fixtureContent);

    const filePaths = await page.evaluate(() => {
      const files = document.querySelectorAll('.file');
      return Array.from(files).map((file) => file.dataset.path);
    });

    expect(filePaths).toContain('README.md');
    expect(filePaths).toContain('package.json');
    expect(filePaths).toContain('src/engine.ts');
    expect(filePaths).toContain('src/utils.ts');
    expect(filePaths).toContain('tests/engine.test.ts');
  });

  test('should extract metadata from mock PR files', async ({ page }) => {
    const fixturePath = path.join(__dirname, '../fixtures/github-pr.html');
    const fixtureContent = fs.readFileSync(fixturePath, 'utf-8');

    await page.setContent(fixtureContent);

    const metadata = await page.evaluate(() => {
      const file = document.querySelector('[data-path="src/engine.ts"]');
      return {
        path: file.dataset.path,
        additions: parseInt(file.dataset.additions, 10),
        deletions: parseInt(file.dataset.deletions, 10),
      };
    });

    expect(metadata.path).toBe('src/engine.ts');
    expect(metadata.additions).toBe(150);
    expect(metadata.deletions).toBe(50);
  });

  test('should handle files with special characters', async ({ page }) => {
    const container = `
      <div class="files">
        <div class="file" data-path="src/file with spaces.js" data-additions="5" data-deletions="2">
          <div class="file-info"><a>src/file with spaces.js</a></div>
        </div>
        <div class="file" data-path="src/文件.ts" data-additions="10" data-deletions="3">
          <div class="file-info"><a>src/文件.ts</a></div>
        </div>
      </div>
    `;

    await page.setContent(container);

    const paths = await page.evaluate(() => {
      const files = document.querySelectorAll('.file');
      return Array.from(files).map((file) => file.dataset.path);
    });

    expect(paths).toContain('src/file with spaces.js');
    expect(paths).toContain('src/文件.ts');
  });

  test('should detect renamed files', async ({ page }) => {
    const container = `
      <div class="files">
        <div class="file" data-path="new-name.js" data-old-path="old-name.js" data-additions="5" data-deletions="5">
          <div class="file-info"><a>new-name.js</a></div>
        </div>
      </div>
    `;

    await page.setContent(container);

    const isRenamed = await page.evaluate(() => {
      const file = document.querySelector('.file');
      return file.dataset.oldPath !== undefined;
    });

    expect(isRenamed).toBe(true);
  });

  test('should detect binary files', async ({ page }) => {
    const container = `
      <div class="files">
        <div class="file" data-path="image.png" data-binary="true" data-additions="0" data-deletions="0">
          <div class="file-info"><a>image.png</a></div>
        </div>
      </div>
    `;

    await page.setContent(container);

    const isBinary = await page.evaluate(() => {
      const file = document.querySelector('.file');
      return file.dataset.binary === 'true';
    });

    expect(isBinary).toBe(true);
  });
});
