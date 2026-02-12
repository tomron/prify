/**
 * History Management
 * Provides undo/redo functionality for file reordering
 */

const HISTORY_PREFIX = 'pr-history:';
const MAX_HISTORY_SIZE = 20;

/**
 * Validate PR ID
 * @param {string} prId - PR identifier (e.g., "org/repo/123")
 * @throws {Error} If prId is invalid
 */
function validatePrId(prId) {
  if (!prId || typeof prId !== 'string' || prId.trim() === '') {
    throw new Error('PR ID is required');
  }
}

/**
 * Validate order data
 * @param {Array<string>} order - Array of file paths
 * @throws {Error} If order is invalid
 */
function validateOrder(order) {
  if (!Array.isArray(order)) {
    throw new Error('Order must be an array');
  }
  if (order.length === 0) {
    throw new Error('Order cannot be empty');
  }
}

/**
 * Get storage key for a PR's history
 * @param {string} prId - PR identifier
 * @returns {string} Storage key
 */
function getHistoryKey(prId) {
  return `${HISTORY_PREFIX}${prId}`;
}

/**
 * Get history state for a PR
 * @param {string} prId - PR identifier
 * @returns {Promise<Object>} History state with undoStack and redoStack
 */
export async function getHistoryState(prId) {
  validatePrId(prId);

  const key = getHistoryKey(prId);

  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      const state = result[key] || {
        undoStack: [],
        redoStack: [],
      };

      resolve(state);
    });
  });
}

/**
 * Save history state for a PR
 * @param {string} prId - PR identifier
 * @param {Object} state - History state
 * @returns {Promise<void>}
 */
async function saveHistoryState(prId, state) {
  const key = getHistoryKey(prId);

  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: state }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Save order to history stack
 * Adds order to undo stack and clears redo stack
 * Limits history to MAX_HISTORY_SIZE items
 *
 * @param {string} prId - PR identifier
 * @param {Array<string>} order - Array of file paths
 * @returns {Promise<void>}
 * @throws {Error} If validation fails or storage operation fails
 */
export async function saveToHistory(prId, order) {
  validatePrId(prId);
  validateOrder(order);

  const state = await getHistoryState(prId);

  // Add to undo stack
  state.undoStack.push([...order]);

  // Limit stack size
  if (state.undoStack.length > MAX_HISTORY_SIZE) {
    state.undoStack.shift();
  }

  // Clear redo stack (new action invalidates redo)
  state.redoStack = [];

  await saveHistoryState(prId, state);
}

/**
 * Undo last action
 * Returns the previous order and moves current order to redo stack
 *
 * @param {string} prId - PR identifier
 * @returns {Promise<Array<string>|null>} Previous order or null if nothing to undo
 * @throws {Error} If validation fails or storage operation fails
 */
export async function undo(prId) {
  validatePrId(prId);

  const state = await getHistoryState(prId);

  // Need at least 2 items to undo (current and previous)
  if (state.undoStack.length < 2) {
    return null;
  }

  // Pop current order and move to redo stack
  const currentOrder = state.undoStack.pop();
  state.redoStack.push(currentOrder);

  // Get previous order (now at top of undo stack)
  const previousOrder = state.undoStack[state.undoStack.length - 1];

  await saveHistoryState(prId, state);

  return [...previousOrder];
}

/**
 * Redo last undone action
 * Returns the next order and moves it back to undo stack
 *
 * @param {string} prId - PR identifier
 * @returns {Promise<Array<string>|null>} Next order or null if nothing to redo
 * @throws {Error} If validation fails or storage operation fails
 */
export async function redo(prId) {
  validatePrId(prId);

  const state = await getHistoryState(prId);

  // Need at least one item in redo stack
  if (state.redoStack.length === 0) {
    return null;
  }

  // Pop from redo stack and add back to undo stack
  const nextOrder = state.redoStack.pop();
  state.undoStack.push(nextOrder);

  await saveHistoryState(prId, state);

  return [...nextOrder];
}

/**
 * Check if undo is available
 * @param {string} prId - PR identifier
 * @returns {Promise<boolean>} True if undo is available
 */
export async function canUndo(prId) {
  validatePrId(prId);

  const state = await getHistoryState(prId);

  // Need at least 2 items to undo
  return state.undoStack.length >= 2;
}

/**
 * Check if redo is available
 * @param {string} prId - PR identifier
 * @returns {Promise<boolean>} True if redo is available
 */
export async function canRedo(prId) {
  validatePrId(prId);

  const state = await getHistoryState(prId);

  return state.redoStack.length > 0;
}

/**
 * Clear all history for a PR
 * @param {string} prId - PR identifier
 * @returns {Promise<void>}
 */
export async function clearHistory(prId) {
  validatePrId(prId);

  const key = getHistoryKey(prId);

  return new Promise((resolve, reject) => {
    chrome.storage.local.remove([key], () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}
