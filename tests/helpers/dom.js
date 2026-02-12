/**
 * DOM helper utilities for testing
 */

/**
 * Create a mock file element
 * @param {string} path - File path
 * @param {number} additions - Number of additions
 * @param {number} deletions - Number of deletions
 * @returns {HTMLElement}
 */
export function createMockFileElement(path, additions = 0, deletions = 0) {
  const file = document.createElement('div');
  file.className = 'file';
  file.dataset.path = path;
  file.dataset.additions = additions.toString();
  file.dataset.deletions = deletions.toString();

  const header = document.createElement('div');
  header.className = 'file-header';

  const info = document.createElement('div');
  info.className = 'file-info';

  const link = document.createElement('a');
  link.textContent = path;
  link.href = `#diff-${path}`;

  info.appendChild(link);
  header.appendChild(info);
  file.appendChild(header);

  return file;
}

/**
 * Create a mock files container
 * @param {Array<{path: string, additions: number, deletions: number}>} files
 * @returns {HTMLElement}
 */
export function createMockFilesContainer(files) {
  const container = document.createElement('div');
  container.className = 'files';

  files.forEach((fileData) => {
    const file = createMockFileElement(
      fileData.path,
      fileData.additions,
      fileData.deletions
    );
    container.appendChild(file);
  });

  return container;
}

/**
 * Get all file paths from a container
 * @param {HTMLElement} container
 * @returns {string[]}
 */
export function getFilePathsFromContainer(container) {
  const files = container.querySelectorAll('.file');
  return Array.from(files).map((file) => file.dataset.path);
}

/**
 * Create a mock comment element
 * @param {string} content - Comment content (plain text only for security)
 * @returns {HTMLElement}
 */
export function createMockCommentElement(content) {
  const wrapper = document.createElement('div');
  wrapper.className = 'timeline-comment-wrapper';

  const comment = document.createElement('div');
  comment.className = 'comment';

  const body = document.createElement('div');
  body.className = 'comment-body';
  body.textContent = content; // Use textContent for security

  comment.appendChild(body);
  wrapper.appendChild(comment);

  return wrapper;
}

/**
 * Wait for element to appear
 * @param {string} selector
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<HTMLElement>}
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Trigger a drag and drop operation
 * @param {HTMLElement} source
 * @param {HTMLElement} target
 */
export function simulateDragDrop(source, target) {
  const dragStartEvent = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
  });

  const dropEvent = new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
  });

  const dragEndEvent = new DragEvent('dragend', {
    bubbles: true,
    cancelable: true,
  });

  source.dispatchEvent(dragStartEvent);
  target.dispatchEvent(dropEvent);
  source.dispatchEvent(dragEndEvent);
}
