/**
 * Simplified storage tests
 */

import {
  saveOrder,
  loadOrder,
  CURRENT_VERSION,
  migrateData,
  savePreference,
  loadPreference,
  deletePreference,
} from '../../utils/storage.js';

// Mock chrome API
global.chrome = {
  storage: {
    local: {
      get: () => {},
      set: () => {},
      remove: () => {},
    },
  },
  runtime: {
    lastError: null,
  },
};

describe('Storage Layer - Basic Tests', () => {
  beforeEach(() => {
    global.chrome.runtime.lastError = null;
  });

  describe('saveOrder', () => {
    it('should save order successfully', async () => {
      let savedData = null;

      global.chrome.storage.local.set = (data, callback) => {
        savedData = data;
        callback();
      };

      await saveOrder('org/repo/123', ['file1.js', 'file2.js']);

      expect(savedData).not.toBeNull();
      expect(savedData['pr-order:org/repo/123'].order).toEqual([
        'file1.js',
        'file2.js',
      ]);
    });

    it('should throw on invalid prId', async () => {
      await expect(saveOrder('', ['file.js'])).rejects.toThrow();
    });

    it('should throw on invalid order', async () => {
      await expect(saveOrder('org/repo/123', [])).rejects.toThrow();
    });
  });

  describe('loadOrder', () => {
    it('should load order successfully', async () => {
      const mockData = {
        order: ['file1.js'],
        timestamp: '2025-02-12T10:00:00Z',
        version: '1.0',
      };

      global.chrome.storage.local.get = (keys, callback) => {
        callback({ ['pr-order:org/repo/123']: mockData });
      };

      const result = await loadOrder('org/repo/123');

      expect(result).toEqual(mockData);
    });

    it('should return null if not found', async () => {
      global.chrome.storage.local.get = (keys, callback) => {
        callback({});
      };

      const result = await loadOrder('org/repo/999');

      expect(result).toBeNull();
    });
  });

  describe('migrateData', () => {
    it('should migrate from v0.1 to v1.0', () => {
      const oldData = {
        order: ['file.js'],
        version: '0.1',
      };

      const migrated = migrateData(oldData);

      expect(migrated.version).toBe('1.0');
    });

    it('should keep current version unchanged', () => {
      const currentData = {
        order: ['file.js'],
        version: CURRENT_VERSION,
      };

      const migrated = migrateData(currentData);

      expect(migrated).toEqual(currentData);
    });
  });

  describe('savePreference', () => {
    it('should save preference successfully', async () => {
      let savedData = null;

      global.chrome.storage.local.get = (keys, callback) => {
        callback({ 'pr-reorder:preferences': {} });
      };

      global.chrome.storage.local.set = (data, callback) => {
        savedData = data;
        callback();
      };

      await savePreference('lastPreset', 'alphabetical');

      expect(savedData).not.toBeNull();
      expect(savedData['pr-reorder:preferences'].lastPreset).toBe(
        'alphabetical'
      );
    });

    it('should throw on invalid key', async () => {
      await expect(savePreference('', 'value')).rejects.toThrow();
    });

    it('should merge with existing preferences', async () => {
      let savedData = null;

      global.chrome.storage.local.get = (keys, callback) => {
        callback({
          'pr-reorder:preferences': { existingKey: 'existingValue' },
        });
      };

      global.chrome.storage.local.set = (data, callback) => {
        savedData = data;
        callback();
      };

      await savePreference('newKey', 'newValue');

      expect(savedData['pr-reorder:preferences'].existingKey).toBe(
        'existingValue'
      );
      expect(savedData['pr-reorder:preferences'].newKey).toBe('newValue');
    });
  });

  describe('loadPreference', () => {
    it('should load preference successfully', async () => {
      global.chrome.storage.local.get = (keys, callback) => {
        callback({
          'pr-reorder:preferences': { lastPreset: 'alphabetical' },
        });
      };

      const result = await loadPreference('lastPreset');

      expect(result).toBe('alphabetical');
    });

    it('should return default value if not found', async () => {
      global.chrome.storage.local.get = (keys, callback) => {
        callback({ 'pr-reorder:preferences': {} });
      };

      const result = await loadPreference('missing', 'default');

      expect(result).toBe('default');
    });

    it('should return null if not found and no default', async () => {
      global.chrome.storage.local.get = (keys, callback) => {
        callback({ 'pr-reorder:preferences': {} });
      };

      const result = await loadPreference('missing');

      expect(result).toBeNull();
    });

    it('should throw on invalid key', async () => {
      await expect(loadPreference('')).rejects.toThrow();
    });
  });

  describe('deletePreference', () => {
    it('should delete preference successfully', async () => {
      let savedData = null;

      global.chrome.storage.local.get = (keys, callback) => {
        callback({
          'pr-reorder:preferences': {
            toDelete: 'value',
            toKeep: 'other',
          },
        });
      };

      global.chrome.storage.local.set = (data, callback) => {
        savedData = data;
        callback();
      };

      await deletePreference('toDelete');

      expect(savedData['pr-reorder:preferences'].toDelete).toBeUndefined();
      expect(savedData['pr-reorder:preferences'].toKeep).toBe('other');
    });

    it('should throw on invalid key', async () => {
      await expect(deletePreference('')).rejects.toThrow();
    });
  });
});
