/**
 * GitHub DOM Parser
 * Utilities for extracting file information from GitHub PR pages
 *
 * BUG-004: Enhanced with error boundaries and DOM structure detection
 */

// Parser error types
export const ParserErrorType = {
  CONTAINER_NOT_FOUND: 'container_not_found',
  NO_FILES_FOUND: 'no_files_found',
  INVALID_FILE_ELEMENT: 'invalid_file_element',
  DOM_STRUCTURE_CHANGED: 'dom_structure_changed',
  EXTRACTION_ERROR: 'extraction_error',
};

// Parser statistics for monitoring
let parserStats = {
  successfulExtractions: 0,
  failedExtractions: 0,
  fallbacksUsed: 0,
  lastError: null,
  domStructureVersion: null,
};

/**
 * Get parser statistics
 * BUG-004: For monitoring and debugging
 * @returns {Object} Parser statistics
 */
export function getParserStats() {
  return { ...parserStats };
}

/**
 * Reset parser statistics
 * BUG-004: For testing
 */
export function resetParserStats() {
  parserStats = {
    successfulExtractions: 0,
    failedExtractions: 0,
    fallbacksUsed: 0,
    lastError: null,
    domStructureVersion: null,
  };
}

/**
 * Detect GitHub PR DOM structure version
 * BUG-004: Helps identify when GitHub changes DOM
 * @returns {string} Detected version identifier
 */
export function detectDOMStructureVersion() {
  // Check for known GitHub DOM patterns
  const indicators = {
    hasFiles: !!document.querySelector('.files'),
    hasDiffContainer: !!document.querySelector(
      '[data-target="diff-container"]'
    ),
    hasProgressiveContainer: !!document.querySelector(
      '.js-diff-progressive-container'
    ),
    hasFileInfo: !!document.querySelector('.file-info'),
    hasFileHeader: !!document.querySelector('.file-header'),
  };

  const version = Object.entries(indicators)
    .filter(([, present]) => present)
    .map(([key]) => key)
    .sort()
    .join('|');

  parserStats.domStructureVersion = version || 'unknown';
  return version || 'unknown';
}

/**
 * Log parser error
 * BUG-004: Centralized error logging
 * @param {string} errorType - Error type
 * @param {string} message - Error message
 * @param {*} context - Additional context
 */
function logParserError(errorType, message, context = null) {
  const error = {
    type: errorType,
    message,
    context,
    timestamp: new Date().toISOString(),
    domVersion: parserStats.domStructureVersion,
  };

  parserStats.lastError = error;
  parserStats.failedExtractions++;

  console.error('[PR-Reorder Parser]', message, error);
}

/**
 * Get the files container element
 * BUG-004: Enhanced with error boundaries and fallback tracking
 * @param {HTMLElement} [container] - Optional container to use instead of searching document
 * @returns {HTMLElement|null} The files container or null if not found
 */
export function getFilesContainer(container) {
  try {
    // If container provided, return it
    if (container) {
      parserStats.successfulExtractions++;
      return container;
    }

    // Try multiple selectors for GitHub's files container
    const selectors = [
      '.files',
      '[data-target="diff-container"]',
      '.js-diff-progressive-container',
      '[data-hpc]', // New GitHub (Primer React Components)
      'turbo-frame[id*="repo-content"]', // Turbo frame
      '#diff-comparison-viewer-container', // New GitHub diff viewer
      'body', // Last resort - search entire page
    ];

    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      const element = document.querySelector(selector);
      if (element) {
        if (i > 0) {
          // Used a fallback selector
          parserStats.fallbacksUsed++;
          console.log(
            `[PR-Reorder Parser] Used fallback selector: ${selector}`
          );
        }
        parserStats.successfulExtractions++;
        return element;
      }
    }

    logParserError(
      ParserErrorType.CONTAINER_NOT_FOUND,
      'Files container not found with any selector',
      { selectors }
    );

    return null;
  } catch (error) {
    logParserError(
      ParserErrorType.EXTRACTION_ERROR,
      'Error in getFilesContainer',
      error
    );
    return null;
  }
}

