/**
 * @jest-environment jsdom
 */

import {
  getCurrentUser,
  hasWritePermission,
  getPRId,
  createOrderComment,
  parseOrderComment,
  extractOrdersFromComments,
  checkRateLimit,
  watchForNewComments,
  stopWatching,
} from '../../content/github-api.js';

describe('GitHub API - Simple Tests', () => {
  beforeEach(() => {
    // Clear DOM body
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    // Clear DOM head
    while (document.head.firstChild) {
      document.head.removeChild(document.head.firstChild);
    }

    // Clear localStorage
    localStorage.clear();

    // Reset URL
    delete window.location;
    window.location = new URL('https://github.com/org/repo/pull/123');
  });

  describe('getCurrentUser', () => {
    it('should extract username from meta tag', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'user-login');
      meta.setAttribute('content', 'testuser');
      document.head.appendChild(meta);

      const user = getCurrentUser();

      expect(user).toBe('testuser');
    });

    it('should extract username from data-login attribute', () => {
      const element = document.createElement('div');
      element.setAttribute('data-login', 'testuser2');
      document.body.appendChild(element);

      const user = getCurrentUser();

      expect(user).toBe('testuser2');
    });

    it('should return null when no user found', () => {
      const user = getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('hasWritePermission', () => {
    it('should return true when comment field exists and enabled', () => {
      const field = document.createElement('textarea');
      field.id = 'new_comment_field';
      document.body.appendChild(field);

      expect(hasWritePermission()).toBe(true);
    });

    it('should return false when comment field is disabled', () => {
      const field = document.createElement('textarea');
      field.id = 'new_comment_field';
      field.disabled = true;
      document.body.appendChild(field);

      expect(hasWritePermission()).toBe(false);
    });

    it('should return false when comment field does not exist', () => {
      expect(hasWritePermission()).toBe(false);
    });
  });

  describe('getPRId', () => {
    it('should extract PR ID from URL', () => {
      const prId = getPRId();

      expect(prId).toBe('org/repo/123');
    });

    it('should return null for non-PR URLs', () => {
      window.location = new URL('https://github.com/org/repo');

      const prId = getPRId();

      expect(prId).toBeNull();
    });

    it('should handle different PR numbers', () => {
      window.location = new URL('https://github.com/myorg/myrepo/pull/456');

      const prId = getPRId();

      expect(prId).toBe('myorg/myrepo/456');
    });
  });

  describe('createOrderComment', () => {
    it('should create valid comment with order data', () => {
      // Mock getCurrentUser
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'user-login');
      meta.setAttribute('content', 'testuser');
      document.head.appendChild(meta);

      const order = ['file1.js', 'file2.js', 'file3.js'];
      const comment = createOrderComment(order);

      expect(comment).toContain('<!-- pr-file-order-data');
      expect(comment).toContain('"user": "testuser"');
      expect(comment).toContain('"order": [');
      expect(comment).toContain('"file1.js"');
      expect(comment).toContain('"version": "1.0"');
    });

    it('should include metadata if provided', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'user-login');
      meta.setAttribute('content', 'testuser');
      document.head.appendChild(meta);

      const order = ['file1.js'];
      const comment = createOrderComment(order, { note: 'Test order' });

      expect(comment).toContain('"note": "Test order"');
    });
  });

  describe('parseOrderComment', () => {
    it('should parse valid order comment', () => {
      // SECURITY: Test code using innerHTML to create mock GitHub comment HTML (safe - static test data)
      const commentHTML = `
        <p>Some text</p>
        <!-- pr-file-order-data
{
  "user": "testuser",
  "order": ["file1.js", "file2.js"],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0"
}
-->
        <p>More text</p>
      `;

      const data = parseOrderComment(commentHTML);

      expect(data).not.toBeNull();
      expect(data.user).toBe('testuser');
      expect(data.order).toEqual(['file1.js', 'file2.js']);
      expect(data.version).toBe('1.0');
    });

    it('should return null for comments without order data', () => {
      const commentHTML = '<p>Just a regular comment</p>';

      const data = parseOrderComment(commentHTML);

      expect(data).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      const commentHTML = `
        <!-- pr-file-order-data
        {invalid json}
        -->
      `;

      const data = parseOrderComment(commentHTML);

      expect(data).toBeNull();
    });
  });

  describe('extractOrdersFromComments', () => {
    it('should extract multiple orders from comments', () => {
      // SECURITY: Test code using innerHTML to create mock GitHub comments (safe - static test data)
      // Create comment 1
      const comment1 = document.createElement('div');
      comment1.className = 'comment-body';
      comment1.innerHTML = `
        <!-- pr-file-order-data
{
  "user": "user1",
  "order": ["a.js", "b.js"],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0"
}
-->
      `;
      document.body.appendChild(comment1);

      // Create comment 2
      const comment2 = document.createElement('div');
      comment2.className = 'comment-body';
      comment2.innerHTML = `
        <!-- pr-file-order-data
{
  "user": "user2",
  "order": ["b.js", "a.js"],
  "timestamp": "2024-01-01T01:00:00.000Z",
  "version": "1.0"
}
-->
      `;
      document.body.appendChild(comment2);

      const orders = extractOrdersFromComments();

      expect(orders.length).toBe(2);
      expect(orders[0].user).toBe('user1');
      expect(orders[1].user).toBe('user2');
    });

    it('should skip regular comments', () => {
      // SECURITY: Test code using innerHTML to create mock comment (safe - static test data)
      const comment = document.createElement('div');
      comment.className = 'comment-body';
      comment.innerHTML = '<p>Just a regular comment</p>';
      document.body.appendChild(comment);

      const orders = extractOrdersFromComments();

      expect(orders.length).toBe(0);
    });

    it('should return empty array when no comments exist', () => {
      const orders = extractOrdersFromComments();

      expect(orders).toEqual([]);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow first post', () => {
      const allowed = checkRateLimit();

      expect(allowed).toBe(true);
    });

    it('should block rapid consecutive posts', () => {
      checkRateLimit(); // First post

      const allowed = checkRateLimit(); // Immediate second post

      expect(allowed).toBe(false);
    });

    it('should allow post after rate limit expires', (done) => {
      checkRateLimit(); // First post

      // Wait for rate limit to expire (5 seconds + margin)
      setTimeout(() => {
        const allowed = checkRateLimit();
        expect(allowed).toBe(true);
        done();
      }, 5100);
    }, 10000); // Increase timeout for this test
  });

  describe('watchForNewComments', () => {
    it('should call callback when new comment added', (done) => {
      const timeline = document.createElement('div');
      timeline.className = 'js-discussion';
      document.body.appendChild(timeline);

      let called = false;

      const observer = watchForNewComments(() => {
        called = true;
        stopWatching(observer);
        done();
      });

      // Add new comment after a delay
      setTimeout(() => {
        const comment = document.createElement('div');
        comment.className = 'timeline-comment';
        timeline.appendChild(comment);

        // Wait for callback
        setTimeout(() => {
          if (!called) {
            stopWatching(observer);
            done(new Error('Callback not called'));
          }
        }, 100);
      }, 10);
    });

    it('should return null when timeline not found', () => {
      const observer = watchForNewComments(() => {});

      expect(observer).toBeNull();
    });

    it('should stop watching when stopped', (done) => {
      const timeline = document.createElement('div');
      timeline.className = 'js-discussion';
      document.body.appendChild(timeline);

      let called = false;

      const observer = watchForNewComments(() => {
        called = true;
      });

      stopWatching(observer);

      // Try to add comment after stopping
      const comment = document.createElement('div');
      comment.className = 'timeline-comment';
      timeline.appendChild(comment);

      setTimeout(() => {
        expect(called).toBe(false);
        done();
      }, 100);
    });
  });
});
