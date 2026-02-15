/**
 * Order Diff Algorithm
 * Compares two file orders and calculates differences, movements, and similarity
 */

/**
 * Calculate diff between two file orders
 * @param {string[]} orderA - First file order
 * @param {string[]} orderB - Second file order
 * @returns {Object} Diff information including moved files, added, removed, and similarity score
 */
export function calculateOrderDiff(orderA, orderB) {
  // Handle empty orders
  if (orderA.length === 0 && orderB.length === 0) {
    return {
      unchanged: [],
      moved: [],
      addedInB: [],
      removedFromB: [],
      similarityScore: 100,
    };
  }

  if (orderA.length === 0) {
    return {
      unchanged: [],
      moved: [],
      addedInB: [...orderB],
      removedFromB: [],
      similarityScore: 0,
    };
  }

  if (orderB.length === 0) {
    return {
      unchanged: [],
      moved: [],
      addedInB: [],
      removedFromB: [...orderA],
      similarityScore: 0,
    };
  }

  // Create maps for O(1) lookup
  const orderAMap = new Map(orderA.map((file, index) => [file, index]));
  const orderBMap = new Map(orderB.map((file, index) => [file, index]));

  // Find files in both orders
  const commonFiles = orderA.filter((file) => orderBMap.has(file));
  const addedInB = orderB.filter((file) => !orderAMap.has(file));
  const removedFromB = orderA.filter((file) => !orderBMap.has(file));

  // Separate unchanged and moved files
  const unchanged = [];
  const moved = [];

  commonFiles.forEach((file) => {
    const fromIndex = orderAMap.get(file);
    const toIndex = orderBMap.get(file);
    const distance = toIndex - fromIndex;

    if (distance === 0) {
      unchanged.push(file);
    } else {
      const direction = distance > 0 ? 'down' : 'up';
      const isLargeMove = Math.abs(distance) > 10;

      moved.push({
        file,
        fromIndex,
        toIndex,
        direction,
        distance,
        isLargeMove,
      });
    }
  });

  // Calculate similarity score (0-100)
  const similarityScore = calculateSimilarity(
    orderA,
    orderB,
    commonFiles,
    orderAMap,
    orderBMap
  );

  return {
    unchanged,
    moved,
    addedInB,
    removedFromB,
    similarityScore,
  };
}

/**
 * Calculate similarity score between two orders
 * Uses normalized position distance metric
 * @param {string[]} orderA
 * @param {string[]} orderB
 * @param {string[]} commonFiles
 * @param {Map} orderAMap
 * @param {Map} orderBMap
 * @returns {number} Similarity score from 0-100
 */
function calculateSimilarity(
  orderA,
  orderB,
  commonFiles,
  orderAMap,
  orderBMap
) {
  if (commonFiles.length === 0) {
    return 0;
  }

  // Calculate average position difference
  let totalDistance = 0;
  const maxPossibleDistance = Math.max(orderA.length, orderB.length);

  commonFiles.forEach((file) => {
    const posA = orderAMap.get(file);
    const posB = orderBMap.get(file);
    totalDistance += Math.abs(posB - posA);
  });

  // Normalize: 0 distance = 100% similar, max distance = 0% similar
  const avgDistance = totalDistance / commonFiles.length;
  const normalizedDistance = avgDistance / maxPossibleDistance;
  const similarity = Math.max(
    0,
    Math.min(100, Math.round((1 - normalizedDistance) * 100))
  );

  return similarity;
}

/**
 * Format position change for display
 * @param {number} distance - Signed distance (negative = up, positive = down, 0 = no change)
 * @returns {string} Formatted string with arrow and distance
 */
export function formatPositionChange(distance) {
  if (distance === 0) {
    return '—';
  }
  if (distance < 0) {
    return `↑${Math.abs(distance)}`;
  }
  return `↓${distance}`;
}
