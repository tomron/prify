/**
 * Error handling and user notifications
 */

/**
 * Error types
 */
export const ErrorType = {
  NETWORK: 'network',
  PERMISSION: 'permission',
  VALIDATION: 'validation',
  STORAGE: 'storage',
  DOM: 'dom',
  UNKNOWN: 'unknown',
};

/**
 * Show toast notification to user
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {number} [duration=5000] - Duration in ms
 */
export function showNotification(message, type = 'info', duration = 5000) {
  // Remove existing toasts
  const existing = document.querySelector('.pr-reorder-toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.className = `pr-reorder-toast pr-reorder-toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  const icon = document.createElement('div');
  icon.className = 'pr-reorder-toast-icon';
  // SECURITY: innerHTML used only for static SVG icons (safe)
  icon.innerHTML = getIconSVG(type);

  const messageEl = document.createElement('div');
  messageEl.className = 'pr-reorder-toast-message';
  // SECURITY: Using textContent for user message
  messageEl.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(messageEl);

  document.body.appendChild(toast);

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return toast;
}

/**
 * Get icon SVG for notification type
 * @param {string} type - Notification type
 * @returns {string} SVG HTML
 */
function getIconSVG(type) {
  const icons = {
    success: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm3.707 7.707l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L8 10.586l4.293-4.293a1 1 0 111.414 1.414z"/>
    </svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 14a1 1 0 11-2 0 1 1 0 012 0zm0-3a1 1 0 01-2 0V6a1 1 0 112 0v5z"/>
    </svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 0L0 17.32h20L10 0zm1 14a1 1 0 11-2 0 1 1 0 012 0zm0-3a1 1 0 01-2 0V7a1 1 0 112 0v4z"/>
    </svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 14a1 1 0 01-2 0V9a1 1 0 112 0v5zm0-7a1 1 0 11-2 0 1 1 0 012 0z"/>
    </svg>`,
  };

  return icons[type] || icons.info;
}

/**
 * Handle error and show appropriate notification
 * @param {Error} error - Error object
 * @param {Object} [options={}] - Error handling options
 * @param {string} [options.context] - Error context
 * @param {boolean} [options.silent=false] - Don't show notification
 * @param {Function} [options.onRetry] - Retry callback
 */
export function handleError(error, options = {}) {
  const { context = '', silent = false } = options;

  // Log error
  console.error(`[PR-Reorder] Error${context ? ` in ${context}` : ''}:`, error);

  if (silent) return;

  // Determine error type and message
  const { userMessage } = categorizeError(error, context);

  // Show notification
  showNotification(userMessage, 'error', 10000);

  // Report to analytics (future)
  // reportError(type, error, context);
}

/**
 * Categorize error and generate user-friendly message
 * @param {Error} error - Error object
 * @param {string} context - Error context
 * @returns {Object} Error type and user message
 */
function categorizeError(error, _context) {
  const message = error.message || String(error);

  // Network errors
  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('offline')
  ) {
    return {
      type: ErrorType.NETWORK,
      userMessage: 'Network error. Please check your connection and try again.',
    };
  }

  // Permission errors
  if (message.includes('permission') || message.includes('denied')) {
    return {
      type: ErrorType.PERMISSION,
      userMessage: "You don't have permission to perform this action.",
    };
  }

  // Validation errors
  if (message.includes('invalid') || message.includes('validation')) {
    return {
      type: ErrorType.VALIDATION,
      userMessage: message,
    };
  }

  // Storage errors
  if (message.includes('storage') || message.includes('quota')) {
    return {
      type: ErrorType.STORAGE,
      userMessage: 'Storage error. Please try clearing browser cache.',
    };
  }

  // DOM errors
  if (message.includes('DOM') || message.includes('element')) {
    return {
      type: ErrorType.DOM,
      userMessage: 'Page structure changed. Please refresh and try again.',
    };
  }

  // Generic error
  return {
    type: ErrorType.UNKNOWN,
    userMessage: `Error: ${message}. Please try again.`,
  };
}

/**
 * Show loading spinner
 * @param {string} [message='Loading...'] - Loading message
 * @returns {Function} Function to hide spinner
 */
export function showLoading(message = 'Loading...') {
  const loader = document.createElement('div');
  loader.className = 'pr-reorder-loading-overlay';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');

  const spinner = document.createElement('div');
  spinner.className = 'pr-reorder-spinner';

  const text = document.createElement('div');
  text.className = 'pr-reorder-loading-text';
  // SECURITY: Using textContent for message
  text.textContent = message;

  loader.appendChild(spinner);
  loader.appendChild(text);
  document.body.appendChild(loader);

  // Return function to hide
  return () => {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 300);
  };
}

/**
 * Wrap async function with error handling
 * @param {Function} fn - Async function
 * @param {Object} [options={}] - Error handling options
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, options = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, options);
      throw error;
    }
  };
}

/**
 * Validate file order
 * @param {Array<string>} order - File order
 * @throws {Error} If validation fails
 */
export function validateOrder(order) {
  if (!Array.isArray(order)) {
    throw new Error('Order must be an array');
  }

  if (order.length === 0) {
    throw new Error('Order cannot be empty');
  }

  if (order.some((file) => typeof file !== 'string')) {
    throw new Error('All files must be strings');
  }

  // Check for duplicates
  const unique = new Set(order);
  if (unique.size !== order.length) {
    throw new Error('Order contains duplicate files');
  }
}

/**
 * Validate PR ID
 * @param {string} prId - PR ID
 * @throws {Error} If validation fails
 */
export function validatePRId(prId) {
  if (!prId || typeof prId !== 'string') {
    throw new Error('Invalid PR ID');
  }

  if (!/^[^/]+\/[^/]+\/\d+$/.test(prId)) {
    throw new Error('PR ID must be in format org/repo/number');
  }
}

/**
 * Safe DOM query selector
 * @param {string} selector - CSS selector
 * @param {Element} [parent=document] - Parent element
 * @returns {Element|null} Found element or null
 */
export function safeQuerySelector(selector, parent = document) {
  try {
    return parent.querySelector(selector);
  } catch (error) {
    console.warn('[PR-Reorder] Invalid selector:', selector, error);
    return null;
  }
}

/**
 * Retry async operation
 * @param {Function} fn - Async function to retry
 * @param {Object} [options={}] - Retry options
 * @param {number} [options.maxRetries=3] - Max retry attempts
 * @param {number} [options.delay=1000] - Delay between retries (ms)
 * @returns {Promise} Function result
 */
export async function retry(fn, options = {}) {
  const { maxRetries = 3, delay = 1000 } = options;

  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        console.log(
          `[PR-Reorder] Retry ${i + 1}/${maxRetries} after ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
