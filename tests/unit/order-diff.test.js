/**
 * Unit tests for order diff utilities
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateOrderDiff,
  getPositionChange,
  categorizeChange,
  formatPositionChange,
} from '../../utils/order-diff.js';

describe('Order Diff Utilities', () => {
  describe('calculateOrderDiff', () => {
    it('should calculate diff for identical orders', () => {
      const orderA = ['a.js', 'b.js', 'c.js'];
      const orderB = ['a.js', 'b.js', 'c.js'];

      const diff = calculateOrderDiff(orderA, orderB);

      expect(diff.length).toBe(3);
      expect(diff[0]).toEqual({
        file: 'a.js',
        fromIndex: 0,
        toIndex: 0,
        change: 0,
        category: 'unchanged',
      });
    });

    it('should calculate diff for completely different orders', () => {
      const orderA = ['a.js', 'b.js', 'c.js'];
      const orderB = ['c.js', 'b.js', 'a.js'];

      const diff = calculateOrderDiff(orderA, orderB);

      expect(diff.length).toBe(3);

      const aFile = diff.find((d) => d.file === 'a.js');
      expect(aFile.fromIndex).toBe(0);
      expect(aFile.toIndex).toBe(2);
      expect(aFile.change).toBe(2);
      expect(aFile.category).toBe('moved-down');

      const cFile = diff.find((d) => d.file === 'c.js');
      expect(cFile.fromIndex).toBe(2);
      expect(cFile.toIndex).toBe(0);
      expect(cFile.change).toBe(-2);
      expect(cFile.category).toBe('moved-up');
    });

    it('should handle files only in first order', () => {
      const orderA = ['a.js', 'b.js', 'c.js'];
      const orderB = ['a.js', 'c.js'];

      const diff = calculateOrderDiff(orderA, orderB);

      const bFile = diff.find((d) => d.file === 'b.js');
      expect(bFile.category).toBe('removed');
      expect(bFile.toIndex).toBe(-1);
    });

    it('should handle files only in second order', () => {
      const orderA = ['a.js', 'c.js'];
      const orderB = ['a.js', 'b.js', 'c.js'];

      const diff = calculateOrderDiff(orderA, orderB);

      const bFile = diff.find((d) => d.file === 'b.js');
      expect(bFile.category).toBe('added');
      expect(bFile.fromIndex).toBe(-1);
    });

    it('should calculate diff for large orders', () => {
      const orderA = Array.from({ length: 100 }, (_, i) => `file${i}.js`);
      const orderB = [...orderA].reverse();

      const diff = calculateOrderDiff(orderA, orderB);

      expect(diff.length).toBe(100);

      // First file should move to last
      const firstFile = diff.find((d) => d.file === 'file0.js');
      expect(firstFile.fromIndex).toBe(0);
      expect(firstFile.toIndex).toBe(99);
      expect(firstFile.change).toBe(99);
    });

    it('should handle empty orders', () => {
      const diff = calculateOrderDiff([], []);
      expect(diff).toEqual([]);
    });

    it('should include all files from both orders', () => {
      const orderA = ['a.js', 'b.js'];
      const orderB = ['c.js', 'd.js'];

      const diff = calculateOrderDiff(orderA, orderB);

      expect(diff.length).toBe(4);
      expect(diff.some((d) => d.file === 'a.js')).toBe(true);
      expect(diff.some((d) => d.file === 'b.js')).toBe(true);
      expect(diff.some((d) => d.file === 'c.js')).toBe(true);
      expect(diff.some((d) => d.file === 'd.js')).toBe(true);
    });
  });

  describe('getPositionChange', () => {
    it('should return positive for moved down', () => {
      expect(getPositionChange(2, 5)).toBe(3);
    });

    it('should return negative for moved up', () => {
      expect(getPositionChange(5, 2)).toBe(-3);
    });

    it('should return 0 for unchanged', () => {
      expect(getPositionChange(3, 3)).toBe(0);
    });

    it('should handle removed files', () => {
      expect(getPositionChange(3, -1)).toBe(0);
    });

    it('should handle added files', () => {
      expect(getPositionChange(-1, 3)).toBe(0);
    });
  });

  describe('categorizeChange', () => {
    it('should categorize unchanged', () => {
      expect(categorizeChange(3, 3)).toBe('unchanged');
    });

    it('should categorize moved up', () => {
      expect(categorizeChange(5, 2)).toBe('moved-up');
    });

    it('should categorize moved down', () => {
      expect(categorizeChange(2, 5)).toBe('moved-down');
    });

    it('should categorize added', () => {
      expect(categorizeChange(-1, 3)).toBe('added');
    });

    it('should categorize removed', () => {
      expect(categorizeChange(3, -1)).toBe('removed');
    });
  });

  describe('formatPositionChange', () => {
    it('should format unchanged position', () => {
      expect(formatPositionChange(0)).toBe('No change');
    });

    it('should format moved up', () => {
      expect(formatPositionChange(-3)).toBe('↑ 3 positions');
    });

    it('should format moved down', () => {
      expect(formatPositionChange(5)).toBe('↓ 5 positions');
    });

    it('should format single position up', () => {
      expect(formatPositionChange(-1)).toBe('↑ 1 position');
    });

    it('should format single position down', () => {
      expect(formatPositionChange(1)).toBe('↓ 1 position');
    });
  });
});
