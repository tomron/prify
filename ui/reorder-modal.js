/**
 * Reorder Modal
 * Drag-and-drop interface for file reordering
 */

import { getCurrentOrder } from '../content/dom-manipulator.js';
import { extractAllFilesMetadata } from '../utils/parser.js';
import { getAllPresets, applyPreset } from '../utils/presets.js';
import { savePreference, loadPreference } from '../utils/storage.js';
import {
  downloadOrderAsJSON,
  importOrderFromJSON,
  generateShareableURL,
  copyToClipboard,
} from '../utils/export-import.js';
import { getPRId, getCurrentUser } from '../content/github-api.js';
import { showNotification } from '../utils/error-handler.js';
import {
  filterFiles,
  highlightMatches,
  getFileCountMessage,
} from '../utils/search-filter.js';

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

  // Create ARIA live regions for announcements
  const ariaLivePolite = createAriaLiveRegion('polite');
  const ariaLiveAssertive = createAriaLiveRegion('assertive');
  modal.appendChild(ariaLivePolite);
  modal.appendChild(ariaLiveAssertive);

  // Handle edge case: no files in PR
  if (filesMetadata.length === 0) {
    const emptyState = createEmptyState({
      icon: '📄',
      title: 'No files to reorder',
      message: 'This PR has no changed files',
      variant: '',
    });

    // Create empty file list container
    const fileList = document.createElement('div');
    fileList.appendChild(emptyState);

    // Assemble modal with empty state
    body.appendChild(fileList);
    modal.appendChild(header);
    modal.appendChild(presetBar);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);

    // Disable save button
    const saveBtn = footer.querySelector('[data-action="save"]');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.setAttribute('aria-disabled', 'true');
    }

    // Setup close handlers
    const closeBtn = header.querySelector('.pr-reorder-modal-close');
    const cancelBtn = footer.querySelector('[data-action="cancel"]');

    const triggerButton = document.activeElement;
    const close = () => {
      modal.classList.add('pr-reorder-modal-exiting');
      setTimeout(() => {
        overlay.remove();
        if (triggerButton && triggerButton.focus) {
          triggerButton.focus();
        }
        if (onCancel) onCancel();
      }, 200);
    };

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    document.body.appendChild(overlay);
    modal.classList.add('pr-reorder-modal-entering');

    return { close, getOrder: () => [] };
  }

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
  const exportBtn = footer.querySelector('[data-action="export"]');
  const importBtn = footer.querySelector('[data-action="import"]');
  const shareBtn = footer.querySelector('[data-action="share"]');
  const presetSelect = presetBar.querySelector('.pr-reorder-preset-select');

  // Store reference to trigger button for focus restoration
  const triggerButton = document.activeElement;

  const close = () => {
    // Add exit animation
    modal.classList.add('pr-reorder-modal-exiting');

    // Wait for animation to complete before removing
    setTimeout(() => {
      overlay.remove();
      // Restore focus to trigger button
      if (triggerButton && triggerButton.focus) {
        triggerButton.focus();
      }
      if (onCancel) onCancel();
    }, 200); // Match --pr-duration-normal
  };

  const save = () => {
    const newOrder = getOrderFromList(fileList);
    // Add exit animation
    modal.classList.add('pr-reorder-modal-exiting');

    // Wait for animation to complete before removing
    setTimeout(() => {
      overlay.remove();
      // Restore focus to trigger button
      if (triggerButton && triggerButton.focus) {
        triggerButton.focus();
      }
      if (onSave) onSave(newOrder);
    }, 200); // Match --pr-duration-normal
  };

  const handleExport = async () => {
    setButtonLoading(exportBtn, true, 'Exporting...');

    try {
      const order = getOrderFromList(fileList);
      const prId = getPRId();
      const user = getCurrentUser();

      // Simulate async operation with small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 100));

      downloadOrderAsJSON(order, prId, user);
      showNotification('Order exported successfully', 'success');
      announceToScreenReader('Order exported successfully', 'polite', modal);
    } catch (error) {
      console.error('Failed to export order:', error);
      showNotification('Failed to export order', 'error');
      announceToScreenReader('Failed to export order', 'polite', modal);
    } finally {
      setButtonLoading(exportBtn, false);
    }
  };

  const handleImport = () => {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setButtonLoading(importBtn, true, 'Importing...');

      try {
        const text = await file.text();
        const importedData = importOrderFromJSON(text);

        // Update file list with imported order
        const sortedMetadata = importedData.order
          .map((path) => filesMetadata.find((m) => m.path === path))
          .filter(Boolean);

        // Count matches
        const matchedCount = sortedMetadata.length;
        const totalCount = importedData.order.length;

        updateFileList(fileList, sortedMetadata);

        const successMessage =
          matchedCount < totalCount
            ? `Imported ${matchedCount} of ${totalCount} files from ${importedData.user}`
            : `Order imported from ${importedData.user}`;

        showNotification(
          successMessage,
          matchedCount < totalCount ? 'warning' : 'success'
        );
        announceToScreenReader(successMessage, 'polite', modal);
      } catch (error) {
        console.error('Failed to import order:', error);
        showNotification(`Import failed: ${error.message}`, 'error');
      } finally {
        setButtonLoading(importBtn, false);
      }
    });

    fileInput.click();
  };

  const handleShare = async () => {
    setButtonLoading(shareBtn, true, 'Generating...');

    try {
      const order = getOrderFromList(fileList);
      const prId = getPRId();
      const user = getCurrentUser();
      const url = generateShareableURL(order, prId, user);

      await copyToClipboard(url);
      showNotification('Shareable URL copied to clipboard', 'success');
      announceToScreenReader(
        'Shareable URL copied to clipboard',
        'polite',
        modal
      );
    } catch (error) {
      console.error('Failed to generate shareable URL:', error);
      showNotification('Failed to generate shareable URL', 'error');
      announceToScreenReader(
        'Failed to generate shareable URL',
        'polite',
        modal
      );
    } finally {
      setButtonLoading(shareBtn, false);
    }
  };

  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  saveBtn.addEventListener('click', save);
  exportBtn.addEventListener('click', handleExport);
  importBtn.addEventListener('click', handleImport);
  shareBtn.addEventListener('click', handleShare);

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

  // Setup search functionality
  setupSearchHandlers(header, fileList, filesMetadata, currentOrder);

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

  // Add entering animation class
  modal.classList.add('pr-reorder-modal-entering');

  // Focus first file item after animation completes
  setTimeout(() => {
    const firstItem = fileList.querySelector('.pr-reorder-file-item');
    if (firstItem) {
      firstItem.focus();
    }
    // Remove entering class after animation
    modal.classList.remove('pr-reorder-modal-entering');
  }, 250); // Match --pr-duration-slow

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

  const titleRow = document.createElement('div');
  titleRow.className = 'pr-reorder-modal-title-row';

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

  titleRow.appendChild(title);
  titleRow.appendChild(closeBtn);

  // Create search bar
  const searchBar = createSearchBar();

  header.appendChild(titleRow);
  header.appendChild(searchBar);

  return header;
}

