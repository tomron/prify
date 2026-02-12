/**
 * Keyboard Shortcuts Handler
 * Manages keyboard shortcuts for the extension with conflict prevention
 */

// Store registered shortcuts
const shortcuts = new Map();
let keydownListener = null;

/**
 * Register a keyboard shortcut
 * @param {Object} options - Shortcut options
 * @param {string} options.key - Key name (case-insensitive)
 * @param {boolean} [options.ctrl=false] - Requires Ctrl/Cmd key
 * @param {boolean} [options.shift=false] - Requires Shift key
 * @param {boolean} [options.alt=false] - Requires Alt key
 * @param {Function} options.handler - Callback when shortcut triggered
 * @param {string} [options.description] - Human-readable description
 * @param {string} [options.scope='global'] - Scope: 'global', 'modal', 'reorder-modal'
 * @returns {string} Unique shortcut ID
 * @throws {Error} If required options missing
 */
export function registerShortcut(options) {
  const {
    key,
    ctrl = false,
    shift = false,
    alt = false,
    handler,
    description = '',
    scope = 'global',
  } = options;

  // Validate required options
  if (!key) {
    throw new Error('Shortcut key is required');
  }
  if (!handler || typeof handler !== 'function') {
    throw new Error('Shortcut handler is required and must be a function');
  }

  // Generate unique ID
  const id = `${scope}-${key}-${ctrl}-${shift}-${alt}-${Date.now()}`;

  // Store shortcut
  shortcuts.set(id, {
    key: key.toLowerCase(),
    ctrl,
    shift,
    alt,
    handler,
    description,
    scope,
  });

  // Initialize global listener if not already active
  if (!keydownListener) {
    initializeListener();
  }

  return id;
}

/**
 * Unregister a specific shortcut
 * @param {string} id - Shortcut ID returned from registerShortcut
 * @returns {boolean} True if shortcut was found and removed
 */
export function unregisterShortcut(id) {
  return shortcuts.delete(id);
}

/**
 * Unregister all shortcuts
 * @returns {number} Number of shortcuts removed
 */
export function unregisterAllShortcuts() {
  const count = shortcuts.size;
  shortcuts.clear();

  // Remove listener if no shortcuts remain
  if (keydownListener) {
    document.removeEventListener('keydown', keydownListener);
    keydownListener = null;
  }

  return count;
}

/**
 * Check if event matches shortcut definition
 * @param {KeyboardEvent} event - Keyboard event
 * @param {Object} shortcut - Shortcut definition
 * @returns {boolean} True if event matches shortcut
 */
export function isShortcutKey(event, shortcut) {
  // Normalize key comparison (case-insensitive)
  const eventKey = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();

  if (eventKey !== shortcutKey) {
    return false;
  }

  // Check modifiers
  // Ctrl key: Accept either Ctrl or Meta (Cmd on Mac)
  const ctrlPressed = event.ctrlKey || event.metaKey;
  const ctrlRequired = shortcut.ctrl || false;

  if (ctrlPressed !== ctrlRequired) {
    return false;
  }

  // Shift key
  const shiftPressed = event.shiftKey;
  const shiftRequired = shortcut.shift || false;

  if (shiftPressed !== shiftRequired) {
    return false;
  }

  // Alt key
  const altPressed = event.altKey;
  const altRequired = shortcut.alt || false;

  if (altPressed !== altRequired) {
    return false;
  }

  return true;
}

/**
 * Get description for a registered shortcut
 * @param {string} id - Shortcut ID
 * @returns {string|null} Description or null if not found
 */
export function getShortcutDescription(id) {
  const shortcut = shortcuts.get(id);
  return shortcut ? shortcut.description : null;
}

/**
 * Get all registered shortcuts
 * @param {string} [scope] - Filter by scope
 * @returns {Array<Object>} Array of shortcut objects
 */
export function getAllShortcuts(scope = null) {
  const result = [];

  shortcuts.forEach((shortcut, id) => {
    if (scope === null || shortcut.scope === scope) {
      result.push({
        id,
        ...shortcut,
      });
    }
  });

  return result;
}

/**
 * Format shortcut for display
 * @param {Object} shortcut - Shortcut definition
 * @returns {string} Formatted shortcut (e.g., "Ctrl+Shift+R")
 */
export function formatShortcut(shortcut) {
  const parts = [];

  if (shortcut.ctrl) {
    // Use Cmd on Mac, Ctrl elsewhere
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    parts.push(isMac ? 'Cmd' : 'Ctrl');
  }

  if (shortcut.shift) {
    parts.push('Shift');
  }

  if (shortcut.alt) {
    parts.push('Alt');
  }

  // Format key name
  let keyName = shortcut.key;
  if (keyName.startsWith('Arrow')) {
    keyName = keyName.replace('Arrow', '');
  }
  parts.push(keyName.charAt(0).toUpperCase() + keyName.slice(1));

  return parts.join('+');
}

/**
 * Check if target element should ignore shortcuts
 * @param {HTMLElement} target - Event target
 * @returns {boolean} True if shortcuts should be ignored
 */
function shouldIgnoreTarget(target) {
  if (!target) return true;

  // Ignore inputs and textareas
  const tagName = target.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }

  // Ignore contenteditable elements
  if (
    target.contentEditable === 'true' ||
    target.contentEditable === 'plaintext-only'
  ) {
    return true;
  }

  return false;
}

/**
 * Initialize global keydown listener
 */
function initializeListener() {
  keydownListener = (event) => {
    // Ignore if target is an input element
    if (shouldIgnoreTarget(event.target)) {
      return;
    }

    // Check all registered shortcuts
    for (const [id, shortcut] of shortcuts) {
      if (isShortcutKey(event, shortcut)) {
        // Prevent default browser behavior
        event.preventDefault();
        event.stopPropagation();

        // Call handler
        try {
          shortcut.handler(event);
        } catch (error) {
          console.error(`[Keyboard] Error in shortcut handler (${id}):`, error);
        }

        // Only trigger first matching shortcut
        break;
      }
    }
  };

  document.addEventListener('keydown', keydownListener);
}

/**
 * Default shortcuts configuration
 */
export const DEFAULT_SHORTCUTS = {
  REORDER_MODAL: {
    key: 'r',
    ctrl: true,
    shift: true,
    description: 'Open reorder modal',
  },
  VIEW_ORDERS: {
    key: 'v',
    ctrl: true,
    shift: true,
    description: 'View all orders',
  },
  APPLY_CONSENSUS: {
    key: 'c',
    ctrl: true,
    shift: true,
    description: 'Apply consensus order',
  },
  CLOSE_MODAL: {
    key: 'Escape',
    description: 'Close modal',
  },
  NAVIGATE_UP: {
    key: 'ArrowUp',
    description: 'Navigate up',
  },
  NAVIGATE_DOWN: {
    key: 'ArrowDown',
    description: 'Navigate down',
  },
  MOVE_UP: {
    key: 'ArrowUp',
    ctrl: true,
    description: 'Move file up',
  },
  MOVE_DOWN: {
    key: 'ArrowDown',
    ctrl: true,
    description: 'Move file down',
  },
  HELP: {
    key: '?',
    description: 'Show keyboard shortcuts help',
  },
};
