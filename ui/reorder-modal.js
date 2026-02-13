/**
 * Reorder Modal
 * Drag-and-drop interface for file reordering
 */

import { getCurrentOrder } from '../content/dom-manipulator.js';
import { extractAllFilesMetadata } from '../utils/parser.js';
import { getAllPresets, applyPreset } from '../utils/presets.js';
import { savePreference, loadPreference } from '../utils/storage.js';

/**
 * Create and show reorder modal
 * @param {Object} options - Modal options
 * @param {Array<string>} [options.initialOrder] - Initial file order
 * @param {Function} options.onSave - Callback when order is saved
 * @param {Function} [options.onCancel] - Callback when cancelled
 * @returns {Object} Modal instance
 */
export function createReorderModal(options = {}) {
  const { initialOrder, onSave, onCancel } = options;

  // Get current files
  const filesMetadata = extractAllFilesMetadata();
  const currentOrder = initialOrder || getCurrentOrder();

  // Create modal structure
  const overlay = createModalOverlay();
  const modal = createModalDialog();
  const header = createModalHeader();
  const presetBar = createPresetBar();
  const body = createModalBody();
  const footer = createModalFooter();

  // Create file list
  const fileList = createFileList(filesMetadata, currentOrder);

  // Assemble modal
  body.appendChild(fileList);
  modal.appendChild(header);
  modal.appendChild(presetBar);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);

  // Setup drag and drop
  setupDragAndDrop(fileList, {
    onDragStart: () => {
      // Drag started
    },
    onDragEnd: () => {
      // Drag ended
    },
  });

  // Setup keyboard navigation
  setupKeyboardNavigation(fileList);

  // Setup event handlers
  const closeBtn = header.querySelector('.pr-reorder-modal-close');
  const cancelBtn = footer.querySelector('[data-action="cancel"]');
  const saveBtn = footer.querySelector('[data-action="save"]');
  const presetSelect = presetBar.querySelector('.pr-reorder-preset-select');

  const close = () => {
    overlay.remove();
    if (onCancel) onCancel();
  };

  const save = () => {
    const newOrder = getOrderFromList(fileList);
    overlay.remove();
    if (onSave) onSave(newOrder);
  };

  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  saveBtn.addEventListener('click', save);

  // Handle preset selection
  presetSelect.addEventListener('change', async (e) => {
    const presetId = e.target.value;

    if (!presetId) {
      return;
    }

    try {
      // Apply preset
      const sorted = applyPreset(presetId, filesMetadata);

      // Update file list
      updateFileList(fileList, sorted);

      // Save last used preset
      await savePreference('lastPreset', presetId);
    } catch (error) {
      console.error('Failed to apply preset:', error);
    }
  });

  // Load and set last used preset
  loadPreference('lastPreset').then((lastPreset) => {
    if (lastPreset) {
      presetSelect.value = lastPreset;
    }
  });

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

  // Focus first file item
  const firstItem = fileList.querySelector('.pr-reorder-file-item');
  if (firstItem) {
    firstItem.focus();
  }

  return {
    close,
    getOrder: () => getOrderFromList(fileList),
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
  modal.className = 'pr-reorder-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'pr-reorder-modal-title');
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
  title.id = 'pr-reorder-modal-title';
  title.className = 'pr-reorder-modal-title';
  title.textContent = 'Reorder Files';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'pr-reorder-modal-close';
  closeBtn.setAttribute('aria-label', 'Close modal');

  // SECURITY: innerHTML used only for static SVG icons (safe)
  closeBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
    </svg>
  `;

  header.appendChild(title);
  header.appendChild(closeBtn);

  return header;
}

/**
 * Create preset bar with dropdown
 * @returns {HTMLElement}
 */
function createPresetBar() {
  const bar = document.createElement('div');
  bar.className = 'pr-reorder-preset-bar';

  const label = document.createElement('label');
  label.className = 'pr-reorder-preset-label';
  label.textContent = 'Quick sort:';
  label.setAttribute('for', 'pr-reorder-preset-select');

  const select = document.createElement('select');
  select.id = 'pr-reorder-preset-select';
  select.className = 'pr-reorder-preset-select';

  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Choose a preset...';
  select.appendChild(defaultOption);

  // Add preset options
  const presets = getAllPresets();
  presets.forEach((preset) => {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = preset.name;
    option.title = preset.description;
    select.appendChild(option);
  });

  bar.appendChild(label);
  bar.appendChild(select);

  return bar;
}

/**
 * Create modal body
 * @returns {HTMLElement}
 */
function createModalBody() {
  const body = document.createElement('div');
  body.className = 'pr-reorder-modal-body';
  return body;
}

/**
 * Create modal footer
 * @returns {HTMLElement}
 */
function createModalFooter() {
  const footer = document.createElement('div');
  footer.className = 'pr-reorder-modal-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'pr-reorder-btn pr-reorder-btn-secondary';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.setAttribute('data-action', 'cancel');

  const saveBtn = document.createElement('button');
  saveBtn.className = 'pr-reorder-btn pr-reorder-btn-primary';
  saveBtn.textContent = 'Save & Apply';
  saveBtn.setAttribute('data-action', 'save');

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);

  return footer;
}

/**
 * Create file list
 * @param {Array<Object>} filesMetadata - File metadata
 * @param {Array<string>} order - Current order
 * @returns {HTMLElement}
 */
function createFileList(filesMetadata, order) {
  const list = document.createElement('ul');
  list.className = 'pr-reorder-file-list';
  list.setAttribute('role', 'list');

  // Create map for quick lookup
  const metadataMap = new Map();
  filesMetadata.forEach((meta) => {
    metadataMap.set(meta.path, meta);
  });

  // Add files in current order
  order.forEach((filePath, index) => {
    const metadata = metadataMap.get(filePath);
    if (metadata) {
      const item = createFileItem(metadata, index);
      list.appendChild(item);
    }
  });

  return list;
}

/**
 * Create file list item
 * @param {Object} metadata - File metadata
 * @param {number} index - Item index
 * @returns {HTMLElement}
 */
function createFileItem(metadata, index) {
  const item = document.createElement('li');
  item.className = 'pr-reorder-file-item';
  item.setAttribute('draggable', 'true');
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'listitem');
  item.setAttribute('aria-label', `${metadata.path}, position ${index + 1}`);
  item.dataset.path = metadata.path;

  // Drag handle
  const handle = document.createElement('div');
  handle.className = 'pr-reorder-file-handle';
  handle.setAttribute('aria-hidden', 'true');

  // SECURITY: innerHTML used only for static SVG icons (safe)
  handle.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4h4v2h-4V4zm0 7h4v2h-4v-2zm0 7h4v2h-4v-2z"></path>
      <path d="M6 4h4v2H6V4zm0 7h4v2H6v-2zm0 7h4v2H6v-2z"></path>
    </svg>
  `;

  // File path - SECURITY: Using textContent for user data
  const path = document.createElement('span');
  path.className = 'pr-reorder-file-path';
  path.textContent = metadata.path;

  item.appendChild(handle);
  item.appendChild(path);

  // Add change stats if available
  if (metadata.additions > 0 || metadata.deletions > 0) {
    const changes = document.createElement('span');
    changes.className = 'pr-reorder-file-changes';

    if (metadata.additions > 0) {
      const additions = document.createElement('span');
      additions.className = 'pr-reorder-file-additions';
      additions.textContent = `+${metadata.additions}`;
      changes.appendChild(additions);
      changes.appendChild(document.createTextNode(' '));
    }

    if (metadata.deletions > 0) {
      const deletions = document.createElement('span');
      deletions.className = 'pr-reorder-file-deletions';
      deletions.textContent = `-${metadata.deletions}`;
      changes.appendChild(deletions);
    }

    item.appendChild(changes);
  }

  return item;
}

