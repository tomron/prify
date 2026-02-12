/**
 * GitHub DOM Parser
 * Utilities for extracting file information from GitHub PR pages
 */

/**
 * Get the files container element
 * @param {HTMLElement} [container] - Optional container to use instead of searching document
 * @returns {HTMLElement|null} The files container or null if not found
 */
export function getFilesContainer(container) {
  // If container provided, return it
  if (container) {
    return container;
  }

  // Try multiple selectors for GitHub's files container
  const selectors = [
    '.files',
    '[data-target="diff-container"]',
    '.js-diff-progressive-container',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }

  return null;
}

/**
 * Extract all file elements from the PR
 * @param {HTMLElement} [container] - Optional container to extract from
 * @returns {HTMLElement[]} Array of file elements
 */
export function extractFiles(container) {
  const filesContainer = getFilesContainer(container);

  if (!filesContainer) {
    return [];
  }

  // Try multiple selectors for file elements
  const fileSelectors = [
    '.file',
    '[data-file-type]',
    '[data-path]',
  ];

  for (const selector of fileSelectors) {
    const files = filesContainer.querySelectorAll(selector);
    if (files.length > 0) {
      return Array.from(files);
    }
  }

  return [];
}

/**
 * Extract file path from a file element
 * @param {HTMLElement} fileElement - The file element
 * @returns {string|null} The file path or null if not found
 */
export function getFilePath(fileElement) {
  if (!fileElement) {
    return null;
  }

  // Try data-path attribute first (most reliable)
  if (fileElement.dataset.path) {
    return fileElement.dataset.path;
  }

  // Try to find file path in .file-info a element
  const fileInfo = fileElement.querySelector('.file-info a');
  if (fileInfo && fileInfo.textContent) {
    return fileInfo.textContent.trim();
  }

  // Try other common selectors
  const titleElement = fileElement.querySelector('[data-path]');
  if (titleElement && titleElement.dataset.path) {
    return titleElement.dataset.path;
  }

  // Try the file header link
  const headerLink = fileElement.querySelector('.file-header a');
  if (headerLink && headerLink.textContent) {
    return headerLink.textContent.trim();
  }

  return null;
}

/**
 * Extract metadata from a file element
 * @param {HTMLElement} fileElement - The file element
 * @returns {Object} File metadata including path, additions, deletions, status, etc.
 */
export function getFileMetadata(fileElement) {
  const metadata = {
    path: getFilePath(fileElement),
    additions: 0,
    deletions: 0,
    changes: 0,
    status: 'modified',
    renamed: false,
    binary: false,
    isNew: false,
    isDeleted: false,
    isModified: false,
    oldPath: null,
    newPath: null,
  };

  if (!fileElement) {
    return metadata;
  }

  // Extract additions and deletions
  if (fileElement.dataset.additions) {
    metadata.additions = parseInt(fileElement.dataset.additions, 10) || 0;
  }

  if (fileElement.dataset.deletions) {
    metadata.deletions = parseInt(fileElement.dataset.deletions, 10) || 0;
  }

  // Calculate total changes
  metadata.changes = metadata.additions + metadata.deletions;

  // Check if file is renamed
  if (fileElement.dataset.oldPath) {
    metadata.renamed = true;
    metadata.oldPath = fileElement.dataset.oldPath;
    metadata.newPath = metadata.path;
  }

  // Check if file is binary
  if (fileElement.dataset.binary === 'true') {
    metadata.binary = true;
  }

  // Determine file status
  if (fileElement.dataset.fileStatus) {
    metadata.status = fileElement.dataset.fileStatus;
  }

  // Set convenience flags
  metadata.isNew = metadata.status === 'added';
  metadata.isDeleted = metadata.status === 'removed';
  metadata.isModified = metadata.status === 'modified';

  return metadata;
}

/**
 * Extract all files with metadata from the PR
 * @param {HTMLElement} [container] - Optional container to extract from
 * @returns {Object[]} Array of file metadata objects
 */
export function extractAllFilesMetadata(container) {
  const files = extractFiles(container);
  return files.map((file) => getFileMetadata(file));
}
