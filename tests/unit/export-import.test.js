/**
 * Export/Import functionality tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  exportOrderToJSON,
  importOrderFromJSON,
  generateShareableURL,
  parseShareableURL,
  validateImportData,
} from '../../utils/export-import.js';

describe('Export/Import Functionality', () => {
  describe('exportOrderToJSON', () => {
    it('should export order as JSON string', () => {
      const order = ['src/index.js', 'src/utils.js', 'README.md'];
      const prId = 'owner/repo/123';
      const user = 'testuser';

      const json = exportOrderToJSON(order, prId, user);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe('1.0');
      expect(parsed.prId).toBe(prId);
      expect(parsed.user).toBe(user);
      expect(parsed.order).toEqual(order);
      expect(parsed.timestamp).toBeDefined();
      expect(new Date(parsed.timestamp)).toBeInstanceOf(Date);
    });

    it('should include metadata in export', () => {
      const order = ['file1.js', 'file2.js'];
      const prId = 'org/repo/456';
      const user = 'alice';
      const metadata = { notes: 'Review core files first' };

      const json = exportOrderToJSON(order, prId, user, metadata);
      const parsed = JSON.parse(json);

      expect(parsed.metadata).toEqual(metadata);
    });

    it('should throw error for invalid order', () => {
      expect(() => exportOrderToJSON(null, 'org/repo/1', 'user')).toThrow(
        'Order must be an array'
      );
      expect(() => exportOrderToJSON([], 'org/repo/1', 'user')).toThrow(
        'Order cannot be empty'
      );
      expect(() => exportOrderToJSON(['file.js'], '', 'user')).toThrow(
        'PR ID is required'
      );
    });
  });

  describe('importOrderFromJSON', () => {
    it('should import valid JSON', () => {
      const exportData = {
        version: '1.0',
        prId: 'owner/repo/789',
        user: 'bob',
        order: ['a.js', 'b.js', 'c.js'],
        timestamp: new Date().toISOString(),
      };
      const json = JSON.stringify(exportData);

      const imported = importOrderFromJSON(json);

      expect(imported.version).toBe('1.0');
      expect(imported.prId).toBe('owner/repo/789');
      expect(imported.user).toBe('bob');
      expect(imported.order).toEqual(['a.js', 'b.js', 'c.js']);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => importOrderFromJSON('not valid json')).toThrow();
    });

    it('should throw error for missing required fields', () => {
      const invalidData = JSON.stringify({
        version: '1.0',
        // missing prId
        user: 'user',
        order: ['file.js'],
      });

      expect(() => importOrderFromJSON(invalidData)).toThrow(
        'Missing required field: prId'
      );
    });

    it('should throw error for invalid order array', () => {
      const invalidData = JSON.stringify({
        version: '1.0',
        prId: 'org/repo/1',
        user: 'user',
        order: 'not-an-array',
      });

      expect(() => importOrderFromJSON(invalidData)).toThrow(
        'Order must be an array'
      );
    });
  });

  describe('generateShareableURL', () => {
    it('should generate base64 encoded URL', () => {
      const order = ['file1.js', 'file2.js'];
      const prId = 'owner/repo/123';
      const user = 'testuser';

      const url = generateShareableURL(order, prId, user);

      expect(url).toContain('data:text/plain;base64,');
      expect(url.length).toBeGreaterThan(50);
    });

    it('should be reversible with parseShareableURL', () => {
      const order = ['src/main.js', 'src/helper.js', 'test/main.test.js'];
      const prId = 'org/repo/456';
      const user = 'alice';

      const url = generateShareableURL(order, prId, user);
      const parsed = parseShareableURL(url);

      expect(parsed.order).toEqual(order);
      expect(parsed.prId).toBe(prId);
      expect(parsed.user).toBe(user);
    });
  });

  describe('parseShareableURL', () => {
    it('should parse valid shareable URL', () => {
      const data = {
        version: '1.0',
        prId: 'owner/repo/789',
        user: 'bob',
        order: ['index.js', 'utils.js'],
        timestamp: new Date().toISOString(),
      };
      const json = JSON.stringify(data);
      const base64 = btoa(json);
      const url = `data:text/plain;base64,${base64}`;

      const parsed = parseShareableURL(url);

      expect(parsed.order).toEqual(['index.js', 'utils.js']);
      expect(parsed.prId).toBe('owner/repo/789');
      expect(parsed.user).toBe('bob');
    });

    it('should throw error for invalid URL format', () => {
      expect(() => parseShareableURL('not-a-valid-url')).toThrow(
        'Invalid shareable URL format'
      );
    });

    it('should throw error for malformed base64', () => {
      expect(() =>
        parseShareableURL('data:text/plain;base64,!!!invalid!!!')
      ).toThrow();
    });
  });

  describe('validateImportData', () => {
    it('should validate correct data structure', () => {
      const validData = {
        version: '1.0',
        prId: 'owner/repo/123',
        user: 'testuser',
        order: ['file1.js', 'file2.js'],
        timestamp: new Date().toISOString(),
      };

      expect(() => validateImportData(validData)).not.toThrow();
    });

    it('should throw for missing version', () => {
      const data = {
        prId: 'org/repo/1',
        user: 'user',
        order: ['file.js'],
      };

      expect(() => validateImportData(data)).toThrow(
        'Missing required field: version'
      );
    });

    it('should throw for missing prId', () => {
      const data = {
        version: '1.0',
        user: 'user',
        order: ['file.js'],
      };

      expect(() => validateImportData(data)).toThrow(
        'Missing required field: prId'
      );
    });

    it('should throw for missing user', () => {
      const data = {
        version: '1.0',
        prId: 'org/repo/1',
        order: ['file.js'],
      };

      expect(() => validateImportData(data)).toThrow(
        'Missing required field: user'
      );
    });

    it('should throw for missing order', () => {
      const data = {
        version: '1.0',
        prId: 'org/repo/1',
        user: 'user',
      };

      expect(() => validateImportData(data)).toThrow(
        'Missing required field: order'
      );
    });

    it('should throw for invalid order type', () => {
      const data = {
        version: '1.0',
        prId: 'org/repo/1',
        user: 'user',
        order: 'not-an-array',
      };

      expect(() => validateImportData(data)).toThrow('Order must be an array');
    });

    it('should throw for empty order', () => {
      const data = {
        version: '1.0',
        prId: 'org/repo/1',
        user: 'user',
        order: [],
      };

      expect(() => validateImportData(data)).toThrow('Order cannot be empty');
    });

    it('should throw for unsupported version', () => {
      const data = {
        version: '99.0',
        prId: 'org/repo/1',
        user: 'user',
        order: ['file.js'],
      };

      expect(() => validateImportData(data)).toThrow(
        'Unsupported version: 99.0'
      );
    });
  });
});