/**
 * Setup drag and drop behavior
 * @param {HTMLElement} list - File list element
 * @param {Object} callbacks - Event callbacks
 */
function setupDragAndDrop(list, callbacks) {
  let dragOverItem = null;

  list.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.pr-reorder-file-item');
    if (!item) return;

    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.dataset.path);

    const index = Array.from(list.children).indexOf(item);
    if (callbacks.onDragStart) {
      callbacks.onDragStart(item, index);
    }
  });

  list.addEventListener('dragend', (e) => {
    const item = e.target.closest('.pr-reorder-file-item');
    if (!item) return;

    item.classList.remove('dragging');

    // Remove drag-over class from all items
    list.querySelectorAll('.drag-over').forEach((el) => {
      el.classList.remove('drag-over');
    });

    if (callbacks.onDragEnd) {
      callbacks.onDragEnd();
    }
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const item = e.target.closest('.pr-reorder-file-item');
    if (!item || item.classList.contains('dragging')) return;

    // Remove previous drag-over
    if (dragOverItem && dragOverItem !== item) {
      dragOverItem.classList.remove('drag-over');
    }

    item.classList.add('drag-over');
    dragOverItem = item;
  });

  list.addEventListener('dragleave', (e) => {
    const item = e.target.closest('.pr-reorder-file-item');
    if (!item) return;

    item.classList.remove('drag-over');
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();

    const dropTarget = e.target.closest('.pr-reorder-file-item');
    const dragging = list.querySelector('.dragging');

    if (!dropTarget || !dragging || dropTarget === dragging) {
      return;
    }

    // Remove drag-over class
    dropTarget.classList.remove('drag-over');

    // Reorder items
    const items = Array.from(list.children);
    const dragIndex = items.indexOf(dragging);
    const dropIndex = items.indexOf(dropTarget);

    if (dragIndex < dropIndex) {
      dropTarget.after(dragging);
    } else {
      dropTarget.before(dragging);
    }

    // Update aria-labels
    updateAriaLabels(list);
  });
}

