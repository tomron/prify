/**
 * Order diff utilities
 * Calculate and visualize differences between file orders
 */

/**
 * Calculate diff between two orders
 * @param {Array<string>} orderA - First order (baseline)
 * @param {Array<string>} orderB - Second order (comparison)
 * @returns {Array<Object>} Diff entries with file, fromIndex, toIndex, change, category
 */
export function calculateOrderDiff(orderA, orderB) {
  // Get all unique files from both orders
  const allFiles = new Set([...orderA, ...orderB]);

  const diff = [];

  for (const file of allFiles) {
    const fromIndex = orderA.indexOf(file);
    const toIndex = orderB.indexOf(file);
    const change = getPositionChange(fromIndex, toIndex);
    const category = categorizeChange(fromIndex, toIndex);

    diff.push({
      file,
      fromIndex,
      toIndex,
      change,
      category,
    });
  }

  // Sort by the baseline order (orderA), with added files at the end
  return diff.sort((a, b) => {
    if (a.fromIndex === -1 && b.fromIndex === -1) {
      // Both added, sort by position in orderB
      return a.toIndex - b.toIndex;
    }
    if (a.fromIndex === -1) return 1; // a is added, put after b
    if (b.fromIndex === -1) return -1; // b is added, put after a
    return a.fromIndex - b.fromIndex; // Both exist, sort by orderA position
  });
}

/**
 * Get position change between two indices
 * @param {number} fromIndex - Original index (-1 if not present)
 * @param {number} toIndex - New index (-1 if not present)
 * @returns {number} Position change (positive = moved down, negative = moved up)
 */
export function getPositionChange(fromIndex, toIndex) {
  if (fromIndex === -1 || toIndex === -1) {
    return 0; // Added or removed, no meaningful change
  }
  return toIndex - fromIndex;
}

/**
 * Categorize the type of change
 * @param {number} fromIndex - Original index
 * @param {number} toIndex - New index
 * @returns {string} Category: unchanged, moved-up, moved-down, added, removed
 */
export function categorizeChange(fromIndex, toIndex) {
  if (fromIndex === -1 && toIndex !== -1) {
    return 'added';
  }
  if (fromIndex !== -1 && toIndex === -1) {
    return 'removed';
  }
  if (fromIndex === toIndex) {
    return 'unchanged';
  }
  if (toIndex < fromIndex) {
    return 'moved-up';
  }
  return 'moved-down';
}

/**
 * Format position change for display
 * @param {number} change - Position change
 * @returns {string} Formatted change (e.g., "↑ 3 positions", "No change")
 */
export function formatPositionChange(change) {
  if (change === 0) {
    return 'No change';
  }

  const absChange = Math.abs(change);
  const positions = absChange === 1 ? 'position' : 'positions';

  if (change < 0) {
    return `↑ ${absChange} ${positions}`;
  }

  return `↓ ${absChange} ${positions}`;
}

/**
 * Get diff statistics
 * @param {Array<Object>} diff - Diff result from calculateOrderDiff
 * @returns {Object} Statistics: unchanged, movedUp, movedDown, added, removed
 */
export function getDiffStats(diff) {
  const stats = {
    unchanged: 0,
    movedUp: 0,
    movedDown: 0,
    added: 0,
    removed: 0,
    totalChanges: 0,
  };

  for (const entry of diff) {
    if (entry.category === 'unchanged') stats.unchanged++;
    else if (entry.category === 'moved-up') stats.movedUp++;
    else if (entry.category === 'moved-down') stats.movedDown++;
    else if (entry.category === 'added') stats.added++;
    else if (entry.category === 'removed') stats.removed++;
  }

  stats.totalChanges = diff.length - stats.unchanged;

  return stats;
}
