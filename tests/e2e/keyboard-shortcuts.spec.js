import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Keyboard Shortcuts', () => {
  test('should have keyboard.js utility file', async () => {
    const keyboardPath = path.join(__dirname, '../../utils/keyboard.js');
    const fs = await import('fs');
    expect(fs.existsSync(keyboardPath)).toBe(true);
  });

  test('should have keyboard help modal component', async () => {
    const helpModalPath = path.join(
      __dirname,
      '../../ui/keyboard-help-modal.js'
    );
    const fs = await import('fs');
    expect(fs.existsSync(helpModalPath)).toBe(true);
  });

  test('should export required keyboard functions', async () => {
    // Test that keyboard.js exports the expected functions
    const keyboardModule = await import('../../utils/keyboard.js');

    expect(typeof keyboardModule.registerShortcut).toBe('function');
    expect(typeof keyboardModule.unregisterShortcut).toBe('function');
    expect(typeof keyboardModule.unregisterAllShortcuts).toBe('function');
    expect(typeof keyboardModule.isShortcutKey).toBe('function');
    expect(typeof keyboardModule.getShortcutDescription).toBe('function');
    expect(typeof keyboardModule.formatShortcut).toBe('function');
    expect(typeof keyboardModule.DEFAULT_SHORTCUTS).toBe('object');
  });

  test('should have all default shortcuts defined', async () => {
    const { DEFAULT_SHORTCUTS } = await import('../../utils/keyboard.js');

    // Check that all required shortcuts are defined
    expect(DEFAULT_SHORTCUTS.REORDER_MODAL).toBeDefined();
    expect(DEFAULT_SHORTCUTS.VIEW_ORDERS).toBeDefined();
    expect(DEFAULT_SHORTCUTS.APPLY_CONSENSUS).toBeDefined();
    expect(DEFAULT_SHORTCUTS.CLOSE_MODAL).toBeDefined();
    expect(DEFAULT_SHORTCUTS.NAVIGATE_UP).toBeDefined();
    expect(DEFAULT_SHORTCUTS.NAVIGATE_DOWN).toBeDefined();
    expect(DEFAULT_SHORTCUTS.MOVE_UP).toBeDefined();
    expect(DEFAULT_SHORTCUTS.MOVE_DOWN).toBeDefined();
    expect(DEFAULT_SHORTCUTS.HELP).toBeDefined();

    // Check that shortcuts have required properties
    expect(DEFAULT_SHORTCUTS.REORDER_MODAL.key).toBe('r');
    expect(DEFAULT_SHORTCUTS.REORDER_MODAL.ctrl).toBe(true);
    expect(DEFAULT_SHORTCUTS.REORDER_MODAL.shift).toBe(true);

    expect(DEFAULT_SHORTCUTS.VIEW_ORDERS.key).toBe('v');
    expect(DEFAULT_SHORTCUTS.VIEW_ORDERS.ctrl).toBe(true);
    expect(DEFAULT_SHORTCUTS.VIEW_ORDERS.shift).toBe(true);

    expect(DEFAULT_SHORTCUTS.APPLY_CONSENSUS.key).toBe('c');
    expect(DEFAULT_SHORTCUTS.APPLY_CONSENSUS.ctrl).toBe(true);
    expect(DEFAULT_SHORTCUTS.APPLY_CONSENSUS.shift).toBe(true);

    expect(DEFAULT_SHORTCUTS.CLOSE_MODAL.key).toBe('Escape');

    expect(DEFAULT_SHORTCUTS.HELP.key).toBe('?');
  });

  test('should format shortcuts correctly', async () => {
    const { formatShortcut, DEFAULT_SHORTCUTS } =
      await import('../../utils/keyboard.js');

    // Test Ctrl+Shift+R format
    const reorderFormat = formatShortcut(DEFAULT_SHORTCUTS.REORDER_MODAL);
    expect(reorderFormat).toMatch(/(Ctrl|Cmd)\+Shift\+R/);

    // Test Escape format
    const closeFormat = formatShortcut(DEFAULT_SHORTCUTS.CLOSE_MODAL);
    expect(closeFormat).toBe('Escape');

    // Test arrow key format
    const upFormat = formatShortcut(DEFAULT_SHORTCUTS.NAVIGATE_UP);
    expect(upFormat).toBe('Up');

    // Test Ctrl+Arrow format
    const moveUpFormat = formatShortcut(DEFAULT_SHORTCUTS.MOVE_UP);
    expect(moveUpFormat).toMatch(/(Ctrl|Cmd)\+Up/);
  });

  test('should have keyboard registration functions', async () => {
    const { registerShortcut, unregisterShortcut, unregisterAllShortcuts } =
      await import('../../utils/keyboard.js');

    // Verify functions exist
    expect(typeof registerShortcut).toBe('function');
    expect(typeof unregisterShortcut).toBe('function');
    expect(typeof unregisterAllShortcuts).toBe('function');

    // Note: Actual registration requires DOM environment
    // and is tested in unit tests with JSDOM
  });

  test('should have input element conflict prevention', async () => {
    // Verify the keyboard.js module has logic to prevent conflicts
    // with input elements (tested in unit tests with JSDOM)
    const keyboardPath = path.join(__dirname, '../../utils/keyboard.js');
    const fs = await import('fs');
    const content = fs.readFileSync(keyboardPath, 'utf-8');

    // Check for shouldIgnoreTarget function or similar logic
    expect(content).toContain('shouldIgnoreTarget');
    expect(content).toContain('INPUT');
    expect(content).toContain('TEXTAREA');
    expect(content).toContain('contentEditable');
  });

  test('should prevent conflicts with GitHub shortcuts', async () => {
    const { DEFAULT_SHORTCUTS } = await import('../../utils/keyboard.js');

    // Verify our shortcuts use Ctrl+Shift combinations to avoid
    // conflicts with GitHub's single-key shortcuts like:
    // - 's' for search
    // - '/' for search focus
    // - 't' for file finder
    // - 'w' for wiki
    // etc.

    // Our main shortcuts should require both Ctrl and Shift
    expect(DEFAULT_SHORTCUTS.REORDER_MODAL.ctrl).toBe(true);
    expect(DEFAULT_SHORTCUTS.REORDER_MODAL.shift).toBe(true);

    expect(DEFAULT_SHORTCUTS.VIEW_ORDERS.ctrl).toBe(true);
    expect(DEFAULT_SHORTCUTS.VIEW_ORDERS.shift).toBe(true);

    expect(DEFAULT_SHORTCUTS.APPLY_CONSENSUS.ctrl).toBe(true);
    expect(DEFAULT_SHORTCUTS.APPLY_CONSENSUS.shift).toBe(true);

    // Help uses '?' which requires shift, so it's safe
    expect(DEFAULT_SHORTCUTS.HELP.key).toBe('?');

    // Escape is universally used for closing modals
    expect(DEFAULT_SHORTCUTS.CLOSE_MODAL.key).toBe('Escape');
  });

  test('should export keyboard help modal creator', async () => {
    const helpModalModule = await import('../../ui/keyboard-help-modal.js');

    expect(typeof helpModalModule.createKeyboardHelpModal).toBe('function');
  });

  test('should handle keyboard help modal creation', async () => {
    // This is a structural test - in a browser environment,
    // the modal would be created and displayed
    const { createKeyboardHelpModal } =
      await import('../../ui/keyboard-help-modal.js');

    // Verify the function exists and is callable
    expect(typeof createKeyboardHelpModal).toBe('function');

    // In a JSDOM environment, we could test modal creation
    // but that's better suited for unit tests
  });

  test('should integrate keyboard shortcuts into content script', async () => {
    const contentPath = path.join(__dirname, '../../content/content.js');
    const fs = await import('fs');
    const content = fs.readFileSync(contentPath, 'utf-8');

    // Verify keyboard imports
    expect(content).toContain('registerShortcut');
    expect(content).toContain('unregisterShortcut');
    expect(content).toContain('DEFAULT_SHORTCUTS');

    // Verify keyboard help modal import
    expect(content).toContain('createKeyboardHelpModal');

    // Verify shortcuts are registered
    expect(content).toContain('registerKeyboardShortcuts');

    // Verify cleanup is called
    expect(content).toContain('cleanup()');
  });

  test('should have keyboard shortcuts CSS styles', async () => {
    const stylesPath = path.join(__dirname, '../../ui/styles.css');
    const fs = await import('fs');
    const styles = fs.readFileSync(stylesPath, 'utf-8');

    // Check for keyboard help modal styles
    expect(styles).toContain('.pr-keyboard-help-modal');
    expect(styles).toContain('.pr-keyboard-section');
    expect(styles).toContain('.pr-keyboard-key');
    expect(styles).toContain('.pr-keyboard-description');

    // Check for proper kbd element styling
    expect(styles).toContain('border-radius');
  });
});
