/**
 * Keyboard Help Modal
 * Display all available keyboard shortcuts
 */

import { formatShortcut, DEFAULT_SHORTCUTS } from '../utils/keyboard.js';

/**
 * Create and show keyboard help modal
 * @param {Object} options - Modal options
 * @param {Function} [options.onClose] - Callback when modal closes
 * @returns {Object} Modal instance
 */
export function createKeyboardHelpModal(options = {}) {
  const { onClose } = options;

  // Create modal structure
  const overlay = createModalOverlay();
  const modal = createModalDialog();
  const header = createModalHeader();
  const body = createModalBody();
  const footer = createModalFooter();

  // Create shortcuts sections
  const globalSection = createShortcutsSection('Global Shortcuts', [
    {
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.REORDER_MODAL),
      description: DEFAULT_SHORTCUTS.REORDER_MODAL.description,
    },
    {
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.VIEW_ORDERS),
      description: DEFAULT_SHORTCUTS.VIEW_ORDERS.description,
    },
    {
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.APPLY_CONSENSUS),
      description: DEFAULT_SHORTCUTS.APPLY_CONSENSUS.description,
    },
    {
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.HELP),
      description: DEFAULT_SHORTCUTS.HELP.description,
    },
  ]);

  const modalSection = createShortcutsSection('Modal Shortcuts', [
    {
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.CLOSE_MODAL),
      description: DEFAULT_SHORTCUTS.CLOSE_MODAL.description,
    },
  ]);

  const navigationSection = createShortcutsSection('File Navigation', [
    {
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.NAVIGATE_UP),
      description: DEFAULT_SHORTCUTS.NAVIGATE_UP.description,
    },
    {
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.NAVIGATE_DOWN),
      description: DEFAULT_SHORTCUTS.NAVIGATE_DOWN.description,
    },
    {
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.MOVE_UP),
      description: DEFAULT_SHORTCUTS.MOVE_UP.description,
    },
    {
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.MOVE_DOWN),
      description: DEFAULT_SHORTCUTS.MOVE_DOWN.description,
    },
  ]);

  // Assemble modal
  body.appendChild(globalSection);
  body.appendChild(modalSection);
  body.appendChild(navigationSection);
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);

  // Setup event handlers
  const closeBtn = header.querySelector('.pr-reorder-modal-close');
  const doneBtn = footer.querySelector('[data-action="done"]');

  const close = () => {
    overlay.remove();
    if (onClose) onClose();
  };

  closeBtn.addEventListener('click', close);
  doneBtn.addEventListener('click', close);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      close();
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Add to DOM
  document.body.appendChild(overlay);

  return {
    close,
  };
}

/**
 * Create modal overlay
 * @returns {HTMLElement}
 */
function createModalOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'pr-reorder-modal-overlay';
  return overlay;
}

/**
 * Create modal dialog
 * @returns {HTMLElement}
 */
function createModalDialog() {
  const modal = document.createElement('div');
  modal.className = 'pr-reorder-modal pr-keyboard-help-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'pr-keyboard-help-title');
  return modal;
}

/**
 * Create modal header
 * @returns {HTMLElement}
 */
function createModalHeader() {
  const header = document.createElement('div');
  header.className = 'pr-reorder-modal-header';

  const title = document.createElement('h2');
  title.id = 'pr-keyboard-help-title';
  title.className = 'pr-reorder-modal-title';
  title.textContent = 'Keyboard Shortcuts';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'pr-reorder-modal-close';
  closeBtn.setAttribute('aria-label', 'Close modal');

  // Create SVG for close button
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'currentColor');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    'M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z'
  );

  svg.appendChild(path);
  closeBtn.appendChild(svg);

  header.appendChild(title);
  header.appendChild(closeBtn);

  return header;
}

/**
 * Create modal body
 * @returns {HTMLElement}
 */
function createModalBody() {
  const body = document.createElement('div');
  body.className = 'pr-reorder-modal-body pr-keyboard-help-body';
  return body;
}

/**
 * Create modal footer
 * @returns {HTMLElement}
 */
function createModalFooter() {
  const footer = document.createElement('div');
  footer.className = 'pr-reorder-modal-footer';

  const doneBtn = document.createElement('button');
  doneBtn.className = 'pr-reorder-btn pr-reorder-btn-primary';
  doneBtn.textContent = 'Got it';
  doneBtn.setAttribute('data-action', 'done');

  footer.appendChild(doneBtn);

  return footer;
}

/**
 * Create shortcuts section
 * @param {string} title - Section title
 * @param {Array<Object>} shortcuts - Array of {shortcut, description}
 * @returns {HTMLElement}
 */
function createShortcutsSection(title, shortcuts) {
  const section = document.createElement('div');
  section.className = 'pr-keyboard-section';

  const heading = document.createElement('h3');
  heading.className = 'pr-keyboard-section-title';
  heading.textContent = title;

  section.appendChild(heading);

  const list = document.createElement('dl');
  list.className = 'pr-keyboard-list';

  shortcuts.forEach(({ shortcut, description }) => {
    const dt = document.createElement('dt');
    dt.className = 'pr-keyboard-shortcut';

    const kbd = document.createElement('kbd');
    kbd.className = 'pr-keyboard-key';
    kbd.textContent = shortcut;

    dt.appendChild(kbd);

    const dd = document.createElement('dd');
    dd.className = 'pr-keyboard-description';
    dd.textContent = description;

    list.appendChild(dt);
    list.appendChild(dd);
  });

  section.appendChild(list);

  return section;
}
