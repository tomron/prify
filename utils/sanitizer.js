/**
 * Input sanitization and XSS prevention utilities
 * SECURITY: This module provides safe DOM manipulation helpers
 */

/**
 * Safely set text content (prevents XSS)
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text to set
 * @returns {HTMLElement} The element
 */
export function setSafeText(element, text) {
  // SECURITY: textContent is safe - never interprets HTML
  element.textContent = String(text);
  return element;
}

/**
 * Safely clear element contents
 * @param {HTMLElement} element - Element to clear
 * @returns {HTMLElement} The element
 */
export function clearElement(element) {
  // SECURITY: replaceChildren() is safer than innerHTML = ''
  element.replaceChildren();
  return element;
}

/**
 * Safely create element with text content
 * @param {string} tag - HTML tag name
 * @param {string} text - Text content
 * @param {Object} [options={}] - Element options
 * @param {string} [options.className] - CSS class
 * @param {Object} [options.attributes] - HTML attributes
 * @returns {HTMLElement} Created element
 */
export function createSafeElement(tag, text = '', options = {}) {
  const element = document.createElement(tag);

  if (text) {
    setSafeText(element, text);
  }

  if (options.className) {
    element.className = options.className;
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      // SECURITY: setAttribute is safe for most attributes
      element.setAttribute(key, String(value));
    });
  }

  return element;
}

/**
 * Validate and sanitize file path
 * @param {*} path - File path to validate
 * @returns {string} Sanitized path
 * @throws {Error} If path is invalid
 */
export function sanitizeFilePath(path) {
  if (typeof path !== 'string') {
    throw new Error('File path must be a string');
  }

  if (path.length === 0) {
    throw new Error('File path cannot be empty');
  }

  if (path.length > 4096) {
    throw new Error('File path too long');
  }

  // Path is valid, return as-is (will be used with textContent, not innerHTML)
  return path;
}

/**
 * Validate and sanitize username
 * @param {*} username - Username to validate
 * @returns {string} Sanitized username
 * @throws {Error} If username is invalid
 */
export function sanitizeUsername(username) {
  if (typeof username !== 'string') {
    throw new Error('Username must be a string');
  }

  if (username.length === 0) {
    throw new Error('Username cannot be empty');
  }

  if (username.length > 256) {
    throw new Error('Username too long');
  }

  // Username is valid, return as-is (will be used with textContent)
  return username;
}

/**
 * Validate order array
 * @param {*} order - Order to validate
 * @returns {Array<string>} Validated order
 * @throws {Error} If order is invalid
 */
export function validateOrder(order) {
  if (!Array.isArray(order)) {
    throw new Error('Order must be an array');
  }

  if (order.length === 0) {
    throw new Error('Order cannot be empty');
  }

  if (order.length > 10000) {
    throw new Error('Order too large (max 10000 files)');
  }

  // Validate each file path
  const sanitized = order.map((file, index) => {
    try {
      return sanitizeFilePath(file);
    } catch (error) {
      throw new Error(`Invalid file at index ${index}: ${error.message}`);
    }
  });

  // Check for duplicates
  const unique = new Set(sanitized);
  if (unique.size !== sanitized.length) {
    throw new Error('Order contains duplicate files');
  }

  return sanitized;
}

/**
 * Validate and sanitize order comment data
 * @param {*} data - Order comment data
 * @returns {Object} Sanitized data
 * @throws {Error} If data is invalid
 */
export function validateOrderCommentData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Order data must be an object');
  }

  const { user, order, timestamp, version } = data;

  // Validate required fields
  if (!user) {
    throw new Error('Order data missing user field');
  }

  if (!order) {
    throw new Error('Order data missing order field');
  }

  // Sanitize and validate
  const sanitizedUser = sanitizeUsername(user);
  const sanitizedOrder = validateOrder(order);

  // Validate timestamp (optional but should be valid if present)
  let sanitizedTimestamp = timestamp;
  if (timestamp) {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp');
    }
    sanitizedTimestamp = date.toISOString();
  }

  return {
    user: sanitizedUser,
    order: sanitizedOrder,
    timestamp: sanitizedTimestamp || new Date().toISOString(),
    version: String(version || '1.0'),
  };
}

/**
 * Escape HTML entities (defensive, though we use textContent)
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Check if string contains potential XSS patterns
 * @param {string} text - Text to check
 * @returns {boolean} True if suspicious patterns found
 */
export function containsXSSPatterns(text) {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(text));
}
