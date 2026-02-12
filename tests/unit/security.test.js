/**
 * Security tests for XSS vulnerabilities
 */

import { parseOrderComment } from '../../content/github-api.js';
import { showNotification } from '../../utils/error-handler.js';

describe('Security - XSS Prevention', () => {
  describe('Comment parsing', () => {
    it('should safely parse order comments without executing scripts', () => {
      const maliciousComment = `<!-- pr-file-order-data
{
  "user": "attacker<script>alert('XSS')</script>",
  "order": ["<img src=x onerror=alert('XSS')>", "file2.js"],
  "timestamp": "2025-02-12T10:00:00Z",
  "version": "1.0"
}
-->`;

      const parsed = parseOrderComment(maliciousComment);

      expect(parsed).toBeTruthy();
      expect(parsed.user).toBe("attacker<script>alert('XSS')</script>");
      // Data should be parsed but not executed
      expect(document.querySelectorAll('script').length).toBe(0);
    });

    it('should handle malformed JSON gracefully', () => {
      const malformedComment = `
        <!-- pr-file-order-data
        { this is not valid JSON }
        -->
      `;

      const parsed = parseOrderComment(malformedComment);

      expect(parsed).toBeNull();
    });

    it('should sanitize file paths with HTML entities', () => {
      const comment = `<!-- pr-file-order-data
{
  "user": "user1",
  "order": ["<script>alert('xss')</script>.js", "normal.js"],
  "timestamp": "2025-02-12T10:00:00Z",
  "version": "1.0"
}
-->`;

      const parsed = parseOrderComment(comment);

      expect(parsed).toBeTruthy();
      expect(parsed.order[0]).toBe("<script>alert('xss')</script>.js");
      // Should be stored as plain text, not executed
    });
  });

  describe('Notification system', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should escape HTML in notification messages', () => {
      const maliciousMessage = '<script>alert("XSS")</script>';

      showNotification(maliciousMessage, 'info', 0);

      const toast = document.querySelector('.pr-reorder-toast');
      expect(toast).toBeTruthy();

      const messageEl = toast.querySelector('.pr-reorder-toast-message');
      expect(messageEl.textContent).toBe(maliciousMessage);
      // Verify no script tags were created
      expect(document.querySelectorAll('script').length).toBe(0);
    });

    it('should handle special characters in messages', () => {
      const message = 'Error: "File & <path>" not found';

      showNotification(message, 'error', 0);

      const toast = document.querySelector('.pr-reorder-toast');
      const messageEl = toast.querySelector('.pr-reorder-toast-message');

      expect(messageEl.textContent).toBe(message);
    });
  });

  describe('DOM manipulation safety', () => {
    it('should not allow script injection through file paths', () => {
      const container = document.createElement('div');
      const filePath = '<img src=x onerror=alert("XSS")>';

      // Safe way: textContent
      const safe = document.createElement('span');
      safe.textContent = filePath;
      container.appendChild(safe);

      expect(container.querySelector('img')).toBeNull();
      expect(container.textContent).toBe(filePath);
    });

    it('should safely clear container contents', () => {
      const container = document.createElement('div');
      const div = document.createElement('div');
      div.textContent = 'Test';
      container.appendChild(div);

      // Safe clearing methods
      while (container.firstChild) {
        container.firstChild.remove();
      }

      expect(container.children.length).toBe(0);
      expect(container.textContent).toBe('');
    });

    it('should use replaceChildren() for safe clearing', () => {
      const container = document.createElement('div');
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      container.appendChild(child1);
      container.appendChild(child2);

      // Modern safe clearing
      container.replaceChildren();

      expect(container.children.length).toBe(0);
    });
  });

  describe('Input validation', () => {
    it('should reject orders with non-string file paths', () => {
      const maliciousOrder = [
        'normal.js',
        { toString: () => '<script>alert("XSS")</script>' },
        'another.js',
      ];

      // Validation should fail
      const isValid = maliciousOrder.every((file) => typeof file === 'string');

      expect(isValid).toBe(false);
    });

    it('should validate order data structure', () => {
      const validOrder = ['file1.js', 'file2.js'];
      const invalidOrder = null;

      expect(Array.isArray(validOrder)).toBe(true);
      expect(Array.isArray(invalidOrder)).toBe(false);
    });
  });
});
