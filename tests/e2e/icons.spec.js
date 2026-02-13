/**
 * E2E tests for extension icons and visual assets
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const ICONS_DIR = path.join(process.cwd(), 'icons');

test.describe('Extension Icons', () => {
  test('should have all required icon sizes', () => {
    const requiredIcons = ['icon16.png', 'icon48.png', 'icon128.png'];

    requiredIcons.forEach((icon) => {
      const iconPath = path.join(ICONS_DIR, icon);
      expect(fs.existsSync(iconPath)).toBe(true);
    });
  });

  test('should have master SVG icon', () => {
    const iconPath = path.join(ICONS_DIR, 'icon.svg');
    expect(fs.existsSync(iconPath)).toBe(true);

    const iconContent = fs.readFileSync(iconPath, 'utf8');
    expect(iconContent).toContain('svg');
    expect(iconContent).toContain('viewBox');
  });

  test('should have badge icons', () => {
    const badges = [
      'badge-success.svg',
      'badge-warning.svg',
      'badge-error.svg',
      'badge-info.svg',
    ];

    badges.forEach((badge) => {
      const badgePath = path.join(ICONS_DIR, badge);
      expect(fs.existsSync(badgePath)).toBe(true);

      const badgeContent = fs.readFileSync(badgePath, 'utf8');
      expect(badgeContent).toContain('svg');
      expect(badgeContent).toContain('16'); // All badges are 16x16
    });
  });

  test('should have spinner icon', () => {
    const spinnerPath = path.join(ICONS_DIR, 'spinner.svg');
    expect(fs.existsSync(spinnerPath)).toBe(true);

    const spinnerContent = fs.readFileSync(spinnerPath, 'utf8');
    expect(spinnerContent).toContain('svg');
    expect(spinnerContent).toContain('spin'); // Animation
  });

  test('should have promotional HTML files', () => {
    const promoFiles = [
      'promo-440x280.html',
      'promo-920x680.html',
      'promo-1400x560.html',
    ];

    promoFiles.forEach((file) => {
      const filePath = path.join(ICONS_DIR, file);
      expect(fs.existsSync(filePath)).toBe(true);

      const fileContent = fs.readFileSync(filePath, 'utf8');
      expect(fileContent.toLowerCase()).toContain('<!doctype html>');
      expect(fileContent).toContain('PR File Reorder');
    });
  });

  test('promo files should have correct dimensions', () => {
    const dimensions = [
      { file: 'promo-440x280.html', width: 440, height: 280 },
      { file: 'promo-920x680.html', width: 920, height: 680 },
      { file: 'promo-1400x560.html', width: 1400, height: 560 },
    ];

    dimensions.forEach(({ file, width, height }) => {
      const filePath = path.join(ICONS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');

      expect(content).toContain(`width: ${width}px`);
      expect(content).toContain(`height: ${height}px`);
    });
  });

  test('should have README documentation', () => {
    const readmePath = path.join(ICONS_DIR, 'README.md');
    expect(fs.existsSync(readmePath)).toBe(true);

    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    expect(readmeContent).toContain('Visual Assets');
    expect(readmeContent).toContain('Chrome Web Store');
    expect(readmeContent).toContain('icon16.png');
    expect(readmeContent).toContain('icon48.png');
    expect(readmeContent).toContain('icon128.png');
  });
});

test.describe('Icon Integration', () => {
  test('manifest.json should reference correct icon paths', () => {
    const manifestPath = path.join(process.cwd(), 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    expect(manifest.icons).toBeDefined();
    expect(manifest.icons['16']).toBe('icons/icon16.png');
    expect(manifest.icons['48']).toBe('icons/icon48.png');
    expect(manifest.icons['128']).toBe('icons/icon128.png');

    expect(manifest.action.default_icon).toBeDefined();
    expect(manifest.action.default_icon['16']).toBe('icons/icon16.png');
    expect(manifest.action.default_icon['48']).toBe('icons/icon48.png');
    expect(manifest.action.default_icon['128']).toBe('icons/icon128.png');
  });

  test('popup.html should load correctly', () => {
    const popupPath = path.join(process.cwd(), 'popup.html');
    expect(fs.existsSync(popupPath)).toBe(true);

    const popupContent = fs.readFileSync(popupPath, 'utf8');
    expect(popupContent).toContain('PR File Reorder');
  });
});

test.describe('Badge Icon Usage', () => {
  test('badge icons should be valid SVG', () => {
    const badges = [
      'badge-success.svg',
      'badge-warning.svg',
      'badge-error.svg',
      'badge-info.svg',
    ];

    badges.forEach((badge) => {
      const badgePath = path.join(ICONS_DIR, badge);
      const svgContent = fs.readFileSync(badgePath, 'utf8');

      // Check for valid SVG structure
      expect(svgContent).toMatch(/<svg[^>]*>/);
      expect(svgContent).toMatch(/<\/svg>/);

      // Check dimensions
      expect(svgContent).toContain('width="16"');
      expect(svgContent).toContain('height="16"');
      expect(svgContent).toContain('viewBox="0 0 16 16"');
    });
  });

  test('badge icons should have distinct visual elements', () => {
    const badgePath = path.join(ICONS_DIR, 'badge-success.svg');
    const successContent = fs.readFileSync(badgePath, 'utf8');
    expect(successContent).toContain('1a7f37'); // Green color

    const warningPath = path.join(ICONS_DIR, 'badge-warning.svg');
    const warningContent = fs.readFileSync(warningPath, 'utf8');
    expect(warningContent).toContain('d4a72c'); // Yellow color

    const errorPath = path.join(ICONS_DIR, 'badge-error.svg');
    const errorContent = fs.readFileSync(errorPath, 'utf8');
    expect(errorContent).toContain('cf222e'); // Red color

    const infoPath = path.join(ICONS_DIR, 'badge-info.svg');
    const infoContent = fs.readFileSync(infoPath, 'utf8');
    expect(infoContent).toContain('0969da'); // Blue color
  });
});

test.describe('Visual Consistency', () => {
  test('all icons should use consistent color scheme', () => {
    const iconPath = path.join(ICONS_DIR, 'icon.svg');
    const iconContent = fs.readFileSync(iconPath, 'utf8');

    // Check for GitHub green colors
    expect(iconContent).toMatch(/#2da44e|#1a7f37/);
  });

  test('promotional materials should match brand colors', () => {
    const promoPath = path.join(ICONS_DIR, 'promo-920x680.html');
    const promoContent = fs.readFileSync(promoPath, 'utf8');

    // Check for consistent color usage
    expect(promoContent).toContain('#2da44e'); // Primary green
    expect(promoContent).toContain('#1a7f37'); // Dark green
  });
});