/**
 * Extract all file elements from the PR
 * BUG-004: Enhanced with error boundaries and logging
 * @param {HTMLElement} [container] - Optional container to extract from
 * @returns {HTMLElement[]} Array of file elements
 */
export function extractFiles(container) {
  try {
    const filesContainer = getFilesContainer(container);

    if (!filesContainer) {
      return [];
    }

    // Try multiple selectors for file elements
    // Order matters: try most specific first
    const fileSelectors = [
      '.file', // Old GitHub
      '[data-file-type]', // Old GitHub
      '[data-path]', // Old GitHub
      '[id^="diff-"]', // New GitHub - actual diff containers
      'div[id^="diff-"]', // More specific diff containers
      '[data-file-path]', // New GitHub - but may match buttons, not files
    ];

    for (let i = 0; i < fileSelectors.length; i++) {
      const selector = fileSelectors[i];
      let files = Array.from(filesContainer.querySelectorAll(selector));

      // Filter out non-file elements
      if (selector.includes('diff-')) {
        // For diff- selectors, filter to only file diffs (have actual file content)
        files = files.filter((el) => {
          // Must have an ID that looks like: diff-{hash}-{hash}--{path}
          // NOT like: diff-comparison-viewer-container
          return (
            el.id &&
            el.id.match(/^diff-[a-f0-9]+-[a-f0-9]+--/) &&
            !el.id.includes('container') &&
            !el.id.includes('viewer')
          );
        });
      }

      if (files.length > 0) {
        if (i > 0) {
          // Used a fallback selector
          parserStats.fallbacksUsed++;
          console.log(
            `[PR-Reorder Parser] Used fallback file selector: ${selector} (${files.length} files)`
          );
        }
        parserStats.successfulExtractions++;
        return files;
      }
    }

    logParserError(
      ParserErrorType.NO_FILES_FOUND,
      'No files found with any selector',
      { selectors: fileSelectors }
    );

    return [];
  } catch (error) {
    logParserError(
      ParserErrorType.EXTRACTION_ERROR,
      'Error in extractFiles',
      error
    );
    return [];
  }
}

/**
 * Extract file path from a file element
 * BUG-004: Enhanced with error boundaries and fallback tracking
 * @param {HTMLElement} fileElement - The file element
 * @returns {string|null} The file path or null if not found
 */
export function getFilePath(fileElement) {
  if (!fileElement) {
    return null;
  }

  try {
    // Try data-path attribute first (most reliable)
    if (fileElement.dataset && fileElement.dataset.path) {
      return fileElement.dataset.path;
    }

    // Try data-file-path (new GitHub)
    if (fileElement.dataset && fileElement.dataset.filePath) {
      return fileElement.dataset.filePath;
    }

    // Try to extract from ID (diff-{hash}--{path})
    if (fileElement.id && fileElement.id.startsWith('diff-')) {
      const pathMatch = fileElement.id.match(/diff-[^-]+--(.*)/);
      if (pathMatch) {
        parserStats.fallbacksUsed++;
        return decodeURIComponent(pathMatch[1]);
      }
    }

    // Try to find file path in .file-info a element
    const fileInfo = fileElement.querySelector('.file-info a');
    if (fileInfo && fileInfo.textContent) {
      parserStats.fallbacksUsed++;
      return fileInfo.textContent.trim();
    }

    // Try other common selectors
    const titleElement = fileElement.querySelector(
      '[data-path], [data-file-path]'
    );
    if (titleElement) {
      const path =
        titleElement.dataset.path || titleElement.dataset.filePath;
      if (path) {
        parserStats.fallbacksUsed++;
        return path;
      }
    }

    // Try the file header link
    const headerLink = fileElement.querySelector('.file-header a');
    if (headerLink && headerLink.textContent) {
      parserStats.fallbacksUsed++;
      return headerLink.textContent.trim();
    }

    logParserError(
      ParserErrorType.INVALID_FILE_ELEMENT,
      'Could not extract file path from element',
      { element: fileElement.outerHTML?.substring(0, 200) }
    );

    return null;
  } catch (error) {
    logParserError(
      ParserErrorType.EXTRACTION_ERROR,
      'Error in getFilePath',
      error
    );
    return null;
  }
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
