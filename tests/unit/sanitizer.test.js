/**
 * Tests for sanitizer utilities
 */

import {
  setSafeText,
  clearElement,
  createSafeElement,
  sanitizeFilePath,
  sanitizeUsername,
  validateOrder,
  validateOrderCommentData,
  escapeHTML,
  containsXSSPatterns,
} from '../../utils/sanitizer.js';

describe('Sanitizer', () => {
  describe('setSafeText', () => {
    it('should set text content safely', () => {
      const div = document.createElement('div');
      setSafeText(div, '<script>alert("XSS")</script>');

      expect(div.textContent).toBe('<script>alert("XSS")</script>');
      expect(div.querySelector('script')).toBeNull();
    });

    it('should handle special characters', () => {
      const div = document.createElement('div');
      setSafeText(div, 'Test & "quotes" <tags>');

      expect(div.textContent).toBe('Test & "quotes" <tags>');
    });
  });

  describe('clearElement', () => {
    it('should clear element safely', () => {
      const div = document.createElement('div');
      div.appendChild(document.createElement('span'));
      div.appendChild(document.createElement('p'));

      expect(div.children.length).toBe(2);

      clearElement(div);

      expect(div.children.length).toBe(0);
      expect(div.textContent).toBe('');
    });
  });

  describe('createSafeElement', () => {
    it('should create element with safe text', () => {
      const span = createSafeElement('span', '<b>Bold</b>', {
        className: 'test-class',
      });

      expect(span.tagName).toBe('SPAN');
      expect(span.textContent).toBe('<b>Bold</b>');
      expect(span.className).toBe('test-class');
      expect(span.querySelector('b')).toBeNull();
    });

    it('should set attributes safely', () => {
      const link = createSafeElement('a', 'Click me', {
        attributes: {
          href: '#test',
          'data-id': '123',
        },
      });

      expect(link.getAttribute('href')).toBe('#test');
      expect(link.getAttribute('data-id')).toBe('123');
    });
  });

  describe('sanitizeFilePath', () => {
    it('should accept valid file paths', () => {
      expect(sanitizeFilePath('src/utils/parser.js')).toBe(
        'src/utils/parser.js'
      );
      expect(sanitizeFilePath('README.md')).toBe('README.md');
      expect(sanitizeFilePath('../parent/file.ts')).toBe('../parent/file.ts');
    });

    it('should reject non-string paths', () => {
      expect(() => sanitizeFilePath(123)).toThrow('must be a string');
      expect(() => sanitizeFilePath(null)).toThrow('must be a string');
      expect(() => sanitizeFilePath({})).toThrow('must be a string');
    });

    it('should reject empty paths', () => {
      expect(() => sanitizeFilePath('')).toThrow('cannot be empty');
    });

    it('should reject overly long paths', () => {
      const longPath = 'a'.repeat(5000);
      expect(() => sanitizeFilePath(longPath)).toThrow('too long');
    });
  });

  describe('sanitizeUsername', () => {
    it('should accept valid usernames', () => {
      expect(sanitizeUsername('user123')).toBe('user123');
      expect(sanitizeUsername('test-user')).toBe('test-user');
      expect(sanitizeUsername('User_Name')).toBe('User_Name');
    });

    it('should reject non-string usernames', () => {
      expect(() => sanitizeUsername(123)).toThrow('must be a string');
      expect(() => sanitizeUsername(null)).toThrow('must be a string');
    });

    it('should reject empty usernames', () => {
      expect(() => sanitizeUsername('')).toThrow('cannot be empty');
    });

    it('should reject overly long usernames', () => {
      const longUsername = 'a'.repeat(300);
      expect(() => sanitizeUsername(longUsername)).toThrow('too long');
    });
  });

  describe('validateOrder', () => {
    it('should accept valid orders', () => {
      const order = ['file1.js', 'file2.js', 'file3.js'];
      const result = validateOrder(order);

      expect(result).toEqual(order);
    });

    it('should reject non-array orders', () => {
      expect(() => validateOrder('not an array')).toThrow('must be an array');
      expect(() => validateOrder(null)).toThrow('must be an array');
      expect(() => validateOrder({})).toThrow('must be an array');
    });

    it('should reject empty orders', () => {
      expect(() => validateOrder([])).toThrow('cannot be empty');
    });

    it('should reject orders with non-string files', () => {
      const order = ['file1.js', 123, 'file3.js'];
      expect(() => validateOrder(order)).toThrow('Invalid file at index 1');
    });

    it('should reject orders with duplicate files', () => {
      const order = ['file1.js', 'file2.js', 'file1.js'];
      expect(() => validateOrder(order)).toThrow('duplicate files');
    });

    it('should reject overly large orders', () => {
      const order = Array(10001)
        .fill(null)
        .map((_, i) => `file${i}.js`);
      expect(() => validateOrder(order)).toThrow('too large');
    });
  });

  describe('validateOrderCommentData', () => {
    it('should accept valid order comment data', () => {
      const data = {
        user: 'testuser',
        order: ['file1.js', 'file2.js'],
        timestamp: '2025-02-12T10:00:00Z',
        version: '1.0',
      };

      const result = validateOrderCommentData(data);

      expect(result.user).toBe('testuser');
      expect(result.order).toEqual(['file1.js', 'file2.js']);
      expect(result.timestamp).toBe('2025-02-12T10:00:00.000Z'); // ISO format adds milliseconds
      expect(result.version).toBe('1.0');
    });

    it('should reject invalid data types', () => {
      expect(() => validateOrderCommentData(null)).toThrow();
      expect(() => validateOrderCommentData('string')).toThrow();
      // Arrays are objects, so they'll fail on missing fields instead
      expect(() => validateOrderCommentData([])).toThrow();
    });

    it('should reject data missing required fields', () => {
      expect(() => validateOrderCommentData({ order: ['file.js'] })).toThrow(
        'missing user'
      );
      expect(() => validateOrderCommentData({ user: 'test' })).toThrow(
        'missing order'
      );
    });

    it('should add timestamp if missing', () => {
      const data = {
        user: 'testuser',
        order: ['file1.js'],
      };

      const result = validateOrderCommentData(data);

      expect(result.timestamp).toBeTruthy();
      expect(new Date(result.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should reject invalid timestamps', () => {
      const data = {
        user: 'testuser',
        order: ['file1.js'],
        timestamp: 'not a valid date',
      };

      expect(() => validateOrderCommentData(data)).toThrow('Invalid timestamp');
    });

    it('should sanitize nested order data', () => {
      const data = {
        user: '<script>alert("XSS")</script>',
        order: ['file1.js', 'file2.js'],
        timestamp: '2025-02-12T10:00:00Z',
      };

      // Should not throw - user data is allowed, just stored safely
      const result = validateOrderCommentData(data);
      expect(result.user).toBe('<script>alert("XSS")</script>');
    });
  });

  describe('escapeHTML', () => {
    it('should escape HTML entities', () => {
      expect(escapeHTML('<script>alert("XSS")</script>')).toContain('&lt;');
      expect(escapeHTML('<script>alert("XSS")</script>')).toContain('&gt;');
    });

    it('should handle special characters', () => {
      const escaped = escapeHTML('Test & "quotes" <tags>');
      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
    });
  });

  describe('containsXSSPatterns', () => {
    it('should detect script tags', () => {
      expect(containsXSSPatterns('<script>alert("XSS")</script>')).toBe(true);
      expect(containsXSSPatterns('<SCRIPT>alert("XSS")</SCRIPT>')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(containsXSSPatterns('javascript:alert("XSS")')).toBe(true);
      expect(containsXSSPatterns('JAVASCRIPT:alert("XSS")')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(containsXSSPatterns('<img onerror=alert("XSS")>')).toBe(true);
      expect(containsXSSPatterns('<body onload=alert("XSS")>')).toBe(true);
    });

    it('should detect dangerous tags', () => {
      expect(containsXSSPatterns('<iframe src="evil.com">')).toBe(true);
      expect(containsXSSPatterns('<embed src="evil.swf">')).toBe(true);
      expect(containsXSSPatterns('<object data="evil.com">')).toBe(true);
    });

    it('should not flag safe content', () => {
      expect(containsXSSPatterns('normal file path.js')).toBe(false);
      expect(containsXSSPatterns('src/components/Button.tsx')).toBe(false);
      expect(containsXSSPatterns('README.md')).toBe(false);
    });
  });
});
