/**
 * DOM Manipulator
 * Handles reordering of file elements in GitHub PR pages
 */

import {
  extractFiles,
  getFilePath,
  getFilesContainer,
} from '../utils/parser.js';

// MutationObserver instance
let observer = null;
let observerCallback = null;
let debounceTimer = null;

/**
 * Validate order array
 * @param {Array<string>} order - Array of file paths
 * @throws {Error} If order is invalid
 */
function validateOrderInput(order) {
  if (!Array.isArray(order)) {
    throw new Error('Order must be an array');
  }
  if (order.length === 0) {
    throw new Error('Order cannot be empty');
  }
}

/**
 * Get current file order from DOM
 * @param {HTMLElement} [container] - Optional container element
 * @returns {Array<string>} Array of file paths in current order
 */
export function getCurrentOrder(container) {
  const files = extractFiles(container);

  return files.map((file) => getFilePath(file)).filter((path) => path !== null);
}

/**
 * Validate file order against current DOM
 * @param {Array<string>} order - Proposed order
 * @param {HTMLElement} [container] - Optional container element
 * @returns {Object} Validation result with {valid: boolean, errors: string[]}
 */
export function validateFileOrder(order, container) {
  const currentFiles = getCurrentOrder(container);
  const currentSet = new Set(currentFiles);
  const orderSet = new Set(order);

  const errors = [];

  // Check for duplicates in order
  if (orderSet.size !== order.length) {
    const duplicates = order.filter(
      (item, index) => order.indexOf(item) !== index
    );
    const uniqueDupes = [...new Set(duplicates)];
    errors.push(`Duplicate files: ${uniqueDupes.join(', ')}`);
  }

  // Check for missing files
  const missingFiles = currentFiles.filter((file) => !orderSet.has(file));
  if (missingFiles.length > 0) {
    errors.push(`Missing files: ${missingFiles.join(', ')}`);
  }

  // Check for unknown files
  const unknownFiles = order.filter((file) => !currentSet.has(file));
  if (unknownFiles.length > 0) {
    errors.push(`Unknown files: ${unknownFiles.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Reorder files in the DOM according to specified order
 * Uses DocumentFragment for efficient DOM manipulation
 *
 * @param {Array<string>} order - Array of file paths in desired order
 * @param {HTMLElement} [container] - Optional container element
 * @throws {Error} If order is invalid
 */
export function reorderFiles(order, container) {
  validateOrderInput(order);

  const filesContainer = getFilesContainer(container);
  if (!filesContainer) {
    return;
  }

  const files = extractFiles(container);
  if (files.length === 0) {
    return;
  }

  // Create a map of file path to DOM element
  const fileMap = new Map();
  files.forEach((fileElement) => {
    const path = getFilePath(fileElement);
    if (path) {
      fileMap.set(path, fileElement);
    }
  });

  // Create DocumentFragment for efficient DOM manipulation
  const fragment = document.createDocumentFragment();

  // Add files in specified order
  order.forEach((filePath) => {
    const fileElement = fileMap.get(filePath);
    if (fileElement && filesContainer.contains(fileElement)) {
      // Get the element to actually move (might be wrapped in a parent div)
      let elementToMove = fileElement;

      // If file is not a direct child, find the wrapper that is
      if (fileElement.parentNode !== filesContainer) {
        let parent = fileElement.parentNode;
        while (
          parent &&
          parent.parentNode !== filesContainer &&
          parent !== filesContainer
        ) {
          parent = parent.parentNode;
        }
        if (parent && parent !== filesContainer) {
          elementToMove = parent;
        }
      }

      // Remove from DOM and add to fragment
      if (elementToMove.parentNode) {
        elementToMove.parentNode.removeChild(elementToMove);
        fragment.appendChild(elementToMove);
        fileMap.delete(filePath); // Mark as processed
      }
    }
  });

  // Add any remaining files (not in order) at the end
  fileMap.forEach((fileElement) => {
    if (filesContainer.contains(fileElement)) {
      // Get the element to actually move
      let elementToMove = fileElement;

      // If file is not a direct child, find the wrapper that is
      if (fileElement.parentNode !== filesContainer) {
        let parent = fileElement.parentNode;
        while (
          parent &&
          parent.parentNode !== filesContainer &&
          parent !== filesContainer
        ) {
          parent = parent.parentNode;
        }
        if (parent && parent !== filesContainer) {
          elementToMove = parent;
        }
      }

      // Remove from DOM and add to fragment
      if (elementToMove.parentNode) {
        elementToMove.parentNode.removeChild(elementToMove);
        fragment.appendChild(elementToMove);
      }
    }
  });

  // Apply all changes in single DOM operation
  filesContainer.appendChild(fragment);
}

/**
 * Observe file changes in the DOM (for GitHub's dynamic loading)
 * Calls callback when new files are detected
 * Uses debouncing to avoid excessive calls
 *
 * @param {Function} callback - Function to call when files change
 * @param {number} [debounceMs=300] - Debounce delay in milliseconds
 * @returns {MutationObserver|null} The observer instance or null if already observing
 */
export function observeFileChanges(callback, debounceMs = 300) {
  // Don't create multiple observers
  if (observer) {
    return null;
  }

  const filesContainer = getFilesContainer();
  if (!filesContainer) {
    return null;
  }

  observerCallback = callback;

  // Create debounced callback
  const debouncedCallback = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      if (observerCallback) {
        observerCallback();
      }
    }, debounceMs);
  };

  // Create MutationObserver
  observer = new MutationObserver((mutations) => {
    // Check if any mutations involve file elements
    const hasFileChanges = mutations.some((mutation) => {
      // Check added nodes
      const addedFiles = Array.from(mutation.addedNodes).some((node) =>
        node.classList?.contains('file')
      );

      // Check removed nodes
      const removedFiles = Array.from(mutation.removedNodes).some((node) =>
        node.classList?.contains('file')
      );

      return addedFiles || removedFiles;
    });

    if (hasFileChanges) {
      debouncedCallback();
    }
  });

  // Start observing
  observer.observe(filesContainer, {
    childList: true,
    subtree: true,
  });

  return observer;
}

/**
 * Stop observing file changes
 * Safe to call multiple times
 */
export function stopObserving() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  observerCallback = null;
}

/**
 * Re-apply saved order after dynamic file loading
 * Convenience function that combines validation and reordering
 *
 * @param {Array<string>} savedOrder - Previously saved order
 * @param {HTMLElement} [container] - Optional container element
 * @returns {boolean} True if order was applied successfully
 */
export function reapplySavedOrder(savedOrder, container) {
  try {
    const validation = validateFileOrder(savedOrder, container);

    if (!validation.valid) {
      return false;
    }

    reorderFiles(savedOrder, container);
    return true;
  } catch (error) {
    console.error('[PR-Reorder] Error reapplying order:', error);
    return false;
  }
}
