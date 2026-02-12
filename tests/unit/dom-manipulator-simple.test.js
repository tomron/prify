/**
 * @jest-environment jsdom
 */

import {
  reorderFiles,
  getCurrentOrder,
  validateFileOrder,
  observeFileChanges,
  stopObserving,
} from '../../content/dom-manipulator.js';

describe('DOM Manipulator - Simple Tests', () => {
  let container;

  beforeEach(() => {
    // Clear DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    // Create files container
    container = document.createElement('div');
    container.className = 'files';
    document.body.appendChild(container);

    // Add mock files
    addMockFile(container, 'file1.js');
    addMockFile(container, 'file2.js');
    addMockFile(container, 'file3.js');
  });

  afterEach(() => {
    stopObserving();
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function addMockFile(parent, path) {
    const file = document.createElement('div');
    file.className = 'file';
    file.dataset.path = path;
    file.textContent = path;
    parent.appendChild(file);
    return file;
  }

  function getFilePaths() {
    return Array.from(container.querySelectorAll('.file')).map(
      (el) => el.dataset.path
    );
  }

  describe('getCurrentOrder', () => {
    it('should return current file order', () => {
      const order = getCurrentOrder();

      expect(order).toEqual(['file1.js', 'file2.js', 'file3.js']);
    });

    it('should return empty array for empty container', () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      const order = getCurrentOrder();

      expect(order).toEqual([]);
    });
  });

  describe('reorderFiles', () => {
    it('should reorder files correctly', () => {
      const newOrder = ['file3.js', 'file1.js', 'file2.js'];

      reorderFiles(newOrder);

      expect(getFilePaths()).toEqual(newOrder);
    });

    it('should handle partial order', () => {
      const partialOrder = ['file2.js'];

      reorderFiles(partialOrder);

      const paths = getFilePaths();
      // file2.js should be first
      expect(paths[0]).toBe('file2.js');
      // Others should still be there
      expect(paths).toContain('file1.js');
      expect(paths).toContain('file3.js');
    });

    it('should ignore unknown files', () => {
      const orderWithUnknown = ['file1.js', 'unknown.js', 'file2.js'];

      reorderFiles(orderWithUnknown);

      const paths = getFilePaths();
      expect(paths.length).toBe(3);
      expect(paths).not.toContain('unknown.js');
    });

    it('should throw on invalid order', () => {
      expect(() => reorderFiles(null)).toThrow('Order must be an array');
      expect(() => reorderFiles([])).toThrow('Order cannot be empty');
    });

    it('should maintain original elements', () => {
      const originalElements = Array.from(container.children);
      const newOrder = ['file2.js', 'file3.js', 'file1.js'];

      reorderFiles(newOrder);

      const currentElements = Array.from(container.children);

      // Should be the same elements, just reordered
      expect(currentElements.length).toBe(originalElements.length);
      originalElements.forEach((el) => {
        expect(currentElements).toContain(el);
      });
    });
  });

  describe('validateFileOrder', () => {
    it('should validate correct order', () => {
      const order = ['file1.js', 'file2.js', 'file3.js'];

      const result = validateFileOrder(order);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect missing files', () => {
      const order = ['file1.js']; // missing file2 and file3

      const result = validateFileOrder(order);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Missing files');
    });

    it('should detect unknown files', () => {
      const order = ['file1.js', 'file2.js', 'file3.js', 'unknown.js'];

      const result = validateFileOrder(order);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Unknown files'))).toBe(true);
    });

    it('should detect duplicates', () => {
      const order = ['file1.js', 'file2.js', 'file1.js'];

      const result = validateFileOrder(order);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
    });
  });

  describe('observeFileChanges', () => {
    it('should call callback when files added', (done) => {
      let called = false;

      observeFileChanges(() => {
        called = true;
        done();
      }, 50);

      // Add a new file after a delay
      setTimeout(() => {
        addMockFile(container, 'file4.js');

        // Wait for callback
        setTimeout(() => {
          if (!called) {
            done(new Error('Callback not called'));
          }
        }, 150);
      }, 10);
    });

    it('should stop observing', (done) => {
      let called = false;

      observeFileChanges(() => {
        called = true;
      });

      stopObserving();

      // Try to add file after stopping
      addMockFile(container, 'file4.js');

      setTimeout(() => {
        expect(called).toBe(false);
        done();
      }, 150);
    });
  });

  describe('Performance', () => {
    it('should handle large file lists efficiently', () => {
      // Clear and add many files
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      const fileCount = 200;
      for (let i = 0; i < fileCount; i++) {
        addMockFile(container, `file${i}.js`);
      }

      const order = Array.from({ length: fileCount }, (_, i) => `file${i}.js`).reverse();

      const start = Date.now();
      reorderFiles(order);
      const elapsed = Date.now() - start;

      // Should be fast even with 200 files
      expect(elapsed).toBeLessThan(300);
      expect(getFilePaths()[0]).toBe(`file${fileCount - 1}.js`);
    });
  });
});
