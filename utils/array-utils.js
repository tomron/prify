/**
 * Array utility functions
 */

/**
 * Move an element from one index to another
 * @param {Array} arr - Source array
 * @param {number} fromIndex - Source index
 * @param {number} toIndex - Destination index
 * @returns {Array} New array with element moved
 */
export function moveElement(arr, fromIndex, toIndex) {
  if (fromIndex < 0 || fromIndex >= arr.length) {
    throw new Error(`Invalid fromIndex: ${fromIndex}`);
  }
  if (toIndex < 0 || toIndex >= arr.length) {
    throw new Error(`Invalid toIndex: ${toIndex}`);
  }

  const result = [...arr];
  const [element] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, element);
  return result;
}

/**
 * Calculate average position of elements across multiple arrays
 * @param {Array<Array<string>>} arrays - Arrays of elements
 * @param {string} element - Element to find average position for
 * @returns {number} Average position (0-indexed)
 */
export function calculateAveragePosition(arrays, element) {
  const positions = arrays
    .map((arr) => arr.indexOf(element))
    .filter((pos) => pos !== -1);

  if (positions.length === 0) {
    return -1;
  }

  return positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
}

/**
 * Sort elements by their average positions across multiple arrays
 * @param {Array<Array<string>>} arrays - Arrays of elements
 * @returns {Array<string>} Sorted array of unique elements
 */
export function sortByAveragePosition(arrays) {
  if (arrays.length === 0) {
    return [];
  }

  // Get all unique elements
  const allElements = new Set();
  arrays.forEach((arr) => arr.forEach((element) => allElements.add(element)));

  // Calculate average position for each element
  const elementsWithPositions = Array.from(allElements).map((element) => ({
    element,
    avgPosition: calculateAveragePosition(arrays, element),
  }));

  // Sort by average position
  elementsWithPositions.sort((a, b) => a.avgPosition - b.avgPosition);

  return elementsWithPositions.map((item) => item.element);
}

/**
 * Check if two arrays have the same elements (order doesn't matter)
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {boolean}
 */
export function haveSameElements(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  return sorted1.every((element, index) => element === sorted2[index]);
}
