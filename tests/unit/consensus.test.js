/**
 * @jest-environment jsdom
 */

import {
  calculateConsensus,
  getConsensusMetadata,
  mergeOrder,
  validateConsensus,
} from '../../content/consensus.js';

describe('Consensus Algorithm', () => {
  describe('calculateConsensus', () => {
    it('should return empty array for empty input', () => {
      const result = calculateConsensus([]);

      expect(result).toEqual([]);
    });

    it('should return single order unchanged', () => {
      const orders = [
        {
          user: 'user1',
          order: ['a.js', 'b.js', 'c.js'],
          timestamp: '2024-01-01T00:00:00Z',
        },
      ];

      const result = calculateConsensus(orders);

      expect(result).toEqual(['a.js', 'b.js', 'c.js']);
    });

    it('should calculate consensus from two identical orders', () => {
      const orders = [
        { user: 'user1', order: ['a.js', 'b.js', 'c.js'] },
        { user: 'user2', order: ['a.js', 'b.js', 'c.js'] },
      ];

      const result = calculateConsensus(orders);

      expect(result).toEqual(['a.js', 'b.js', 'c.js']);
    });

    it('should calculate consensus from two different orders', () => {
      const orders = [
        { user: 'user1', order: ['a.js', 'b.js', 'c.js'] },
        { user: 'user2', order: ['c.js', 'b.js', 'a.js'] },
      ];

      const result = calculateConsensus(orders);

      // b.js should be in middle (position 1 in both)
      // a.js average: (0 + 2) / 2 = 1
      // c.js average: (2 + 0) / 2 = 1
      // But a.js comes first in original, so a.js, c.js, b.js OR c.js, a.js, b.js
      expect(result).toContain('a.js');
      expect(result).toContain('b.js');
      expect(result).toContain('c.js');
      expect(result.length).toBe(3);
    });

    it('should handle three orders with clear consensus', () => {
      const orders = [
        { user: 'user1', order: ['a.js', 'b.js', 'c.js'] },
        { user: 'user2', order: ['a.js', 'b.js', 'c.js'] },
        { user: 'user3', order: ['a.js', 'c.js', 'b.js'] },
      ];

      const result = calculateConsensus(orders);

      // a.js: positions [0, 0, 0] = average 0
      // b.js: positions [1, 1, 2] = average 1.33
      // c.js: positions [2, 2, 1] = average 1.67
      expect(result[0]).toBe('a.js');
      expect(result[1]).toBe('b.js');
      expect(result[2]).toBe('c.js');
    });

    it('should handle orders with different file sets', () => {
      const orders = [
        { user: 'user1', order: ['a.js', 'b.js'] },
        { user: 'user2', order: ['b.js', 'c.js'] },
      ];

      const result = calculateConsensus(orders);

      expect(result).toContain('a.js');
      expect(result).toContain('b.js');
      expect(result).toContain('c.js');
      expect(result.length).toBe(3);
    });

    it('should filter out empty orders', () => {
      const orders = [
        { user: 'user1', order: ['a.js', 'b.js'] },
        { user: 'user2', order: [] },
        { user: 'user3', order: ['b.js', 'a.js'] },
      ];

      const result = calculateConsensus(orders);

      expect(result.length).toBe(2);
      expect(result).toContain('a.js');
      expect(result).toContain('b.js');
    });

    it('should throw on invalid input', () => {
      expect(() => calculateConsensus(null)).toThrow('Orders must be an array');
      expect(() => calculateConsensus('not an array')).toThrow(
        'Orders must be an array'
      );
    });

    it('should throw on invalid order structure', () => {
      const orders = [{ user: 'user1', order: 'not an array' }];

      expect(() => calculateConsensus(orders)).toThrow(
        'Each order must have an array of files'
      );
    });

    it('should handle outlier detection', () => {
      const orders = [
        { user: 'user1', order: ['a.js', 'b.js', 'c.js', 'd.js'] },
        { user: 'user2', order: ['a.js', 'b.js', 'c.js', 'd.js'] },
        { user: 'user3', order: ['a.js', 'b.js', 'c.js', 'd.js'] },
        { user: 'outlier', order: ['d.js', 'c.js', 'b.js', 'a.js'] }, // Reverse
      ];

      const result = calculateConsensus(orders, { excludeOutliers: true });

      // Should exclude outlier and return majority consensus
      expect(result).toEqual(['a.js', 'b.js', 'c.js', 'd.js']);
    });
  });

  describe('getConsensusMetadata', () => {
    it('should return default metadata for empty orders', () => {
      const metadata = getConsensusMetadata([], []);

      expect(metadata.participantCount).toBe(0);
      expect(metadata.agreementScore).toBe(0);
      expect(metadata.conflicts).toEqual([]);
      expect(metadata.mostRecentTimestamp).toBeNull();
    });

    it('should calculate metadata for single order', () => {
      const orders = [
        {
          user: 'user1',
          order: ['a.js', 'b.js'],
          timestamp: '2024-01-01T00:00:00Z',
        },
      ];
      const consensus = ['a.js', 'b.js'];

      const metadata = getConsensusMetadata(orders, consensus);

      expect(metadata.participantCount).toBe(1);
      expect(metadata.agreementScore).toBe(1); // Perfect agreement
      expect(metadata.conflicts).toEqual([]);
      expect(metadata.mostRecentTimestamp).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should calculate agreement score for multiple orders', () => {
      const orders = [
        { user: 'user1', order: ['a.js', 'b.js', 'c.js'] },
        { user: 'user2', order: ['a.js', 'b.js', 'c.js'] },
      ];
      const consensus = ['a.js', 'b.js', 'c.js'];

      const metadata = getConsensusMetadata(orders, consensus);

      expect(metadata.agreementScore).toBe(1); // Perfect agreement
    });

    it('should detect conflicts in file positions', () => {
      const orders = [
        { user: 'user1', order: ['a.js', 'b.js', 'c.js', 'd.js', 'e.js'] },
        { user: 'user2', order: ['a.js', 'e.js', 'c.js', 'd.js', 'b.js'] }, // b.js moved
      ];
      const consensus = calculateConsensus(orders);

      const metadata = getConsensusMetadata(orders, consensus);

      // Should detect b.js as conflict (positions 1 and 4)
      expect(metadata.conflicts.length).toBeGreaterThan(0);
    });

    it('should find most recent timestamp', () => {
      const orders = [
        {
          user: 'user1',
          order: ['a.js'],
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          user: 'user2',
          order: ['a.js'],
          timestamp: '2024-01-02T00:00:00Z',
        },
        {
          user: 'user3',
          order: ['a.js'],
          timestamp: '2024-01-01T12:00:00Z',
        },
      ];
      const consensus = ['a.js'];

      const metadata = getConsensusMetadata(orders, consensus);

      expect(metadata.mostRecentTimestamp).toBe('2024-01-02T00:00:00.000Z');
    });
  });

  describe('mergeOrder', () => {
    it('should return new order when consensus is empty', () => {
      const result = mergeOrder([], ['a.js', 'b.js']);

      expect(result).toEqual(['a.js', 'b.js']);
    });

    it('should return consensus when new order is empty', () => {
      const result = mergeOrder(['a.js', 'b.js'], []);

      expect(result).toEqual(['a.js', 'b.js']);
    });

    it('should merge with equal weight', () => {
      const consensus = ['a.js', 'b.js', 'c.js'];
      const newOrder = ['c.js', 'b.js', 'a.js'];

      const result = mergeOrder(consensus, newOrder, 0.5);

      // Should average positions
      expect(result).toContain('a.js');
      expect(result).toContain('b.js');
      expect(result).toContain('c.js');
    });

    it('should favor consensus with low weight', () => {
      const consensus = ['a.js', 'b.js', 'c.js'];
      const newOrder = ['c.js', 'b.js', 'a.js'];

      const result = mergeOrder(consensus, newOrder, 0.1);

      // Should be closer to consensus
      expect(result[0]).toBe('a.js'); // consensus has a.js first
    });

    it('should favor new order with high weight', () => {
      const consensus = ['a.js', 'b.js', 'c.js'];
      const newOrder = ['c.js', 'b.js', 'a.js'];

      const result = mergeOrder(consensus, newOrder, 0.9);

      // Should be closer to new order
      expect(result[0]).toBe('c.js'); // newOrder has c.js first
    });

    it('should handle new files in new order', () => {
      const consensus = ['a.js', 'b.js'];
      const newOrder = ['a.js', 'c.js', 'b.js'];

      const result = mergeOrder(consensus, newOrder, 0.5);

      expect(result).toContain('a.js');
      expect(result).toContain('b.js');
      expect(result).toContain('c.js');
    });

    it('should throw on invalid weight', () => {
      expect(() => mergeOrder(['a.js'], ['b.js'], -0.1)).toThrow(
        'Weight must be between 0 and 1'
      );
      expect(() => mergeOrder(['a.js'], ['b.js'], 1.1)).toThrow(
        'Weight must be between 0 and 1'
      );
    });

    it('should throw on invalid input', () => {
      expect(() => mergeOrder(null, ['a.js'])).toThrow(
        'Both consensus and newOrder must be arrays'
      );
      expect(() => mergeOrder(['a.js'], null)).toThrow(
        'Both consensus and newOrder must be arrays'
      );
    });
  });

  describe('validateConsensus', () => {
    it('should validate correct consensus', () => {
      const orders = [
        { user: 'user1', order: ['a.js', 'b.js'] },
        { user: 'user2', order: ['b.js', 'a.js'] },
      ];
      const consensus = ['a.js', 'b.js'];

      const result = validateConsensus(consensus, orders);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect non-array consensus', () => {
      const result = validateConsensus('not an array', []);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Consensus must be an array');
    });

    it('should detect duplicate files', () => {
      const orders = [{ user: 'user1', order: ['a.js', 'b.js'] }];
      const consensus = ['a.js', 'b.js', 'a.js']; // Duplicate a.js

      const result = validateConsensus(consensus, orders);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('duplicate'))).toBe(true);
    });

    it('should detect missing files', () => {
      const orders = [{ user: 'user1', order: ['a.js', 'b.js', 'c.js'] }];
      const consensus = ['a.js', 'b.js']; // Missing c.js

      const result = validateConsensus(consensus, orders);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('missing'))).toBe(true);
    });

    it('should detect extra files', () => {
      const orders = [{ user: 'user1', order: ['a.js', 'b.js'] }];
      const consensus = ['a.js', 'b.js', 'c.js']; // Extra c.js

      const result = validateConsensus(consensus, orders);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('extra'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle large number of orders', () => {
      const orders = Array.from({ length: 100 }, (_, i) => ({
        user: `user${i}`,
        order: ['a.js', 'b.js', 'c.js'],
      }));

      const result = calculateConsensus(orders);

      expect(result).toEqual(['a.js', 'b.js', 'c.js']);
    });

    it('should handle large file lists', () => {
      const files = Array.from({ length: 200 }, (_, i) => `file${i}.js`);
      const orders = [
        { user: 'user1', order: files },
        { user: 'user2', order: [...files].reverse() },
      ];

      const result = calculateConsensus(orders);

      expect(result.length).toBe(200);
    });

    it('should handle completely disjoint file sets', () => {
      const orders = [
        { user: 'user1', order: ['a.js', 'b.js'] },
        { user: 'user2', order: ['c.js', 'd.js'] },
      ];

      const result = calculateConsensus(orders);

      expect(result.length).toBe(4);
      expect(result).toContain('a.js');
      expect(result).toContain('b.js');
      expect(result).toContain('c.js');
      expect(result).toContain('d.js');
    });

    it('should handle orders with special characters in filenames', () => {
      const orders = [
        { user: 'user1', order: ['file-1.js', 'file_2.js', 'file.test.js'] },
        { user: 'user2', order: ['file.test.js', 'file-1.js', 'file_2.js'] },
      ];

      const result = calculateConsensus(orders);

      expect(result.length).toBe(3);
      expect(result).toContain('file-1.js');
      expect(result).toContain('file_2.js');
      expect(result).toContain('file.test.js');
    });
  });
});
