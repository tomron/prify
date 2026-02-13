/**
 * GitHub API Integration
 * Store and retrieve file orders from GitHub PR comments
 */

import { validateOrderCommentData } from '../utils/sanitizer.js';

const COMMENT_PREFIX = 'pr-file-order-data';
const CURRENT_VERSION = '1.0';

/**
 * Get current GitHub username
 * @returns {string|null} Username or null if not found
 */
export function getCurrentUser() {
  // Try multiple selectors for robustness
  const selectors = [
    'meta[name="user-login"]',
    '[data-login]',
    '.header-search-input',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const login =
        element.getAttribute('content') ||
        element.getAttribute('data-login') ||
        element.getAttribute('aria-label');

      if (login) {
        return login.trim();
      }
    }
  }

  return null;
}

/**
 * Check if current user has write permission
 * @returns {boolean} True if user can post comments
 */
export function hasWritePermission() {
  const commentForm = document.querySelector('#new_comment_field');
  return !!(commentForm && !commentForm.disabled);
}

/**
 * Get PR ID from current URL
 * @returns {string|null} PR ID in format "org/repo/123"
 */
export function getPRId() {
  const match = window.location.pathname.match(
    /^\/([^/]+)\/([^/]+)\/pull\/(\d+)/
  );

  if (match) {
    const [, org, repo, number] = match;
    return `${org}/${repo}/${number}`;
  }

  return null;
}

/**
 * Create hidden comment with order data
 * @param {Array<string>} order - File order
 * @param {Object} [metadata={}] - Additional metadata
 * @returns {string} Comment text
 */
export function createOrderComment(order, metadata = {}) {
  const user = getCurrentUser();
  const data = {
    user,
    order,
    timestamp: new Date().toISOString(),
    version: CURRENT_VERSION,
    ...metadata,
  };

  return `<!-- ${COMMENT_PREFIX}\n${JSON.stringify(data, null, 2)}\n-->`;
}

/**
 * Parse order from comment HTML
 * SECURITY: Validates and sanitizes all parsed data
 * @param {string} commentHTML - Comment HTML content
 * @returns {Object|null} Parsed order data or null
 */
export function parseOrderComment(commentHTML) {
  const regex = new RegExp(`<!-- ${COMMENT_PREFIX}\\n([\\s\\S]*?)\\n-->`, 'g');

  const match = regex.exec(commentHTML);
  if (!match) {
    return null;
  }

  try {
    const parsed = JSON.parse(match[1]);

    // SECURITY: Validate and sanitize parsed data before returning
    return validateOrderCommentData(parsed);
  } catch (error) {
    console.error(
      '[PR-Reorder] Failed to parse/validate order comment:',
      error
    );
    return null;
  }
}

/**
 * Extract all orders from PR comments
 * SECURITY: Reads comment HTML safely - only for parsing, never injecting
 * @returns {Array<Object>} Array of order data objects
 */
export function extractOrdersFromComments() {
  const orders = [];
  const commentBodies = document.querySelectorAll('.comment-body');

  commentBodies.forEach((commentBody) => {
    // SECURITY: We need to read the comment HTML to find our hidden comments.
    // This is safe because:
    // 1. We're reading from GitHub's DOM (already sanitized by GitHub)
    // 2. We only parse JSON from HTML comments, never inject HTML
    // 3. All parsed data goes through validateOrderCommentData()
    const html = commentBody.innerHTML;
    const orderData = parseOrderComment(html);

    if (orderData) {
      orders.push(orderData);
    }
  });

  return orders;
}

/**
 * Check rate limit before posting
 * @returns {boolean} True if allowed to post
 */
export function checkRateLimit() {
  const RATE_LIMIT_KEY = 'pr-reorder-last-post';
  const RATE_LIMIT_MS = 5000; // 5 seconds

  const lastPost = localStorage.getItem(RATE_LIMIT_KEY);
  if (lastPost) {
    const timeSincePost = Date.now() - parseInt(lastPost, 10);
    if (timeSincePost < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - timeSincePost) / 1000);
      console.warn(
        `[PR-Reorder] Rate limited. Wait ${waitTime}s before posting again.`
      );
      return false;
    }
  }

  localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
  return true;
}