/**
 * Create search bar
 * @returns {HTMLElement}
 */
function createSearchBar() {
  const searchBar = document.createElement('div');
  searchBar.className = 'pr-reorder-search-bar';

  const searchContainer = document.createElement('div');
  searchContainer.className = 'pr-reorder-search-container';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'pr-reorder-search-input';
  searchInput.placeholder = 'Search files... (Ctrl+K or /)';
  searchInput.setAttribute('aria-label', 'Search files');
  searchInput.dataset.searchInput = 'true';

  const clearBtn = document.createElement('button');
  clearBtn.className = 'pr-reorder-search-clear';
  clearBtn.setAttribute('aria-label', 'Clear search');
  clearBtn.textContent = '×';
  clearBtn.style.display = 'none';

  const fileCount = document.createElement('div');
  fileCount.className = 'pr-reorder-file-count';
  fileCount.dataset.fileCount = 'true';

  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(clearBtn);

  searchBar.appendChild(searchContainer);
  searchBar.appendChild(fileCount);

  return searchBar;
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

  // Left side: Export/Import buttons
  const leftActions = document.createElement('div');
  leftActions.className = 'pr-reorder-footer-left';
  leftActions.style.cssText = 'display: flex; gap: 8px;';

  const exportBtn = document.createElement('button');
  exportBtn.className = 'pr-reorder-btn pr-reorder-btn-secondary';
  exportBtn.textContent = '📥 Export';
  exportBtn.title = 'Export order as JSON file';
  exportBtn.setAttribute('data-action', 'export');

  const importBtn = document.createElement('button');
  importBtn.className = 'pr-reorder-btn pr-reorder-btn-secondary';
  importBtn.textContent = '📤 Import';
  importBtn.title = 'Import order from JSON file';
  importBtn.setAttribute('data-action', 'import');

  const shareBtn = document.createElement('button');
  shareBtn.className = 'pr-reorder-btn pr-reorder-btn-secondary';
  shareBtn.textContent = '🔗 Share';
  shareBtn.title = 'Generate shareable URL';
  shareBtn.setAttribute('data-action', 'share');

  leftActions.appendChild(exportBtn);
  leftActions.appendChild(importBtn);
  leftActions.appendChild(shareBtn);

  // Right side: Cancel/Save buttons
  const rightActions = document.createElement('div');
  rightActions.className = 'pr-reorder-footer-right';
  rightActions.style.cssText = 'display: flex; gap: 8px; margin-left: auto;';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'pr-reorder-btn pr-reorder-btn-secondary';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.setAttribute('data-action', 'cancel');

  const saveBtn = document.createElement('button');
  saveBtn.className = 'pr-reorder-btn pr-reorder-btn-primary';
  saveBtn.textContent = 'Save & Apply';
  saveBtn.setAttribute('data-action', 'save');

  rightActions.appendChild(cancelBtn);
  rightActions.appendChild(saveBtn);

  footer.appendChild(leftActions);
  footer.appendChild(rightActions);

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
  const total = order.length;
  order.forEach((filePath, index) => {
    const metadata = metadataMap.get(filePath);
    if (metadata) {
      const item = createFileItem(metadata, index, '', total);
      list.appendChild(item);
    }
  });

  return list;
}