/**
 * Setup keyboard navigation
 * @param {HTMLElement} list - File list element
 */
function setupKeyboardNavigation(list) {
  list.addEventListener('keydown', (e) => {
    const item = e.target.closest('.pr-reorder-file-item');
    if (!item) return;

    const items = Array.from(list.children);
    const index = items.indexOf(item);

    let handled = false;

    // Move up (Ctrl+↑ or Cmd+↑)
    if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
      if (index > 0) {
        items[index - 1].before(item);
        item.focus();
        updateAriaLabels(list);
        handled = true;
      }
    }

    // Move down (Ctrl+↓ or Cmd+↓)
    if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
      if (index < items.length - 1) {
        items[index + 1].after(item);
        item.focus();
        updateAriaLabels(list);
        handled = true;
      }
    }

    // Navigate up (↑)
    if (!e.ctrlKey && !e.metaKey && e.key === 'ArrowUp') {
      if (index > 0) {
        items[index - 1].focus();
        handled = true;
      }
    }

    // Navigate down (↓)
    if (!e.ctrlKey && !e.metaKey && e.key === 'ArrowDown') {
      if (index < items.length - 1) {
        items[index + 1].focus();
        handled = true;
      }
    }

    if (handled) {
      e.preventDefault();
    }
  });
}

/**
 * Update aria-labels after reordering
 * @param {HTMLElement} list - File list element
 */
function updateAriaLabels(list) {
  const items = list.querySelectorAll('.pr-reorder-file-item');
  items.forEach((item, index) => {
    const path = item.dataset.path;
    item.setAttribute('aria-label', `${path}, position ${index + 1}`);
  });
}

/**
 * Get current order from list
 * @param {HTMLElement} list - File list element
 * @returns {Array<string>} Ordered file paths
 */
function getOrderFromList(list) {
  return Array.from(list.children).map((item) => item.dataset.path);
}

/**
 * Update file list with new order
 * @param {HTMLElement} list - File list element
 * @param {Array<Object>} filesMetadata - Sorted file metadata
 */
function updateFileList(list, filesMetadata) {
  // Create a map of existing items by path for reuse
  const existingItems = new Map();
  Array.from(list.children).forEach((item) => {
    existingItems.set(item.dataset.path, item);
  });

  // Clear the list
  list.innerHTML = '';

  // Add files in new order
  filesMetadata.forEach((metadata, index) => {
    const existingItem = existingItems.get(metadata.path);
    if (existingItem) {
      // Reuse existing item to preserve event listeners
      existingItem.setAttribute(
        'aria-label',
        `${metadata.path}, position ${index + 1}`
      );
      list.appendChild(existingItem);
    } else {
      // Create new item if not found
      const item = createFileItem(metadata, index);
      list.appendChild(item);
    }
  });
}
