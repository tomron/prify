/**
 * Performance optimization utilities
 */

/**
 * Debounce function calls
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function calls
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum time between calls (ms)
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit = 100) {
  let inThrottle;
  return function throttled(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request animation frame wrapper
 * @param {Function} fn - Function to call on next frame
 * @returns {number} Request ID
 */
export function raf(fn) {
  return requestAnimationFrame(fn);
}

/**
 * Batch DOM reads
 * @param {Function} fn - Function that reads DOM
 * @returns {Promise} Result of function
 */
export async function batchRead(fn) {
  return new Promise((resolve) => {
    raf(() => resolve(fn()));
  });
}

/**
 * Batch DOM writes
 * @param {Function} fn - Function that writes to DOM
 * @returns {Promise} Result of function
 */
export async function batchWrite(fn) {
  return new Promise((resolve) => {
    raf(() => resolve(fn()));
  });
}

/**
 * Lazy load items with IntersectionObserver
 * @param {Array} items - Items to lazy load
 * @param {Function} renderFn - Function to render each item
 * @param {Object} [options={}] - Lazy load options
 * @param {Element} [options.root=null] - Root element
 * @param {string} [options.rootMargin='50px'] - Root margin
 * @returns {Function} Cleanup function
 */
export function lazyLoad(items, renderFn, options = {}) {
  const { root = null, rootMargin = '50px' } = options;

  const placeholders = items.map((item, index) => {
    const placeholder = document.createElement('div');
    placeholder.className = 'pr-lazy-placeholder';
    placeholder.dataset.index = index;
    return placeholder;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const placeholder = entry.target;
          const index = parseInt(placeholder.dataset.index, 10);
          const rendered = renderFn(items[index], index);

          placeholder.replaceWith(rendered);
          observer.unobserve(placeholder);
        }
      });
    },
    { root, rootMargin, threshold: 0.01 }
  );

  placeholders.forEach((p) => observer.observe(p));

  return () => observer.disconnect();
}

/**
 * Measure performance of function
 * @param {string} label - Performance label
 * @param {Function} fn - Function to measure
 * @returns {*} Function result
 */
export async function measure(label, fn) {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  console.log(`[PR-Reorder] ${label}: ${duration.toFixed(2)}ms`);
  return result;
}

/**
 * Virtual scrolling for large lists
 * @param {Object} options - Virtual scroll options
 * @param {Array} options.items - All items
 * @param {Element} options.container - Container element
 * @param {number} options.itemHeight - Height of each item
 * @param {Function} options.renderItem - Render function
 * @param {number} [options.overscan=5] - Items to render outside viewport
 * @returns {Object} Virtual scroller instance
 */
export function createVirtualScroller(options) {
  const { items, container, itemHeight, renderItem, overscan = 5 } = options;

  let scrollTop = 0;
  let visibleStart = 0;
  let visibleEnd = 0;

  // Calculate viewport metrics for virtual scrolling
  // const totalHeight = items.length * itemHeight;
  const viewportHeight = container.clientHeight;
  // const visibleCount = Math.ceil(viewportHeight / itemHeight);

  // Create spacers
  const topSpacer = document.createElement('div');
  const bottomSpacer = document.createElement('div');
  const content = document.createElement('div');

  container.appendChild(topSpacer);
  container.appendChild(content);
  container.appendChild(bottomSpacer);

  function updateVisibleRange() {
    scrollTop = container.scrollTop;
    visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    visibleEnd = Math.min(
      items.length,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
    );
  }

  function render() {
    updateVisibleRange();

    // Update spacers
    topSpacer.style.height = `${visibleStart * itemHeight}px`;
    bottomSpacer.style.height = `${(items.length - visibleEnd) * itemHeight}px`;

    // SECURITY: Clear content safely using replaceChildren()
    content.replaceChildren();

    // Render visible items
    for (let i = visibleStart; i < visibleEnd; i++) {
      const itemEl = renderItem(items[i], i);
      content.appendChild(itemEl);
    }
  }

  // Initial render
  render();

  // Listen for scroll
  const handleScroll = throttle(render, 16); // ~60fps
  container.addEventListener('scroll', handleScroll);

  return {
    update: (newItems) => {
      items.length = 0;
      items.push(...newItems);
      render();
    },
    destroy: () => {
      container.removeEventListener('scroll', handleScroll);
      // SECURITY: Clear safely using replaceChildren()
      container.replaceChildren();
    },
  };
}

/**
 * Memory-efficient chunking for large operations
 * @param {Array} items - Items to process
 * @param {Function} processFn - Process function
 * @param {Object} [options={}] - Chunk options
 * @param {number} [options.chunkSize=100] - Items per chunk
 * @param {number} [options.delay=0] - Delay between chunks (ms)
 * @returns {Promise<Array>} Processed results
 */
export async function processInChunks(items, processFn, options = {}) {
  const { chunkSize = 100, delay = 0 } = options;
  const results = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(processFn));
    results.push(...chunkResults);

    if (delay > 0 && i + chunkSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return results;
}

/**
 * Memoize function results
 * @param {Function} fn - Function to memoize
 * @param {Function} [keyFn] - Custom key function
 * @returns {Function} Memoized function
 */
export function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
  const cache = new Map();

  return function memoized(...args) {
    const key = keyFn(...args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Clear stale cache entries
 * @param {Map} cache - Cache map
 * @param {number} maxAge - Max age in milliseconds
 */
export function clearStaleCache(cache, maxAge = 300000) {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.timestamp && now - entry.timestamp > maxAge) {
      cache.delete(key);
    }
  }
}

/**
 * Optimize image loading
 * @param {HTMLImageElement} img - Image element
 * @param {string} src - Image source
 * @param {Object} [options={}] - Options
 */
export function optimizeImage(img, src, options = {}) {
  const { loading = 'lazy', decoding = 'async' } = options;

  img.loading = loading;
  img.decoding = decoding;
  img.src = src;
}

/**
 * Prefetch resource
 * @param {string} url - URL to prefetch
 * @param {string} [as='fetch'] - Resource type
 */
export function prefetch(url, as = 'fetch') {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Check if reduced motion is preferred
 * @returns {boolean} True if reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Idle callback wrapper
 * @param {Function} fn - Function to call when idle
 * @param {Object} [options={}] - Options
 * @param {number} [options.timeout=2000] - Timeout (ms)
 * @returns {number} Callback ID
 */
export function whenIdle(fn, options = {}) {
  const { timeout = 2000 } = options;

  if ('requestIdleCallback' in window) {
    return requestIdleCallback(fn, { timeout });
  }

  // Fallback
  return setTimeout(fn, timeout);
}

/**
 * Cancel idle callback
 * @param {number} id - Callback ID
 */
export function cancelIdle(id) {
  if ('cancelIdleCallback' in window) {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}