/**
 * Create file list item
 * Task 14.1: Include position in aria-label ("path, position X of Y")
 * @param {Object} metadata - File metadata
 * @param {number} index - Item index
 * @param {string} search - Search query for highlighting
 * @param {number} total - Total number of items
 * @returns {HTMLElement}
 */
function createFileItem(metadata, index, search = '', total = 0) {
  const item = document.createElement('li');
  item.className = 'pr-reorder-file-item';
  item.setAttribute('draggable', 'true');
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'listitem');

  // Task 14.1: Include total count in aria-label
  const ariaLabel = total > 0
    ? `${metadata.path}, position ${index + 1} of ${total}`
    : `${metadata.path}, position ${index + 1}`;
  item.setAttribute('aria-label', ariaLabel);
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

  // File path with optional search highlighting
  const path = document.createElement('span');
  path.className = 'pr-reorder-file-path';
  if (search) {
    // SECURITY: highlightMatches already escapes HTML
    path.innerHTML = highlightMatches(search, metadata.path);
  } else {
    // SECURITY: Using textContent for user data
    path.textContent = metadata.path;
  }

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

    // Apply will-change hint for GPU acceleration
    item.style.willChange = 'transform, opacity';

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

    // Remove will-change hint after animation completes
    setTimeout(() => {
      item.style.willChange = 'auto';
    }, 200); // Match animation duration

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

    // Add drop completion animation
    dragging.classList.add('dropping');

    // Reorder items with smooth transition
    const items = Array.from(list.children);
    const dragIndex = items.indexOf(dragging);
    const dropIndex = items.indexOf(dropTarget);

    if (dragIndex < dropIndex) {
      dropTarget.after(dragging);
    } else {
      dropTarget.before(dragging);
    }

    // Remove dropping class after animation
    setTimeout(() => {
      dragging.classList.remove('dropping');
    }, 200); // Match animation duration

    // Update aria-labels
    updateAriaLabels(list);
  });
}

/**
 * Setup keyboard navigation
 * Group 12: Enhanced keyboard navigation with drag mode
 * @param {HTMLElement} list - File list element
 */
