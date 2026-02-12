/**
 * Unit tests for array utility functions
 */
import {
  moveElement,
  calculateAveragePosition,
  sortByAveragePosition,
  haveSameElements,
} from '../../utils/array-utils.js';

describe('array-utils', () => {
  describe('moveElement', () => {
    it('should move element from one position to another', () => {
      const input = ['a', 'b', 'c', 'd'];
      const result = moveElement(input, 0, 2);
      expect(result).toEqual(['b', 'c', 'a', 'd']);
    });

    it('should move element backwards', () => {
      const input = ['a', 'b', 'c', 'd'];
      const result = moveElement(input, 3, 1);
      expect(result).toEqual(['a', 'd', 'b', 'c']);
    });

    it('should handle moving to same position', () => {
      const input = ['a', 'b', 'c'];
      const result = moveElement(input, 1, 1);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should not mutate original array', () => {
      const input = ['a', 'b', 'c'];
      const original = [...input];
      moveElement(input, 0, 2);
      expect(input).toEqual(original);
    });

    it('should throw on invalid fromIndex', () => {
      const input = ['a', 'b', 'c'];
      expect(() => moveElement(input, -1, 0)).toThrow('Invalid fromIndex');
      expect(() => moveElement(input, 5, 0)).toThrow('Invalid fromIndex');
    });

    it('should throw on invalid toIndex', () => {
      const input = ['a', 'b', 'c'];
      expect(() => moveElement(input, 0, -1)).toThrow('Invalid toIndex');
      expect(() => moveElement(input, 0, 5)).toThrow('Invalid toIndex');
    });
  });

  describe('calculateAveragePosition', () => {
    it('should calculate average position for element in multiple arrays', () => {
      const arrays = [
        ['a', 'b', 'c'],
        ['b', 'a', 'c'],
        ['c', 'b', 'a'],
      ];
      expect(calculateAveragePosition(arrays, 'a')).toBe(1);
    });

    it('should return -1 if element not found in any array', () => {
      const arrays = [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
      ];
      expect(calculateAveragePosition(arrays, 'z')).toBe(-1);
    });

    it('should handle element present in some arrays only', () => {
      const arrays = [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['a', 'x', 'y'],
      ];
      // 'a' is at position 0 in array 0 and array 2: (0 + 0) / 2 = 0
      expect(calculateAveragePosition(arrays, 'a')).toBe(0);
    });

    it('should handle single array', () => {
      const arrays = [['a', 'b', 'c']];
      expect(calculateAveragePosition(arrays, 'b')).toBe(1);
    });

    it('should calculate fractional positions correctly', () => {
      const arrays = [
        ['a', 'b', 'c'],
        ['b', 'c', 'a'],
      ];
      // 'a' is at position 0 and 2: (0 + 2) / 2 = 1
      expect(calculateAveragePosition(arrays, 'a')).toBe(1);
    });
  });

  describe('sortByAveragePosition', () => {
    it('should sort elements by average position', () => {
      const arrays = [
        ['a', 'b', 'c'],
        ['b', 'a', 'c'],
        ['c', 'b', 'a'],
      ];
      const result = sortByAveragePosition(arrays);
      // 'a': (0 + 1 + 2) / 3 = 1
      // 'b': (1 + 0 + 1) / 3 = 0.67
      // 'c': (2 + 2 + 0) / 3 = 1.33
      expect(result).toEqual(['b', 'a', 'c']);
    });

    it('should handle empty array', () => {
      const result = sortByAveragePosition([]);
      expect(result).toEqual([]);
    });

    it('should handle single array', () => {
      const arrays = [['x', 'y', 'z']];
      const result = sortByAveragePosition(arrays);
      expect(result).toEqual(['x', 'y', 'z']);
    });

    it('should include all unique elements', () => {
      const arrays = [
        ['a', 'b'],
        ['c', 'd'],
        ['e', 'f'],
      ];
      const result = sortByAveragePosition(arrays);
      expect(result.length).toBe(6);
      expect(result).toContain('a');
      expect(result).toContain('b');
      expect(result).toContain('c');
      expect(result).toContain('d');
      expect(result).toContain('e');
      expect(result).toContain('f');
    });
  });

  describe('haveSameElements', () => {
    it('should return true for arrays with same elements in same order', () => {
      expect(haveSameElements(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
    });

    it('should return true for arrays with same elements in different order', () => {
      expect(haveSameElements(['a', 'b', 'c'], ['c', 'b', 'a'])).toBe(true);
    });

    it('should return false for arrays with different elements', () => {
      expect(haveSameElements(['a', 'b', 'c'], ['a', 'b', 'd'])).toBe(false);
    });

    it('should return false for arrays with different lengths', () => {
      expect(haveSameElements(['a', 'b'], ['a', 'b', 'c'])).toBe(false);
    });

    it('should return true for empty arrays', () => {
      expect(haveSameElements([], [])).toBe(true);
    });

    it('should handle duplicate elements', () => {
      expect(haveSameElements(['a', 'a', 'b'], ['b', 'a', 'a'])).toBe(true);
    });
  });
});
