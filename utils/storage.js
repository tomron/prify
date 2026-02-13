/**
 * Storage Layer
 * Provides abstraction over chrome.storage.local with versioning and migration
 */

export const CURRENT_VERSION = '1.0';
const STORAGE_PREFIX = 'pr-order:';

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
 * Get storage key for a PR
 * @param {string} prId - PR identifier
 * @returns {string} Storage key
 */
function getStorageKey(prId) {
  return `${STORAGE_PREFIX}${prId}`;
}

/**
 * Extract PR ID from storage key
 * @param {string} key - Storage key
 * @returns {string|null} PR ID or null if not a valid key
 */
function extractPrId(key) {
  if (!key.startsWith(STORAGE_PREFIX)) {
    return null;
  }
  return key.substring(STORAGE_PREFIX.length);
}

/**
 * Migrate data from old version to current version
 * @param {Object} data - Old data
 * @returns {Object} Migrated data
 */
export function migrateData(data) {
  if (!data) {
    return data;
  }

  // Already current version
  if (data.version === CURRENT_VERSION) {
    return data;
  }

  // Create migrated copy
  const migrated = { ...data };

  // Handle missing version (assume 0.1)
  if (!data.version) {
    migrated.version = '0.1';
  }

  // Migration from 0.1 to 1.0
  if (migrated.version === '0.1') {
    // In 1.0, we added validation but structure remains the same
    migrated.version = '1.0';
  }

  // Future migrations go here
  // if (migrated.version === '1.0') {
  //   migrated.version = '1.1';
  //   // migration logic
  // }

  return migrated;
}

/**
 * Save order for a PR
 * @param {string} prId - PR identifier (e.g., "org/repo/123")
 * @param {Array<string>} order - Ordered array of file paths
 * @returns {Promise<void>}
 * @throws {Error} If validation fails or storage operation fails
 */
export async function saveOrder(prId, order) {
  validatePrId(prId);
  validateOrder(order);

  const key = getStorageKey(prId);
  const data = {
    order,
    timestamp: new Date().toISOString(),
    version: CURRENT_VERSION,
  };

  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: data }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Load order for a PR
 * @param {string} prId - PR identifier
 * @returns {Promise<Object|null>} Order data or null if not found
 * @throws {Error} If validation fails or storage operation fails
 */
export async function loadOrder(prId) {
  validatePrId(prId);

  const key = getStorageKey(prId);

  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      const data = result[key];

      if (!data) {
        resolve(null);
        return;
      }

      // Migrate if needed
      const migrated = migrateData(data);

      // Save migrated version if it changed
      if (migrated.version !== data.version) {
        chrome.storage.local.set({ [key]: migrated }, () => {
          // Ignore errors in migration save
        });
      }

      resolve(migrated);
    });
  });
}

/**
 * Delete order for a PR
 * @param {string} prId - PR identifier
 * @returns {Promise<void>}
 * @throws {Error} If validation fails or storage operation fails
 */
export async function deleteOrder(prId) {
  validatePrId(prId);

  const key = getStorageKey(prId);

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

/**
 * Get all stored orders
 * @returns {Promise<Object>} Map of PR IDs to order data
 * @throws {Error} If storage operation fails
 */
export async function getAllOrders() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      // Filter only PR order keys
      const orders = {};
      for (const [key, value] of Object.entries(result)) {
        const prId = extractPrId(key);
        if (prId) {
          orders[prId] = value;
        }
      }

      resolve(orders);
    });
  });
}

/**
 * Clear all stored orders (use with caution)
 * @returns {Promise<void>}
 * @throws {Error} If storage operation fails
 */
export async function clearAllOrders() {
  const orders = await getAllOrders();
  const keys = Object.keys(orders).map(getStorageKey);

  if (keys.length === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get storage statistics
 * @returns {Promise<Object>} Storage statistics
 */
export async function getStorageStats() {
  const orders = await getAllOrders();

  return {
    totalOrders: Object.keys(orders).length,
    oldestOrder: Object.values(orders).reduce((oldest, current) => {
      if (!oldest) return current.timestamp;
      return new Date(current.timestamp) < new Date(oldest)
        ? current.timestamp
        : oldest;
    }, null),
    newestOrder: Object.values(orders).reduce((newest, current) => {
      if (!newest) return current.timestamp;
      return new Date(current.timestamp) > new Date(newest)
        ? current.timestamp
        : newest;
    }, null),
  };
}

const PREFERENCES_KEY = 'pr-reorder:preferences';

/**
 * Save a user preference
 * @param {string} key - Preference key
 * @param {*} value - Preference value
 * @returns {Promise<void>}
 */
export async function savePreference(key, value) {
  if (!key || typeof key !== 'string') {
    throw new Error('Preference key is required');
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.get([PREFERENCES_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      const preferences = result[PREFERENCES_KEY] || {};
      preferences[key] = value;

      chrome.storage.local.set({ [PREFERENCES_KEY]: preferences }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * Load a user preference
 * @param {string} key - Preference key
 * @param {*} defaultValue - Default value if preference not found
 * @returns {Promise<*>} Preference value or default
 */
export async function loadPreference(key, defaultValue = null) {
  if (!key || typeof key !== 'string') {
    throw new Error('Preference key is required');
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.get([PREFERENCES_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      const preferences = result[PREFERENCES_KEY] || {};
      resolve(preferences[key] !== undefined ? preferences[key] : defaultValue);
    });
  });
}

/**
 * Delete a user preference
 * @param {string} key - Preference key
 * @returns {Promise<void>}
 */
export async function deletePreference(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Preference key is required');
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.get([PREFERENCES_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      const preferences = result[PREFERENCES_KEY] || {};
      delete preferences[key];

      chrome.storage.local.set({ [PREFERENCES_KEY]: preferences }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  });
}