function setupKeyboardNavigation(list) {
  // Get modal for ARIA announcements
  const modal = list.closest('.pr-reorder-modal');

  // Track drag mode state
  let dragModeItem = null;
  let dragModeOriginalPosition = null;

  /**
   * Task 12.1, 12.2, 12.3: Enter drag mode
   */
  function enterDragMode(item) {
    dragModeItem = item;
    const items = Array.from(list.children);
    dragModeOriginalPosition = items.indexOf(item);

    // Task 12.2: Add visual indication for drag mode
    item.classList.add('pr-reorder-drag-mode');
    item.setAttribute('aria-grabbed', 'true');

    // Task 12.3: Announce to screen readers
    if (modal) {
      announceToScreenReader(
        'Drag mode activated. Use arrow keys to move, Space to drop, Escape to cancel.',
        'assertive',
        modal
      );
    }
  }

  /**
   * Task 12.7, 12.8: Exit drag mode (cancel)
   */
  function cancelDragMode() {
    if (!dragModeItem) return;

    // Return to original position
    const items = Array.from(list.children);
    const currentIndex = items.indexOf(dragModeItem);

    if (currentIndex !== dragModeOriginalPosition) {
      // Move back to original position
      if (dragModeOriginalPosition === 0) {
        list.prepend(dragModeItem);
      } else {
        items[dragModeOriginalPosition].before(dragModeItem);
      }
      updateAriaLabels(list);
    }

    // Remove visual indication
    dragModeItem.classList.remove('pr-reorder-drag-mode');
    dragModeItem.removeAttribute('aria-grabbed');

    // Task 12.8: Announce cancellation
    if (modal) {
      announceToScreenReader('Drag cancelled', 'assertive', modal);
    }

    dragModeItem = null;
    dragModeOriginalPosition = null;
  }

  /**
   * Task 12.5, 12.6: Complete drop
   */
  function completeDrop() {
    if (!dragModeItem) return;

    const items = Array.from(list.children);
    const newPosition = items.indexOf(dragModeItem) + 1;

    // Remove visual indication
    dragModeItem.classList.remove('pr-reorder-drag-mode');
    dragModeItem.removeAttribute('aria-grabbed');

    // Task 12.6: Announce completion
    if (modal) {
      announceToScreenReader(
        `Dropped at position ${newPosition} of ${items.length}`,
        'assertive',
        modal
      );
    }

    dragModeItem = null;
    dragModeOriginalPosition = null;
  }

  list.addEventListener('keydown', (e) => {
    const item = e.target.closest('.pr-reorder-file-item');
    if (!item) return;

    const items = Array.from(list.children);
    const index = items.indexOf(item);

    let handled = false;
    let newPosition = null;

    // Task 12.1: Enter key activates drag mode
    if (e.key === 'Enter' && !dragModeItem) {
      enterDragMode(item);
      handled = true;
    }

    // Task 12.5: Space key completes drop
    if (e.key === ' ' && dragModeItem === item) {
      e.preventDefault(); // Prevent page scroll
      completeDrop();
      handled = true;
    }

    // Task 12.7: Escape key cancels drag mode
    if (e.key === 'Escape' && dragModeItem === item) {
      cancelDragMode();
      handled = true;
    }

    // Task 12.4: Arrow keys in drag mode move the item
    if (dragModeItem === item) {
      if (e.key === 'ArrowUp' && index > 0) {
        items[index - 1].before(item);
        item.focus();
        updateAriaLabels(list);
        newPosition = index; // New position (1-based for announcement)
        handled = true;
      }

      if (e.key === 'ArrowDown' && index < items.length - 1) {
        items[index + 1].after(item);
        item.focus();
        updateAriaLabels(list);
        newPosition = index + 2; // New position (1-based for announcement)
        handled = true;
      }

      // Announce position during drag mode
      if (newPosition !== null && modal) {
        announceToScreenReader(
          `Position ${newPosition} of ${items.length}`,
          'assertive',
          modal
        );
      }
    } else {
      // Task 12.9: Ensure existing Ctrl/Cmd shortcuts still work
      // Move up (Ctrl+↑ or Cmd+↑)
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
        if (index > 0) {
          items[index - 1].before(item);
          item.focus();
          updateAriaLabels(list);
          newPosition = index; // New position (0-indexed)
          handled = true;
        }
      }

      // Move down (Ctrl+↓ or Cmd+↓)
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
        if (index < items.length - 1) {
          items[index + 1].after(item);
          item.focus();
          updateAriaLabels(list);
          newPosition = index + 2; // New position (0-indexed)
          handled = true;
        }
      }

      // Announce position change for Ctrl/Cmd shortcuts
      if (newPosition !== null && modal) {
        announceToScreenReader(
          `Moved to position ${newPosition} of ${items.length}`,
          'assertive',
          modal
        );
      }

      // Navigate up (↑) - only when not in drag mode
      if (!e.ctrlKey && !e.metaKey && e.key === 'ArrowUp') {
        if (index > 0) {
          items[index - 1].focus();
          handled = true;
        }
      }

      // Navigate down (↓) - only when not in drag mode
      if (!e.ctrlKey && !e.metaKey && e.key === 'ArrowDown') {
        if (index < items.length - 1) {
          items[index + 1].focus();
          handled = true;
        }
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
/**
 * Update aria-labels after reordering
 * Task 14.2: Update aria-labels to reflect new positions
 */
function updateAriaLabels(list) {
  const items = list.querySelectorAll('.pr-reorder-file-item');
  const total = items.length;
  items.forEach((item, index) => {
    const path = item.dataset.path;
    item.setAttribute(
      'aria-label',
      `${path}, position ${index + 1} of ${total}`
    );
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
function updateFileList(list, filesMetadata, search = '') {
  // Create a map of existing items by path for reuse
  const existingItems = new Map();
  Array.from(list.children).forEach((item) => {
    existingItems.set(item.dataset.path, item);
  });

  // Clear the list (safe: no user content)
  while (list.firstChild) {
    list.firstChild.remove();
  }

  const total = filesMetadata.length;

  // Add files in new order
  filesMetadata.forEach((metadata, index) => {
    const existingItem = existingItems.get(metadata.path);
    if (existingItem && !search) {
      // Reuse existing item to preserve event listeners (only when not searching)
      existingItem.setAttribute(
        'aria-label',
        `${metadata.path}, position ${index + 1} of ${total}`
      );
      list.appendChild(existingItem);
    } else {
      // Create new item (or recreate when searching to apply highlighting)
      const item = createFileItem(metadata, index, search, total);
      list.appendChild(item);
    }
  });
}

/**
 * Create ARIA live region for announcements
 * @param {string} priority - 'polite' or 'assertive'
 * @returns {HTMLElement} Live region element
 */
function createAriaLiveRegion(priority = 'polite') {
  const region = document.createElement('div');
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', priority);
  region.setAttribute('aria-atomic', 'true');
  region.className = 'pr-reorder-sr-only';
  return region;
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 * @param {HTMLElement} modal - Modal element containing live regions
 */
function announceToScreenReader(message, priority = 'polite', modal) {
  const region = modal.querySelector(`[aria-live="${priority}"]`);
  if (!region) return;

  // Clear and set new message
  region.textContent = '';
  setTimeout(() => {
    region.textContent = message;
  }, 100); // Small delay to ensure screen readers pick up the change
}

/**
 * Set button loading state
 * @param {HTMLElement} button - Button element
 * @param {boolean} isLoading - Loading state
 * @param {string} loadingText - Text to show while loading
 */
function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
  if (isLoading) {
    // Store original content
    button.dataset.originalText = button.textContent;
    button.dataset.originalHTML = button.innerHTML;

    // Create spinner
    const spinner = document.createElement('span');
    spinner.className = 'pr-reorder-spinner pr-reorder-spinner-dark';
    spinner.style.marginRight = '8px';

    // Set loading state
    button.innerHTML = '';
    button.appendChild(spinner);
    button.appendChild(document.createTextNode(loadingText));
    button.disabled = true;
    // Task 14.6: Add aria-disabled to disabled buttons
    button.setAttribute('aria-disabled', 'true');
    button.setAttribute('aria-busy', 'true');
  } else {
    // Restore original content
    if (button.dataset.originalHTML) {
      button.innerHTML = button.dataset.originalHTML;
      delete button.dataset.originalHTML;
      delete button.dataset.originalText;
    }
    button.disabled = false;
    // Task 14.6: Remove aria-disabled when enabling buttons
    button.removeAttribute('aria-disabled');
    button.removeAttribute('aria-busy');
  }
}

/**
 * Create empty state element
 * Task 14.7: Announce empty state messages to screen readers
 * @param {Object} options - Empty state options
 * @returns {HTMLElement} Empty state element
 */
function createEmptyState(options) {
  const { icon = '📁', title, message, variant = '' } = options;

  const container = document.createElement('div');
  container.className = `pr-reorder-empty-state ${variant}`;
  // Task 14.7: Make empty state accessible to screen readers
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');

  const iconEl = document.createElement('div');
  iconEl.className = 'pr-reorder-empty-state-icon';
  iconEl.textContent = icon;
  // Hide decorative icon from screen readers
  iconEl.setAttribute('aria-hidden', 'true');

  const titleEl = document.createElement('h3');
  titleEl.className = 'pr-reorder-empty-state-title';
  titleEl.textContent = title;

  const messageEl = document.createElement('p');
  messageEl.className = 'pr-reorder-empty-state-message';
  messageEl.textContent = message;

  container.appendChild(iconEl);
  container.appendChild(titleEl);
  container.appendChild(messageEl);

  return container;
}

/**
 * Setup search handlers for filtering files
 * @param {HTMLElement} header - Modal header containing search bar
 * @param {HTMLElement} fileList - File list element
 * @param {Array<Object>} filesMetadata - All files metadata
 * @param {Array<string>} currentOrder - Current file order
 */
function setupSearchHandlers(header, fileList, filesMetadata, currentOrder) {
  const searchInput = header.querySelector('[data-search-input]');
  const clearBtn = header.querySelector('.pr-reorder-search-clear');
  const fileCount = header.querySelector('[data-file-count]');

  if (!searchInput || !clearBtn || !fileCount) return;

  // Get modal element for ARIA announcements
  const modal = header.closest('.pr-reorder-modal');

  // Update file count display
  const updateFileCount = (filtered, total) => {
    const message = getFileCountMessage(filtered, total);
    fileCount.textContent = message;

    // Add "filtered" class when search is active and count differs
    if (filtered < total) {
      fileCount.classList.add('filtered');
    } else {
      fileCount.classList.remove('filtered');
    }

    // Announce to screen readers
    if (modal) {
      announceToScreenReader(message, 'polite', modal);
    }
  };

  // Initialize file count
  updateFileCount(filesMetadata.length, filesMetadata.length);

  // Filter and update file list
  const applyFilter = (search) => {
    if (!search) {
      // Show all files in current order
      const sortedMetadata = currentOrder
        .map((path) => filesMetadata.find((m) => m.path === path))
        .filter(Boolean);
      updateFileList(fileList, sortedMetadata);
      updateFileCount(filesMetadata.length, filesMetadata.length);
      clearBtn.style.display = 'none';
      return;
    }

    // Filter files
    const filtered = filterFiles(currentOrder, search);
    const filteredMetadata = filtered
      .map((path) => filesMetadata.find((m) => m.path === path))
      .filter(Boolean);

    // Show empty state if no results
    if (filteredMetadata.length === 0) {
      const emptyState = createEmptyState({
        icon: '🔍',
        title: 'No files match your search',
        message: 'Try a different search term',
        variant: 'pr-reorder-empty-state-search',
      });
      // Clear file list safely using DOM methods
      while (fileList.firstChild) {
        fileList.firstChild.remove();
      }
      fileList.appendChild(emptyState);
      updateFileCount(0, filesMetadata.length);
      clearBtn.style.display = 'block';
      return;
    }

    // Update display
    updateFileList(fileList, filteredMetadata, search);
    updateFileCount(filtered.length, filesMetadata.length);
    clearBtn.style.display =
      filtered.length === filesMetadata.length ? 'none' : 'block';
  };

  // Handle search input
  searchInput.addEventListener('input', (e) => {
    applyFilter(e.target.value);
  });

  // Handle clear button
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    applyFilter('');
    searchInput.focus();
  });

  // Handle keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+K or / to focus search
    if ((e.ctrlKey && e.key === 'k') || e.key === '/') {
      // Prevent default / behavior (quick find)
      if (e.key === '/') {
        e.preventDefault();
      }
      searchInput.focus();
      searchInput.select();
    }

    // Escape to clear search (if search is focused)
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      if (searchInput.value) {
        searchInput.value = '';
        applyFilter('');
      }
    }
  });
}
