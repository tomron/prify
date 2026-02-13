/**
 * Loading state management and UI indicators
 * Provides consistent loading feedback across the extension
 */

/**
 * Create a loading spinner element
 * @param {string} [size='medium'] - Spinner size (small, medium, large)
 * @param {string} [variant='light'] - Spinner variant (light, dark)
 * @returns {HTMLElement} Spinner element
 */
export function createSpinner(size = 'medium', variant = 'light') {
  const spinner = document.createElement('div');
  spinner.className = `pr-reorder-spinner pr-reorder-spinner-${size}`;

  if (variant === 'dark') {
    spinner.classList.add('pr-reorder-spinner-dark');
  }

  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-label', 'Loading');

  return spinner;
}

/**
 * Show loading spinner in a button
 * @param {HTMLButtonElement} button - Button element
 * @returns {Function} Cleanup function to restore button
 */
export function showButtonLoading(button) {
  // Store original state
  const originalChildren = Array.from(button.childNodes);
  const originalDisabled = button.disabled;

  button.disabled = true;
  button.style.position = 'relative';

  // Clear button safely
  while (button.firstChild) {
    button.removeChild(button.firstChild);
  }

  // Add spinner
  const spinner = createSpinner('small');
  spinner.style.marginRight = '8px';
  button.appendChild(spinner);

  // Add loading text
  const text = document.createElement('span');
  text.textContent = 'Loading...';
  button.appendChild(text);

  // Return cleanup function
  return () => {
    // Clear button
    while (button.firstChild) {
      button.removeChild(button.firstChild);
    }

    // Restore original children
    originalChildren.forEach((child) => {
      button.appendChild(child.cloneNode(true));
    });

    button.disabled = originalDisabled;
  };
}

/**
 * Create a skeleton screen for loading content
 * @param {Object} options - Skeleton options
 * @param {number} [options.rows=3] - Number of skeleton rows
 * @param {boolean} [options.showAvatar=false] - Show avatar skeleton
 * @returns {HTMLElement} Skeleton element
 */
export function createSkeleton(options = {}) {
  const { rows = 3, showAvatar = false } = options;

  const skeleton = document.createElement('div');
  skeleton.className = 'pr-reorder-skeleton';
  skeleton.setAttribute('aria-label', 'Loading content');

  if (showAvatar) {
    const avatar = document.createElement('div');
    avatar.className = 'pr-reorder-skeleton-avatar';
    skeleton.appendChild(avatar);
  }

  const content = document.createElement('div');
  content.className = 'pr-reorder-skeleton-content';

  for (let i = 0; i < rows; i++) {
    const row = document.createElement('div');
    row.className = 'pr-reorder-skeleton-row';

    // Vary row widths for more realistic look
    const widths = ['100%', '85%', '70%', '90%'];
    row.style.width = widths[i % widths.length];

    content.appendChild(row);
  }

  skeleton.appendChild(content);

  return skeleton;
}

/**
 * Show loading overlay on an element
 * @param {HTMLElement} element - Element to show loading on
 * @param {string} [message='Loading...'] - Loading message
 * @returns {Function} Cleanup function to remove overlay
 */
export function showLoadingOverlay(element, message = 'Loading...') {
  const overlay = document.createElement('div');
  overlay.className = 'pr-reorder-loading-overlay';

  const spinner = createSpinner('medium');
  overlay.appendChild(spinner);

  if (message) {
    const text = document.createElement('div');
    text.className = 'pr-reorder-loading-message';
    text.textContent = message;
    overlay.appendChild(text);
  }

  element.style.position = 'relative';
  element.appendChild(overlay);

  // Return cleanup function
  return () => {
    overlay.remove();
  };
}

/**
 * Wrap an async function with loading state
 * @param {Function} asyncFn - Async function to wrap
 * @param {Object} [options={}] - Options
 * @param {HTMLElement} [options.button] - Button to show loading on
 * @param {HTMLElement} [options.container] - Container to show overlay on
 * @param {string} [options.loadingMessage] - Loading message
 * @param {string} [options.successMessage] - Success message to toast
 * @param {string} [options.errorMessage] - Error message prefix
 * @returns {Function} Wrapped function
 */
export function withLoading(asyncFn, options = {}) {
  return async function (...args) {
    const {
      button,
      container,
      loadingMessage = 'Loading...',
      successMessage,
      errorMessage = 'Operation failed',
    } = options;

    let cleanupButton;
    let cleanupOverlay;

    try {
      // Show loading state
      if (button) {
        cleanupButton = showButtonLoading(button);
      }

      if (container) {
        cleanupOverlay = showLoadingOverlay(container, loadingMessage);
      }

      // Execute async function
      const result = await asyncFn.apply(this, args);

      // Show success message if configured
      if (successMessage) {
        const { showNotification } = await import('./error-handler.js');
        showNotification(successMessage, 'success', 3000);
      }

      return result;
    } catch (error) {
      // Show error message
      const { handleError } = await import('./error-handler.js');
      handleError(error, {
        context: errorMessage,
        silent: false,
      });

      throw error;
    } finally {
      // Clean up loading state
      if (cleanupButton) cleanupButton();
      if (cleanupOverlay) cleanupOverlay();
    }
  };
}

/**
 * Show success animation on an element
 * @param {HTMLElement} element - Element to animate
 * @param {string} [type='checkmark'] - Animation type (checkmark, pulse)
 */
export function showSuccessAnimation(element, type = 'checkmark') {
  if (type === 'checkmark') {
    element.classList.add('pr-reorder-success-checkmark');

    setTimeout(() => {
      element.classList.remove('pr-reorder-success-checkmark');
    }, 1000);
  } else if (type === 'pulse') {
    element.classList.add('pr-reorder-success-pulse');

    setTimeout(() => {
      element.classList.remove('pr-reorder-success-pulse');
    }, 600);
  }
}

/**
 * Create empty state UI
 * @param {Object} options - Empty state options
 * @param {string} options.title - Empty state title
 * @param {string} [options.message] - Empty state message
 * @param {string} [options.icon] - Icon emoji
 * @param {string} [options.actionText] - Action button text
 * @param {Function} [options.onAction] - Action button callback
 * @returns {HTMLElement} Empty state element
 */
export function createEmptyState(options) {
  const { title, message, icon = '📋', actionText, onAction } = options;

  const emptyState = document.createElement('div');
  emptyState.className = 'pr-reorder-empty-state';

  const iconEl = document.createElement('div');
  iconEl.className = 'pr-reorder-empty-state-icon';
  iconEl.textContent = icon;
  emptyState.appendChild(iconEl);

  const titleEl = document.createElement('h3');
  titleEl.className = 'pr-reorder-empty-state-title';
  titleEl.textContent = title;
  emptyState.appendChild(titleEl);

  if (message) {
    const messageEl = document.createElement('p');
    messageEl.className = 'pr-reorder-empty-state-message';
    messageEl.textContent = message;
    emptyState.appendChild(messageEl);
  }

  if (actionText && onAction) {
    const button = document.createElement('button');
    button.className = 'pr-reorder-btn pr-reorder-btn-primary';
    button.textContent = actionText;
    button.onclick = onAction;
    emptyState.appendChild(button);
  }

  return emptyState;
}
