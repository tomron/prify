/**
 * History management tests
 */

import {
  saveToHistory,
  undo,
  redo,
  canUndo,
  canRedo,
  clearHistory,
  getHistoryState,
} from '../../utils/history.js';

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

describe('History Management', () => {
  let mockStorage = {};

  beforeEach(() => {
    // Reset storage
    mockStorage = {};
    global.chrome.runtime.lastError = null;

    // Mock chrome.storage.local
    global.chrome.storage.local.get = (keys, callback) => {
      if (keys === null) {
        callback(mockStorage);
      } else if (Array.isArray(keys)) {
        const result = {};
        keys.forEach((key) => {
          if (mockStorage[key]) {
            result[key] = mockStorage[key];
          }
        });
        callback(result);
      } else if (typeof keys === 'string') {
        callback({ [keys]: mockStorage[keys] });
      }
    };

    global.chrome.storage.local.set = (data, callback) => {
      Object.assign(mockStorage, data);
      callback();
    };

    global.chrome.storage.local.remove = (keys, callback) => {
      if (Array.isArray(keys)) {
        keys.forEach((key) => delete mockStorage[key]);
      } else {
        delete mockStorage[keys];
      }
      callback();
    };
  });

  describe('saveToHistory', () => {
    it('should save order to history stack', async () => {
      const prId = 'org/repo/123';
      const order = ['file1.js', 'file2.js'];

      await saveToHistory(prId, order);

      const state = await getHistoryState(prId);
      expect(state.undoStack).toHaveLength(1);
      expect(state.undoStack[0]).toEqual(order);
      expect(state.redoStack).toHaveLength(0);
    });

    it('should clear redo stack when new action is saved', async () => {
      const prId = 'org/repo/123';

      await saveToHistory(prId, ['file1.js', 'file2.js']);
      await saveToHistory(prId, ['file2.js', 'file1.js']);
      await undo(prId);

      // Now redoStack has one item
      let state = await getHistoryState(prId);
      expect(state.redoStack).toHaveLength(1);

      // Save new action - should clear redo stack
      await saveToHistory(prId, ['file3.js', 'file1.js']);

      state = await getHistoryState(prId);
      expect(state.redoStack).toHaveLength(0);
    });

    it('should limit history to 20 actions', async () => {
      const prId = 'org/repo/123';

      // Add 25 actions
      for (let i = 0; i < 25; i++) {
        await saveToHistory(prId, [`file${i}.js`]);
      }

      const state = await getHistoryState(prId);
      expect(state.undoStack.length).toBeLessThanOrEqual(20);
    });

    it('should throw on invalid prId', async () => {
      await expect(saveToHistory('', ['file.js'])).rejects.toThrow();
    });

    it('should throw on invalid order', async () => {
      await expect(saveToHistory('org/repo/123', [])).rejects.toThrow();
    });
  });

  describe('undo', () => {
    it('should undo last action', async () => {
      const prId = 'org/repo/123';

      await saveToHistory(prId, ['file1.js', 'file2.js']);
      await saveToHistory(prId, ['file2.js', 'file1.js']);

      const undone = await undo(prId);

      expect(undone).toEqual(['file1.js', 'file2.js']);

      const state = await getHistoryState(prId);
      expect(state.undoStack).toHaveLength(1);
      expect(state.redoStack).toHaveLength(1);
    });

    it('should return null when nothing to undo', async () => {
      const prId = 'org/repo/123';

      const undone = await undo(prId);

      expect(undone).toBeNull();
    });

    it('should maintain only one item in undo stack after undoing all', async () => {
      const prId = 'org/repo/123';

      await saveToHistory(prId, ['file1.js']);
      await saveToHistory(prId, ['file2.js']);

      await undo(prId);
      const undone = await undo(prId);

      expect(undone).toBeNull(); // Can't undo first state
      const state = await getHistoryState(prId);
      expect(state.undoStack).toHaveLength(1); // Initial state remains
    });
  });

  describe('redo', () => {
    it('should redo last undone action', async () => {
      const prId = 'org/repo/123';

      await saveToHistory(prId, ['file1.js', 'file2.js']);
      await saveToHistory(prId, ['file2.js', 'file1.js']);
      await undo(prId);

      const redone = await redo(prId);

      expect(redone).toEqual(['file2.js', 'file1.js']);

      const state = await getHistoryState(prId);
      expect(state.undoStack).toHaveLength(2);
      expect(state.redoStack).toHaveLength(0);
    });

    it('should return null when nothing to redo', async () => {
      const prId = 'org/repo/123';

      const redone = await redo(prId);

      expect(redone).toBeNull();
    });

    it('should allow multiple redos', async () => {
      const prId = 'org/repo/123';

      await saveToHistory(prId, ['file1.js']);
      await saveToHistory(prId, ['file2.js']);
      await saveToHistory(prId, ['file3.js']);

      await undo(prId);
      await undo(prId);

      const redo1 = await redo(prId);
      expect(redo1).toEqual(['file2.js']);

      const redo2 = await redo(prId);
      expect(redo2).toEqual(['file3.js']);

      const state = await getHistoryState(prId);
      expect(state.undoStack).toHaveLength(3);
      expect(state.redoStack).toHaveLength(0);
    });
  });

  describe('canUndo', () => {
    it('should return true when undo is available', async () => {
      const prId = 'org/repo/123';

      await saveToHistory(prId, ['file1.js']);
      await saveToHistory(prId, ['file2.js']);

      const result = await canUndo(prId);

      expect(result).toBe(true);
    });

    it('should return false when nothing to undo', async () => {
      const prId = 'org/repo/123';

      const result = await canUndo(prId);

      expect(result).toBe(false);
    });

    it('should return false after undoing to initial state', async () => {
      const prId = 'org/repo/123';

      await saveToHistory(prId, ['file1.js']);
      await undo(prId);

      const result = await canUndo(prId);

      expect(result).toBe(false);
    });
  });

  describe('canRedo', () => {
    it('should return true when redo is available', async () => {
      const prId = 'org/repo/123';

      await saveToHistory(prId, ['file1.js']);
      await saveToHistory(prId, ['file2.js']);
      await undo(prId);

      const result = await canRedo(prId);

      expect(result).toBe(true);
    });

    it('should return false when nothing to redo', async () => {
      const prId = 'org/repo/123';

      const result = await canRedo(prId);

      expect(result).toBe(false);
    });

    it('should return false after new action clears redo stack', async () => {
      const prId = 'org/repo/123';

      await saveToHistory(prId, ['file1.js']);
      await saveToHistory(prId, ['file2.js']);
      await undo(prId);
      await saveToHistory(prId, ['file3.js']);

      const result = await canRedo(prId);

      expect(result).toBe(false);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history for a PR', async () => {
      const prId = 'org/repo/123';

      await saveToHistory(prId, ['file1.js']);
      await saveToHistory(prId, ['file2.js']);
      await undo(prId);

      await clearHistory(prId);

      const state = await getHistoryState(prId);
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(0);
    });

    it('should not affect other PRs', async () => {
      const prId1 = 'org/repo/123';
      const prId2 = 'org/repo/456';

      await saveToHistory(prId1, ['file1.js']);
      await saveToHistory(prId2, ['file2.js']);

      await clearHistory(prId1);

      const state1 = await getHistoryState(prId1);
      const state2 = await getHistoryState(prId2);

      expect(state1.undoStack).toHaveLength(0);
      expect(state2.undoStack).toHaveLength(1);
    });
  });

  describe('getHistoryState', () => {
    it('should return empty state for new PR', async () => {
      const prId = 'org/repo/123';

      const state = await getHistoryState(prId);

      expect(state).toEqual({
        undoStack: [],
        redoStack: [],
      });
    });

    it('should return current state', async () => {
      const prId = 'org/repo/123';

      await saveToHistory(prId, ['file1.js']);
      await saveToHistory(prId, ['file2.js']);
      await undo(prId);

      const state = await getHistoryState(prId);

      expect(state.undoStack).toHaveLength(1);
      expect(state.redoStack).toHaveLength(1);
    });
  });
});
