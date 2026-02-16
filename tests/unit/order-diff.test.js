/**
 * Tests for order diff calculation algorithm
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateOrderDiff,
  formatPositionChange,
} from '../../utils/order-diff.js';

describe('calculateOrderDiff', () => {
  it('returns empty diff for identical orders', () => {
    const orderA = ['a.js', 'b.js', 'c.js'];
    const orderB = ['a.js', 'b.js', 'c.js'];

    const diff = calculateOrderDiff(orderA, orderB);

    expect(diff.unchanged.length).toBe(3);
    expect(diff.moved.length).toBe(0);
    expect(diff.addedInB.length).toBe(0);
    expect(diff.removedFromB.length).toBe(0);
  });

  it('detects files that moved positions', () => {
    const orderA = ['a.js', 'b.js', 'c.js'];
    const orderB = ['b.js', 'a.js', 'c.js']; // a and b swapped

    const diff = calculateOrderDiff(orderA, orderB);

    expect(diff.moved.length).toBe(2);
    expect(diff.moved).toContainEqual({
      file: 'a.js',
      fromIndex: 0,
      toIndex: 1,
      direction: 'down',
      distance: 1,
      isLargeMove: false,
    });
    expect(diff.moved).toContainEqual({
      file: 'b.js',
      fromIndex: 1,
      toIndex: 0,
      direction: 'up',
      distance: -1,
      isLargeMove: false,
    });
  });

  it('detects large position changes (>10 positions)', () => {
    const orderA = Array.from({ length: 20 }, (_, i) => `file${i}.js`);
    const orderB = [...orderA];

    // Move file0.js from position 0 to position 15
    orderB.splice(0, 1);
    orderB.splice(15, 0, 'file0.js');

    const diff = calculateOrderDiff(orderA, orderB);

    const movedFile = diff.moved.find((m) => m.file === 'file0.js');
    expect(movedFile).toBeDefined();
    expect(movedFile.distance).toBe(15);
    expect(movedFile.direction).toBe('down');
    expect(movedFile.isLargeMove).toBe(true);
  });

  it('detects files only in order B (added)', () => {
    const orderA = ['a.js', 'b.js'];
    const orderB = ['a.js', 'b.js', 'c.js'];

    const diff = calculateOrderDiff(orderA, orderB);

    expect(diff.addedInB).toEqual(['c.js']);
  });

  it('detects files only in order A (removed)', () => {
    const orderA = ['a.js', 'b.js', 'c.js'];
    const orderB = ['a.js', 'c.js'];

    const diff = calculateOrderDiff(orderA, orderB);

    expect(diff.removedFromB).toEqual(['b.js']);
  });

  it('calculates similarity score correctly', () => {
    const orderA = ['a.js', 'b.js', 'c.js', 'd.js'];
    const orderB = ['a.js', 'b.js', 'c.js', 'd.js']; // 100% identical

    const diff1 = calculateOrderDiff(orderA, orderB);
    expect(diff1.similarityScore).toBe(100);

    const orderC = ['d.js', 'c.js', 'b.js', 'a.js']; // Completely reversed
    const diff2 = calculateOrderDiff(orderA, orderC);
    expect(diff2.similarityScore).toBeLessThanOrEqual(50);

    const orderD = ['a.js', 'c.js', 'b.js', 'd.js']; // Only b and c swapped
    const diff3 = calculateOrderDiff(orderA, orderD);
    expect(diff3.similarityScore).toBeGreaterThan(50);
    expect(diff3.similarityScore).toBeLessThan(100);
  });

  it('handles edge case: empty orders', () => {
    const diff = calculateOrderDiff([], []);

    expect(diff.unchanged).toEqual([]);
    expect(diff.moved).toEqual([]);
    expect(diff.addedInB).toEqual([]);
    expect(diff.removedFromB).toEqual([]);
    expect(diff.similarityScore).toBe(100);
  });

  it('handles edge case: one empty order', () => {
    const orderA = ['a.js', 'b.js'];
    const orderB = [];

    const diff = calculateOrderDiff(orderA, orderB);

    expect(diff.removedFromB).toEqual(['a.js', 'b.js']);
    expect(diff.similarityScore).toBe(0);
  });

  it('handles large file lists (100+ files)', () => {
    const orderA = Array.from({ length: 200 }, (_, i) => `file${i}.js`);
    const orderB = [...orderA].reverse();

    const start = performance.now();
    const diff = calculateOrderDiff(orderA, orderB);
    const duration = performance.now() - start;

    // Should complete in <50ms for 200 files
    expect(duration).toBeLessThan(50);
    expect(diff.moved.length).toBe(200);
  });
});

describe('formatPositionChange', () => {
  it('formats upward movement correctly', () => {
    expect(formatPositionChange(-1)).toBe('↑1');
    expect(formatPositionChange(-5)).toBe('↑5');
  });

  it('formats downward movement correctly', () => {
    expect(formatPositionChange(1)).toBe('↓1');
    expect(formatPositionChange(10)).toBe('↓10');
  });

  it('formats no change correctly', () => {
    expect(formatPositionChange(0)).toBe('—');
  });
});
