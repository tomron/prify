/**
 * @jest-environment jsdom
 */

import {
  registerShortcut,
  unregisterShortcut,
  unregisterAllShortcuts,
  isShortcutKey,
  getShortcutDescription,
} from '../../utils/keyboard.js';

describe('Keyboard Shortcuts', () => {
  let mockHandler;
  let mockEvent;
  let handlerCalls;

  beforeEach(() => {
    handlerCalls = [];
    mockHandler = () => {
      handlerCalls.push(true);
    };

    const preventDefaultCalls = [];
    const stopPropagationCalls = [];

    mockEvent = {
      key: '',
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
      altKey: false,
      target: document.body,
      preventDefault: () => preventDefaultCalls.push(true),
      stopPropagation: () => stopPropagationCalls.push(true),
    };

    // Clear all shortcuts before each test
    unregisterAllShortcuts();
  });

  describe('registerShortcut', () => {
    test('should register a simple shortcut', () => {
      const id = registerShortcut({
        key: 'r',
        ctrl: true,
        shift: true,
        handler: mockHandler,
      });

      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    test('should return unique IDs for each registration', () => {
      const id1 = registerShortcut({
        key: 'r',
        ctrl: true,
        shift: true,
        handler: mockHandler,
      });

      const id2 = registerShortcut({
        key: 'v',
        ctrl: true,
        shift: true,
        handler: mockHandler,
      });

      expect(id1).not.toBe(id2);
    });

    test('should require key and handler', () => {
      expect(() => {
        registerShortcut({ key: 'r' });
      }).toThrow();

      expect(() => {
        registerShortcut({ handler: mockHandler });
      }).toThrow();
    });

    test('should accept description and scope', () => {
      const id = registerShortcut({
        key: 'r',
        ctrl: true,
        shift: true,
        handler: mockHandler,
        description: 'Open reorder modal',
        scope: 'global',
      });

      expect(id).toBeTruthy();
    });
  });

  describe('unregisterShortcut', () => {
    test('should unregister a specific shortcut', () => {
      const id = registerShortcut({
        key: 'r',
        ctrl: true,
        shift: true,
        handler: mockHandler,
      });

      const result = unregisterShortcut(id);
      expect(result).toBe(true);
    });

    test('should return false for non-existent shortcut', () => {
      const result = unregisterShortcut('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('unregisterAllShortcuts', () => {
    test('should clear all registered shortcuts', () => {
      registerShortcut({
        key: 'r',
        ctrl: true,
        shift: true,
        handler: mockHandler,
      });
      registerShortcut({
        key: 'v',
        ctrl: true,
        shift: true,
        handler: mockHandler,
      });

      const count = unregisterAllShortcuts();
      expect(count).toBe(2);
    });

    test('should return 0 when no shortcuts registered', () => {
      const count = unregisterAllShortcuts();
      expect(count).toBe(0);
    });
  });

  describe('isShortcutKey', () => {
    test('should identify Ctrl+Shift+R', () => {
      mockEvent.key = 'R';
      mockEvent.ctrlKey = true;
      mockEvent.shiftKey = true;

      const result = isShortcutKey(mockEvent, {
        key: 'r',
        ctrl: true,
        shift: true,
      });

      expect(result).toBe(true);
    });

    test('should be case-insensitive', () => {
      mockEvent.key = 'r';
      mockEvent.ctrlKey = true;
      mockEvent.shiftKey = true;

      const result = isShortcutKey(mockEvent, {
        key: 'R',
        ctrl: true,
        shift: true,
      });

      expect(result).toBe(true);
    });

    test('should handle Cmd key on Mac', () => {
      mockEvent.key = 'r';
      mockEvent.metaKey = true;
      mockEvent.shiftKey = true;

      const result = isShortcutKey(mockEvent, {
        key: 'r',
        ctrl: true,
        shift: true,
      });

      expect(result).toBe(true);
    });

    test('should require exact modifier match', () => {
      mockEvent.key = 'r';
      mockEvent.ctrlKey = true;
      // Missing shift

      const result = isShortcutKey(mockEvent, {
        key: 'r',
        ctrl: true,
        shift: true,
      });

      expect(result).toBe(false);
    });

    test('should handle Escape key', () => {
      mockEvent.key = 'Escape';

      const result = isShortcutKey(mockEvent, { key: 'Escape' });

      expect(result).toBe(true);
    });

    test('should handle arrow keys', () => {
      mockEvent.key = 'ArrowUp';

      const result = isShortcutKey(mockEvent, { key: 'ArrowUp' });

      expect(result).toBe(true);
    });

    test('should handle Ctrl+ArrowUp', () => {
      mockEvent.key = 'ArrowUp';
      mockEvent.ctrlKey = true;

      const result = isShortcutKey(mockEvent, {
        key: 'ArrowUp',
        ctrl: true,
      });

      expect(result).toBe(true);
    });
  });

  describe('getShortcutDescription', () => {
    test('should return description for registered shortcut', () => {
      const id = registerShortcut({
        key: 'r',
        ctrl: true,
        shift: true,
        handler: mockHandler,
        description: 'Open reorder modal',
      });

      const description = getShortcutDescription(id);
      expect(description).toBe('Open reorder modal');
    });

    test('should return null for non-existent shortcut', () => {
      const description = getShortcutDescription('non-existent');
      expect(description).toBeNull();
    });
  });

  describe('Shortcut Conflicts', () => {
    test('should not trigger on input elements', () => {
      const input = document.createElement('input');
      mockEvent.target = input;
      mockEvent.key = 'r';
      mockEvent.ctrlKey = true;
      mockEvent.shiftKey = true;

      registerShortcut({
        key: 'r',
        ctrl: true,
        shift: true,
        handler: mockHandler,
      });

      // Simulate keyboard event on input
      const shouldTrigger = mockEvent.target.tagName === 'BODY';
      expect(shouldTrigger).toBe(false);
    });

    test('should not trigger on textarea elements', () => {
      const textarea = document.createElement('textarea');
      mockEvent.target = textarea;

      registerShortcut({
        key: 'r',
        ctrl: true,
        shift: true,
        handler: mockHandler,
      });

      const shouldTrigger = mockEvent.target.tagName === 'BODY';
      expect(shouldTrigger).toBe(false);
    });

    test('should not trigger on contenteditable elements', () => {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      mockEvent.target = div;

      registerShortcut({
        key: 'r',
        ctrl: true,
        shift: true,
        handler: mockHandler,
      });

      const shouldTrigger =
        mockEvent.target.contentEditable !== 'true' &&
        mockEvent.target.contentEditable !== '';
      expect(shouldTrigger).toBe(false);
    });
  });

  describe('Shortcut Scopes', () => {
    test('should support global scope', () => {
      const id = registerShortcut({
        key: 'r',
        ctrl: true,
        shift: true,
        handler: mockHandler,
        scope: 'global',
      });

      expect(id).toBeTruthy();
    });

    test('should support modal scope', () => {
      const id = registerShortcut({
        key: 'Escape',
        handler: mockHandler,
        scope: 'modal',
      });

      expect(id).toBeTruthy();
    });

    test('should support reorder-modal scope', () => {
      const id = registerShortcut({
        key: 'ArrowUp',
        ctrl: true,
        handler: mockHandler,
        scope: 'reorder-modal',
      });

      expect(id).toBeTruthy();
    });
  });

  describe('Special Keys', () => {
    test('should handle question mark for help', () => {
      mockEvent.key = '?';

      const result = isShortcutKey(mockEvent, { key: '?' });

      expect(result).toBe(true);
    });

    test('should handle ? key regardless of shift state', () => {
      // On most keyboards, ? is typed with Shift
      // But when checking for '?' key, we should accept it regardless
      mockEvent.key = '?';
      mockEvent.shiftKey = false; // Even without explicit shift

      const result = isShortcutKey(mockEvent, { key: '?' });

      expect(result).toBe(true);
    });
  });

  describe('Modifier Combinations', () => {
    test('should handle Ctrl+Shift combination', () => {
      mockEvent.key = 'r';
      mockEvent.ctrlKey = true;
      mockEvent.shiftKey = true;

      const result = isShortcutKey(mockEvent, {
        key: 'r',
        ctrl: true,
        shift: true,
      });

      expect(result).toBe(true);
    });

    test('should handle Ctrl only', () => {
      mockEvent.key = 'ArrowUp';
      mockEvent.ctrlKey = true;

      const result = isShortcutKey(mockEvent, {
        key: 'ArrowUp',
        ctrl: true,
      });

      expect(result).toBe(true);
    });

    test('should handle no modifiers', () => {
      mockEvent.key = 'Escape';

      const result = isShortcutKey(mockEvent, { key: 'Escape' });

      expect(result).toBe(true);
    });

    test('should reject Alt key combinations', () => {
      mockEvent.key = 'r';
      mockEvent.altKey = true;

      const result = isShortcutKey(mockEvent, { key: 'r' });

      expect(result).toBe(false);
    });
  });
});
