/**
 * Cleanup Manager
 * Tracks and cleans up all extension resources to prevent memory leaks
 */

/**
 * Cleanup manager instance
 * Tracks all injected DOM elements, event listeners, observers, and pending operations
 */
class CleanupManager {
  constructor() {
    this.injectedElements = new Set();
    this.eventListeners = new Map();
    this.observers = [];
    this.timeouts = new Set();
    this.intervals = new Set();
    this.abortControllers = [];
  }

  /**
   * Track an injected DOM element
   * @param {HTMLElement} element - Element to track
   */
  trackElement(element) {
    this.injectedElements.add(element);
  }

  /**
   * Track an event listener
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} [options] - Event options
   */
  trackEventListener(element, event, handler, options) {
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }

    this.eventListeners.get(element).push({ event, handler, options });
    element.addEventListener(event, handler, options);
  }

  /**
   * Track a MutationObserver or other observer
   * @param {MutationObserver|IntersectionObserver|ResizeObserver} observer - Observer to track
   */
  trackObserver(observer) {
    this.observers.push(observer);
  }

  /**
   * Track a timeout
   * @param {Function} fn - Callback function
   * @param {number} delay - Delay in ms
   * @returns {number} Timeout ID
   */
  trackTimeout(fn, delay) {
    const id = setTimeout(() => {
      this.timeouts.delete(id);
      fn();
    }, delay);

    this.timeouts.add(id);
    return id;
  }

  /**
   * Track an interval
   * @param {Function} fn - Callback function
   * @param {number} delay - Interval in ms
   * @returns {number} Interval ID
   */
  trackInterval(fn, delay) {
    const id = setInterval(fn, delay);
    this.intervals.add(id);
    return id;
  }

  /**
   * Create and track an AbortController for cancellable operations
   * @returns {AbortController} New abort controller
   */
  createAbortController() {
    const controller = new AbortController();
    this.abortControllers.push(controller);
    return controller;
  }

  /**
   * Clean up all tracked resources
   */
  cleanup() {
    // Remove injected DOM elements
    for (const element of this.injectedElements) {
      try {
        element.remove();
      } catch (error) {
        console.warn('[PR-Reorder] Error removing element:', error);
      }
    }
    this.injectedElements.clear();

    // Remove event listeners
    for (const [element, listeners] of this.eventListeners) {
      for (const { event, handler, options } of listeners) {
        try {
          element.removeEventListener(event, handler, options);
        } catch (error) {
          console.warn('[PR-Reorder] Error removing listener:', error);
        }
      }
    }
    this.eventListeners.clear();

    // Disconnect observers
    for (const observer of this.observers) {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('[PR-Reorder] Error disconnecting observer:', error);
      }
    }
    this.observers = [];

    // Clear timeouts
    for (const timeoutId of this.timeouts) {
      clearTimeout(timeoutId);
    }
    this.timeouts.clear();

    // Clear intervals
    for (const intervalId of this.intervals) {
      clearInterval(intervalId);
    }
    this.intervals.clear();

    // Abort pending operations
    for (const controller of this.abortControllers) {
      try {
        controller.abort();
      } catch (error) {
        console.warn('[PR-Reorder] Error aborting operation:', error);
      }
    }
    this.abortControllers = [];

    console.log('[PR-Reorder] Cleanup complete');
  }

  /**
   * Check if there are any tracked resources
   * @returns {boolean} True if resources are tracked
   */
  hasTrackedResources() {
    return (
      this.injectedElements.size > 0 ||
      this.eventListeners.size > 0 ||
      this.observers.length > 0 ||
      this.timeouts.size > 0 ||
      this.intervals.size > 0 ||
      this.abortControllers.length > 0
    );
  }

  /**
   * Get stats about tracked resources
   * @returns {Object} Resource statistics
   */
  getStats() {
    return {
      elements: this.injectedElements.size,
      eventListeners: this.eventListeners.size,
      observers: this.observers.length,
      timeouts: this.timeouts.size,
      intervals: this.intervals.size,
      abortControllers: this.abortControllers.length,
    };
  }
}

// Singleton instance
let instance = null;

/**
 * Get cleanup manager instance
 * @returns {CleanupManager} Cleanup manager
 */
export function getCleanupManager() {
  if (!instance) {
    instance = new CleanupManager();
  }
  return instance;
}

/**
 * Clean up and reset cleanup manager
 */
export function cleanup() {
  if (instance) {
    instance.cleanup();
  }
}

/**
 * Reset cleanup manager (for testing)
 */
export function resetCleanupManager() {
  if (instance) {
    instance.cleanup();
  }
  instance = null;
}