/**
 * Post order as GitHub comment
 * @param {Array<string>} order - File order
 * @param {Object} [metadata={}] - Additional metadata
 * @returns {Promise<boolean>} True if posted successfully
 */
export async function postOrderComment(order, metadata = {}) {
  if (!hasWritePermission()) {
    console.warn('[PR-Reorder] No write permission, cannot post comment');
    return false;
  }

  if (!checkRateLimit()) {
    return false;
  }

  const commentField = document.querySelector('#new_comment_field');
  const submitButton = document.querySelector(
    'button[type="submit"].js-comment-button'
  );

  if (!commentField || !submitButton) {
    console.error('[PR-Reorder] Comment form not found');
    return false;
  }

  const commentText = createOrderComment(order, metadata);

  // Set comment text
  commentField.value = commentText;
  commentField.dispatchEvent(new Event('input', { bubbles: true }));

  // Wait for GitHub to process
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Submit comment
  submitButton.click();

  // Wait for comment to post
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Verify comment posted
  return checkCommentPosted(commentText);
}

/**
 * Check if comment was successfully posted
 * @param {string} _commentText - Expected comment text (unused, checks for prefix)
 * @returns {boolean} True if comment found
 */
function checkCommentPosted(_commentText) {
  const comments = document.querySelectorAll('.comment-body');
  for (const comment of comments) {
    if (comment.textContent.includes(COMMENT_PREFIX)) {
      return true;
    }
  }
  return false;
}

/**
 * Watch for new comments (real-time updates)
 * @param {Function} callback - Called when new comments detected
 * @returns {MutationObserver|null} Observer instance
 */
export function watchForNewComments(callback) {
  const timeline = document.querySelector('.js-discussion');
  if (!timeline) {
    console.warn('[PR-Reorder] Discussion timeline not found');
    return null;
  }

  const observer = new MutationObserver((mutations) => {
    const hasNewComments = mutations.some((mutation) => {
      return Array.from(mutation.addedNodes).some((node) => {
        return (
          node.classList?.contains('timeline-comment') ||
          node.classList?.contains('comment')
        );
      });
    });

    if (hasNewComments) {
      callback();
    }
  });

  observer.observe(timeline, {
    childList: true,
    subtree: true,
  });

  return observer;
}

/**
 * Stop watching for comments
 * @param {MutationObserver|null} observer - Observer to stop
 */
export function stopWatching(observer) {
  if (observer) {
    observer.disconnect();
  }
}

/**
 * Load orders from both local storage and GitHub comments
 * @returns {Promise<Array<Object>>} Combined orders with metadata
 */
export async function loadAllOrders() {
  const prId = getPRId();
  if (!prId) {
    console.warn('[PR-Reorder] Cannot determine PR ID');
    return [];
  }

  // Get orders from GitHub comments
  const githubOrders = extractOrdersFromComments();

  // Get local order from chrome.storage
  const { loadOrder } = await import('../utils/storage.js');
  const localOrder = await loadOrder(prId);

  const orders = [...githubOrders];

  // Add local order if it exists and is different
  if (localOrder && localOrder.order) {
    const user = getCurrentUser() || 'local';
    const isDuplicate = orders.some(
      (o) =>
        o.user === user &&
        JSON.stringify(o.order) === JSON.stringify(localOrder.order)
    );

    if (!isDuplicate) {
      orders.push({
        user,
        order: localOrder.order,
        timestamp: localOrder.timestamp,
        version: localOrder.version,
        source: 'local',
      });
    }
  }

  return orders;
}

/**
 * Save order to both local storage and GitHub comment
 * @param {Array<string>} order - File order
 * @param {Object} [options={}] - Save options
 * @param {boolean} [options.postToGitHub=true] - Whether to post to GitHub
 * @param {Object} [options.metadata={}] - Additional metadata
 * @returns {Promise<boolean>} True if saved successfully
 */
export async function saveOrderEverywhere(order, options = {}) {
  const { postToGitHub = true, metadata = {} } = options;

  const prId = getPRId();
  if (!prId) {
    console.warn('[PR-Reorder] Cannot determine PR ID');
    return false;
  }

  // Save to local storage
  const { saveOrder } = await import('../utils/storage.js');
  await saveOrder(prId, order);

  // Post to GitHub if allowed
  if (postToGitHub && hasWritePermission()) {
    return await postOrderComment(order, metadata);
  }

  return true;
}
