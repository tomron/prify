/**
 * Search and Filter Utilities
 * Fuzzy matching and filtering for file lists
 */

/**
 * Fuzzy match - check if search chars appear in order in text
 * @param {string} search - Search query
 * @param {string} text - Text to search in
 * @returns {boolean} True if match found
 */
export function fuzzyMatch(search, text) {
  if (!search) return true;
  if (!text) return false;

  const searchLower = search.toLowerCase();
  const textLower = text.toLowerCase();

  let searchIndex = 0;
  let textIndex = 0;

  while (searchIndex < searchLower.length && textIndex < textLower.length) {
    if (searchLower[searchIndex] === textLower[textIndex]) {
      searchIndex++;
    }
    textIndex++;
  }

  return searchIndex === searchLower.length;
}

/**
 * Highlight matching characters in text
 * @param {string} search - Search query
 * @param {string} text - Text to highlight
 * @returns {string} HTML string with <mark> tags
 */
export function highlightMatches(search, text) {
  if (!search) return escapeHtml(text);
  if (!text) return '';

  const searchLower = search.toLowerCase();
  const textLower = text.toLowerCase();

  let result = '';
  let searchIndex = 0;
  let textIndex = 0;

  while (textIndex < text.length) {
    const charLower = textLower[textIndex];
    const char = text[textIndex];

    if (
      searchIndex < searchLower.length &&
      charLower === searchLower[searchIndex]
    ) {
      result += `<mark>${escapeHtml(char)}</mark>`;
      searchIndex++;
    } else {
      result += escapeHtml(char);
    }

    textIndex++;
  }

  // If we didn't match all search chars, return plain text
  if (searchIndex < searchLower.length) {
    return escapeHtml(text);
  }

  return result;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Filter files by search query (fuzzy match)
 * @param {Array<string>} files - File paths to filter
 * @param {string} search - Search query
 * @returns {Array<string>} Filtered files in original order
 */
export function filterFiles(files, search) {
  if (!search) return files;

  return files.filter(file => fuzzyMatch(search, file));
}

/**
 * Get file count message
 * @param {number} filtered - Number of filtered files
 * @param {number} total - Total number of files
 * @returns {string} Count message (e.g., "5 of 10 files")
 */
export function getFileCountMessage(filtered, total) {
  if (filtered === total) {
    return `${total} file${total !== 1 ? 's' : ''}`;
  }
  return `${filtered} of ${total} file${total !== 1 ? 's' : ''}`;
}
