/**
 * Sort Presets
 * Common file ordering patterns for quick application
 */

/**
 * Get file extension from path
 * @param {string} path - File path
 * @returns {string} File extension (without dot) or empty string
 */
function getExtension(path) {
  const parts = path.split('/').pop().split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/**
 * Check if file is a README
 * @param {string} path - File path
 * @returns {boolean}
 */
function isReadme(path) {
  const filename = path.split('/').pop().toLowerCase();
  return filename.startsWith('readme');
}

/**
 * Check if file is a test file
 * @param {string} path - File path
 * @returns {boolean}
 */
function isTestFile(path) {
  const lowerPath = path.toLowerCase();
  return (
    lowerPath.includes('.test.') ||
    lowerPath.includes('.spec.') ||
    lowerPath.includes('/tests/') ||
    lowerPath.includes('/__tests__/')
  );
}

/**
 * Calculate total changes for a file
 * @param {Object} file - File metadata
 * @returns {number}
 */
function getTotalChanges(file) {
  if (file.changes !== undefined) {
    return file.changes;
  }
  const additions = file.additions || 0;
  const deletions = file.deletions || 0;
  return additions + deletions;
}

/**
 * Sort files alphabetically A-Z
 * @param {Array<Object>} files - Array of file metadata objects
 * @returns {Array<Object>} Sorted files
 */
export function sortAlphabetical(files) {
  return [...files].sort((a, b) => {
    return a.path.localeCompare(b.path, 'en', { sensitivity: 'base' });
  });
}

/**
 * Sort files reverse alphabetically Z-A
 * @param {Array<Object>} files - Array of file metadata objects
 * @returns {Array<Object>} Sorted files
 */
export function sortReverseAlphabetical(files) {
  return [...files].sort((a, b) => {
    return b.path.localeCompare(a.path, 'en', { sensitivity: 'base' });
  });
}

/**
 * Sort files by extension, then alphabetically within each extension
 * @param {Array<Object>} files - Array of file metadata objects
 * @returns {Array<Object>} Sorted files
 */
export function sortByExtension(files) {
  return [...files].sort((a, b) => {
    const extA = getExtension(a.path);
    const extB = getExtension(b.path);

    // First sort by extension
    if (extA !== extB) {
      return extA.localeCompare(extB);
    }

    // Then sort alphabetically within same extension
    return a.path.toLowerCase().localeCompare(b.path.toLowerCase());
  });
}

/**
 * Sort with README files first, test files last
 * @param {Array<Object>} files - Array of file metadata objects
 * @returns {Array<Object>} Sorted files
 */
export function sortReadmeFirstTestsLast(files) {
  return [...files].sort((a, b) => {
    const aIsReadme = isReadme(a.path);
    const bIsReadme = isReadme(b.path);
    const aIsTest = isTestFile(a.path);
    const bIsTest = isTestFile(b.path);

    // README files come first
    if (aIsReadme && !bIsReadme) return -1;
    if (!aIsReadme && bIsReadme) return 1;

    // Test files come last
    if (aIsTest && !bIsTest) return 1;
    if (!aIsTest && bIsTest) return -1;

    // Otherwise sort alphabetically
    return a.path.toLowerCase().localeCompare(b.path.toLowerCase());
  });
}

/**
 * Sort with new files first
 * @param {Array<Object>} files - Array of file metadata objects
 * @returns {Array<Object>} Sorted files
 */
export function sortNewFilesFirst(files) {
  return [...files].sort((a, b) => {
    const aIsNew = a.status === 'added' || a.isNew === true;
    const bIsNew = b.status === 'added' || b.isNew === true;

    // New files first
    if (aIsNew && !bIsNew) return -1;
    if (!aIsNew && bIsNew) return 1;

    // Otherwise sort alphabetically
    return a.path.toLowerCase().localeCompare(b.path.toLowerCase());
  });
}

/**
 * Sort by most changed first (by additions + deletions)
 * @param {Array<Object>} files - Array of file metadata objects
 * @returns {Array<Object>} Sorted files
 */
export function sortMostChangedFirst(files) {
  return [...files].sort((a, b) => {
    const aChanges = getTotalChanges(a);
    const bChanges = getTotalChanges(b);

    // Sort by changes descending
    if (aChanges !== bChanges) {
      return bChanges - aChanges;
    }

    // For equal changes, sort alphabetically
    return a.path.toLowerCase().localeCompare(b.path.toLowerCase());
  });
}

/**
 * Get all available presets
 * @returns {Array<Object>} Array of preset definitions
 */
export function getAllPresets() {
  return [
    {
      id: 'alphabetical',
      name: 'Alphabetical (A-Z)',
      description: 'Sort files alphabetically from A to Z',
      sort: sortAlphabetical,
    },
    {
      id: 'reverse-alphabetical',
      name: 'Reverse Alphabetical (Z-A)',
      description: 'Sort files alphabetically from Z to A',
      sort: sortReverseAlphabetical,
    },
    {
      id: 'by-extension',
      name: 'By File Extension',
      description: 'Group files by extension, then sort alphabetically',
      sort: sortByExtension,
    },
    {
      id: 'readme-first-tests-last',
      name: 'README First, Tests Last',
      description: 'Place README files first and test files last',
      sort: sortReadmeFirstTestsLast,
    },
    {
      id: 'new-files-first',
      name: 'New Files First',
      description: 'Place newly added files first',
      sort: sortNewFilesFirst,
    },
    {
      id: 'most-changed-first',
      name: 'Most Changed First',
      description: 'Sort by number of changes (additions + deletions)',
      sort: sortMostChangedFirst,
    },
  ];
}

/**
 * Apply a preset by ID
 * @param {string} presetId - Preset identifier
 * @param {Array<Object>} files - Array of file metadata objects
 * @returns {Array<Object>} Sorted files
 * @throws {Error} If preset ID is invalid
 */
export function applyPreset(presetId, files) {
  const presets = getAllPresets();
  const preset = presets.find((p) => p.id === presetId);

  if (!preset) {
    throw new Error(`Unknown preset: ${presetId}`);
  }

  return preset.sort(files);
}
