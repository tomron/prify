/**
 * Export/Import functionality for file orders
 * Enables sharing orders via JSON export/import and shareable URLs
 */

const SUPPORTED_VERSIONS = ['1.0'];
const CURRENT_VERSION = '1.0';

/**
 * Export order to JSON format
 * @param {Array<string>} order - Array of file paths in order
 * @param {string} prId - PR identifier (e.g., "owner/repo/123")
 * @param {string} user - Username of the person creating the order
 * @param {Object} [metadata] - Optional metadata (notes, etc.)
 * @returns {string} JSON string representation
 * @throws {Error} If validation fails
 */
export function exportOrderToJSON(order, prId, user, metadata = null) {
  // Validate inputs
  if (!Array.isArray(order)) {
    throw new Error('Order must be an array');
  }
  if (order.length === 0) {
    throw new Error('Order cannot be empty');
  }
  if (!prId || typeof prId !== 'string' || prId.trim() === '') {
    throw new Error('PR ID is required');
  }
  if (!user || typeof user !== 'string' || user.trim() === '') {
    throw new Error('User is required');
  }

  const exportData = {
    version: CURRENT_VERSION,
    prId: prId.trim(),
    user: user.trim(),
    order,
    timestamp: new Date().toISOString(),
  };

  if (metadata) {
    exportData.metadata = metadata;
  }

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import order from JSON format
 * @param {string} json - JSON string to import
 * @returns {Object} Parsed and validated order data
 * @throws {Error} If JSON is invalid or validation fails
 */
export function importOrderFromJSON(json) {
  let data;

  // Parse JSON
  try {
    data = JSON.parse(json);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }

  // Validate the data
  validateImportData(data);

  return data;
}

/**
 * Generate a shareable URL with base64-encoded order data
 * @param {Array<string>} order - Array of file paths
 * @param {string} prId - PR identifier
 * @param {string} user - Username
 * @param {Object} [metadata] - Optional metadata
 * @returns {string} Data URL with base64-encoded JSON
 */
export function generateShareableURL(order, prId, user, metadata = null) {
  const json = exportOrderToJSON(order, prId, user, metadata);
  const base64 = btoa(json);
  return `data:text/plain;base64,${base64}`;
}

/**
 * Parse a shareable URL and extract order data
 * @param {string} url - Shareable URL (data:text/plain;base64,...)
 * @returns {Object} Parsed order data
 * @throws {Error} If URL is invalid or malformed
 */
export function parseShareableURL(url) {
  // Validate URL format
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid shareable URL format');
  }

  const prefix = 'data:text/plain;base64,';
  if (!url.startsWith(prefix)) {
    throw new Error('Invalid shareable URL format');
  }

  // Extract and decode base64
  const base64 = url.substring(prefix.length);
  let json;

  try {
    json = atob(base64);
  } catch (error) {
    throw new Error(`Failed to decode base64: ${error.message}`);
  }

  // Parse and validate
  return importOrderFromJSON(json);
}

/**
 * Validate imported data structure
 * @param {Object} data - Data to validate
 * @throws {Error} If validation fails
 */
export function validateImportData(data) {
  // Check required fields
  const requiredFields = ['version', 'prId', 'user', 'order'];

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate version
  if (!SUPPORTED_VERSIONS.includes(data.version)) {
    throw new Error(`Unsupported version: ${data.version}`);
  }

  // Validate order array
  if (!Array.isArray(data.order)) {
    throw new Error('Order must be an array');
  }
  if (data.order.length === 0) {
    throw new Error('Order cannot be empty');
  }

  // Validate prId and user
  if (
    typeof data.prId !== 'string' ||
    data.prId.trim() === ''
  ) {
    throw new Error('PR ID must be a non-empty string');
  }
  if (
    typeof data.user !== 'string' ||
    data.user.trim() === ''
  ) {
    throw new Error('User must be a non-empty string');
  }
}

/**
 * Download order as JSON file
 * @param {Array<string>} order - Array of file paths
 * @param {string} prId - PR identifier
 * @param {string} user - Username
 * @param {Object} [metadata] - Optional metadata
 */
export function downloadOrderAsJSON(order, prId, user, metadata = null) {
  const json = exportOrderToJSON(order, prId, user, metadata);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `pr-order-${prId.replace(/\//g, '-')}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy shareable URL to clipboard
 * @param {string} url - URL to copy
 * @returns {Promise<void>}
 */
export async function copyToClipboard(url) {
  if (!navigator.clipboard) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return;
  }

  await navigator.clipboard.writeText(url);
}
