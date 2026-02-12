/**
 * Consensus Algorithm
 * Calculate democratic consensus from multiple user file orders
 */

import { sortByAveragePosition, calculateAveragePosition } from '../utils/array-utils.js';

/**
 * Calculate consensus order from multiple user orders
 * Uses weighted average of file positions across all orders
 *
 * @param {Array<Object>} orders - Array of order objects with {user, order, timestamp}
 * @param {Object} [options={}] - Calculation options
 * @param {boolean} [options.excludeOutliers=false] - Remove outlier orders
 * @param {number} [options.outlierThreshold=2] - Standard deviations for outlier detection
 * @returns {Array<string>} Consensus file order
 */
export function calculateConsensus(orders, options = {}) {
  const { excludeOutliers = false, outlierThreshold = 2 } = options;

  // Validate input
  if (!Array.isArray(orders)) {
    throw new Error('Orders must be an array');
  }

  if (orders.length === 0) {
    return [];
  }

  // Extract order arrays
  let orderArrays = orders.map((o) => o.order);

  // Validate all orders have arrays
  if (orderArrays.some((arr) => !Array.isArray(arr))) {
    throw new Error('Each order must have an array of files');
  }

  // Filter out empty orders
  orderArrays = orderArrays.filter((arr) => arr.length > 0);

  if (orderArrays.length === 0) {
    return [];
  }

  // Single order - return as-is
  if (orderArrays.length === 1) {
    return orderArrays[0];
  }

  // Remove outliers if requested
  if (excludeOutliers && orderArrays.length > 2) {
    orderArrays = removeOutlierOrders(orderArrays, outlierThreshold);
  }

  // Calculate consensus using average positions
  return sortByAveragePosition(orderArrays);
}

/**
 * Remove outlier orders that differ significantly from consensus
 * @param {Array<Array<string>>} orderArrays - Array of file order arrays
 * @param {number} threshold - Standard deviations threshold
 * @returns {Array<Array<string>>} Filtered order arrays
 */
function removeOutlierOrders(orderArrays, threshold = 2) {
  if (orderArrays.length <= 2) {
    return orderArrays; // Not enough data for outlier detection
  }

  // Calculate preliminary consensus
  const preliminaryConsensus = sortByAveragePosition(orderArrays);

  // Calculate distance of each order from preliminary consensus
  const distances = orderArrays.map((order) =>
    calculateOrderDistance(order, preliminaryConsensus)
  );

  // Calculate mean and standard deviation
  const mean = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const variance =
    distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) /
    distances.length;
  const stdDev = Math.sqrt(variance);

  // Filter out outliers
  const filtered = orderArrays.filter((order, index) => {
    const distance = distances[index];
    return Math.abs(distance - mean) <= threshold * stdDev;
  });

  // Return original if we filtered out too many
  if (filtered.length < orderArrays.length / 2) {
    return orderArrays;
  }

  return filtered;
}

/**
 * Calculate distance between two orders
 * Uses sum of position differences (Kendall tau distance)
 * @param {Array<string>} order1 - First order
 * @param {Array<string>} order2 - Second order
 * @returns {number} Distance metric
 */
function calculateOrderDistance(order1, order2) {
  // Create position maps
  const pos1 = new Map(order1.map((file, i) => [file, i]));
  const pos2 = new Map(order2.map((file, i) => [file, i]));

  // Get common files
  const commonFiles = order1.filter((file) => pos2.has(file));

  if (commonFiles.length === 0) {
    return Infinity;
  }

  // Calculate sum of absolute position differences
  let distance = 0;
  commonFiles.forEach((file) => {
    distance += Math.abs(pos1.get(file) - pos2.get(file));
  });

  // Normalize by number of common files
  return distance / commonFiles.length;
}

/**
 * Get consensus metadata
 * @param {Array<Object>} orders - Array of order objects
 * @param {Array<string>} consensus - Consensus order
 * @returns {Object} Metadata about consensus
 */
export function getConsensusMetadata(orders, consensus) {
  if (orders.length === 0) {
    return {
      participantCount: 0,
      agreementScore: 0,
      conflicts: [],
      mostRecentTimestamp: null,
    };
  }

  // Calculate agreement score (0-1)
  const agreementScore = calculateAgreementScore(
    orders.map((o) => o.order),
    consensus
  );

  // Find conflicts (files with high position variance)
  const conflicts = findConflicts(orders.map((o) => o.order), consensus);

  // Get most recent timestamp
  const timestamps = orders
    .map((o) => o.timestamp)
    .filter((t) => t)
    .map((t) => new Date(t))
    .sort((a, b) => b - a);

  const mostRecentTimestamp = timestamps.length > 0 ? timestamps[0].toISOString() : null;

  return {
    participantCount: orders.length,
    agreementScore,
    conflicts,
    mostRecentTimestamp,
  };
}

