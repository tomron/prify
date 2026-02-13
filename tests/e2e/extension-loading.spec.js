import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Extension Loading', () => {
  test('should have valid manifest', async () => {
    // Read and validate manifest
    const manifestPath = path.join(__dirname, '../../manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    // Verify required fields
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe('PR File Reorder');
    expect(manifest.version).toBeTruthy();

    // Verify content scripts configuration
    expect(manifest.content_scripts).toBeDefined();
    expect(manifest.content_scripts.length).toBeGreaterThan(0);

    const contentScript = manifest.content_scripts[0];
    expect(contentScript.matches).toContain('https://github.com/*/pull/*');
    expect(contentScript.js).toContain('dist/content.js');
  });

  test('should have all required files present', async () => {
    const rootPath = path.join(__dirname, '../..');

    // Check required files exist
    const requiredFiles = [
      'manifest.json',
      'dist/content.js', // Bundled version
      'ui/styles.css',
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(rootPath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  test('should have valid content script', async () => {
    const contentPath = path.join(__dirname, '../../dist/content.js');
    const content = fs.readFileSync(contentPath, 'utf-8');

    // Verify content script has basic structure
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain('data-pr-reorder');
  });
});