/**
 * Calculate agreement score (0-1)
 * Higher score = more agreement between orders
 * @param {Array<Array<string>>} orderArrays - File orders
 * @param {Array<string>} consensus - Consensus order
 * @returns {number} Agreement score
 */
function calculateAgreementScore(orderArrays, consensus) {
  if (orderArrays.length === 0 || consensus.length === 0) {
    return 0;
  }

  // Calculate average distance from consensus
  const distances = orderArrays.map((order) =>
    calculateOrderDistance(order, consensus)
  );

  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  // Normalize to 0-1 (lower distance = higher agreement)
  // Max possible distance is array length
  const maxDistance = consensus.length;
  return 1 - Math.min(avgDistance / maxDistance, 1);
}

/**
 * Find files with high position variance (conflicts)
 * @param {Array<Array<string>>} orderArrays - File orders
 * @param {Array<string>} consensus - Consensus order
 * @returns {Array<Object>} Conflicting files with metadata
 */
function findConflicts(orderArrays, consensus) {
  const conflicts = [];

  consensus.forEach((file) => {
    const positions = orderArrays
      .map((order) => order.indexOf(file))
      .filter((pos) => pos !== -1);

    if (positions.length <= 1) return;

    // Calculate variance
    const mean = positions.reduce((sum, p) => sum + p, 0) / positions.length;
    const variance =
      positions.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) /
      positions.length;
    const stdDev = Math.sqrt(variance);

    // Flag as conflict if variance is high
    // Threshold: standard deviation > 20% of array length
    const threshold = consensus.length * 0.2;
    if (stdDev > threshold) {
      conflicts.push({
        file,
        positions,
        averagePosition: mean,
        standardDeviation: stdDev,
      });
    }
  });

  // Sort by standard deviation (most controversial first)
  conflicts.sort((a, b) => b.standardDeviation - a.standardDeviation);

  return conflicts;
}

/**
 * Merge new order with existing consensus
 * Useful for incremental updates without recalculating everything
 * @param {Array<string>} consensus - Current consensus
 * @param {Array<string>} newOrder - New order to merge
 * @param {number} [weight=1] - Weight of new order (0-1)
 * @returns {Array<string>} Updated consensus
 */
export function mergeOrder(consensus, newOrder, weight = 1) {
  if (!Array.isArray(consensus) || !Array.isArray(newOrder)) {
    throw new Error('Both consensus and newOrder must be arrays');
  }

  if (weight < 0 || weight > 1) {
    throw new Error('Weight must be between 0 and 1');
  }

  if (consensus.length === 0) {
    return newOrder;
  }

  if (newOrder.length === 0) {
    return consensus;
  }

  // Create weighted average of positions
  const positions = new Map();

  // Add consensus positions (weight: 1 - weight)
  consensus.forEach((file, i) => {
    positions.set(file, {
      sum: i * (1 - weight),
      count: 1 - weight,
    });
  });

  // Add new order positions (weight: weight)
  newOrder.forEach((file, i) => {
    if (positions.has(file)) {
      const current = positions.get(file);
      positions.set(file, {
        sum: current.sum + i * weight,
        count: current.count + weight,
      });
    } else {
      positions.set(file, {
        sum: i * weight,
        count: weight,
      });
    }
  });

  // Calculate average positions and sort
  const items = Array.from(positions.entries()).map(([file, { sum, count }]) => ({
    file,
    avgPosition: sum / count,
  }));

  items.sort((a, b) => a.avgPosition - b.avgPosition);

  return items.map((item) => item.file);
}

/**
 * Validate consensus output
 * @param {Array<string>} consensus - Consensus to validate
 * @param {Array<Object>} orders - Original orders
 * @returns {Object} Validation result
 */
export function validateConsensus(consensus, orders) {
  const errors = [];

  // Check consensus is an array
  if (!Array.isArray(consensus)) {
    errors.push('Consensus must be an array');
    return { valid: false, errors };
  }

  // Check no duplicates
  const uniqueFiles = new Set(consensus);
  if (uniqueFiles.size !== consensus.length) {
    errors.push('Consensus contains duplicate files');
  }

  // Check all files from all orders are present
  const allFiles = new Set();
  orders.forEach((order) => {
    if (Array.isArray(order.order)) {
      order.order.forEach((file) => allFiles.add(file));
    }
  });

  const missingFiles = Array.from(allFiles).filter(
    (file) => !consensus.includes(file)
  );

  if (missingFiles.length > 0) {
    errors.push(`Consensus missing files: ${missingFiles.join(', ')}`);
  }

  const extraFiles = consensus.filter((file) => !allFiles.has(file));
  if (extraFiles.length > 0) {
    errors.push(`Consensus has extra files: ${extraFiles.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
