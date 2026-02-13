/**
 * Main content script for PR File Reorder extension
 * Orchestrates all components to enable collaborative file ordering
 */

import { getCurrentOrder, reorderFiles } from './dom-manipulator.js';
import { createReorderModal } from '../ui/reorder-modal.js';
import { createOrderViewerModal } from '../ui/order-viewer.js';
import { saveOrder } from '../utils/storage.js';
import { getPRId, loadAllOrders, saveOrderEverywhere } from './github-api.js';
import { calculateConsensus, getConsensusMetadata } from './consensus.js';
import { getCleanupManager, cleanup } from '../utils/cleanup-manager.js';

// Extension state
let extensionLoaded = false;
let buttonsInjected = false;

/**
 * Initialize extension on GitHub PR pages
 */
async function init() {
  // BUG-002: Clean up any previous initialization before reinitializing
  if (extensionLoaded) {
    console.log('[PR-Reorder] Cleaning up previous initialization...');
    cleanup();
    extensionLoaded = false;
    buttonsInjected = false;
  }

  // Verify we're on a PR page
  const prId = getPRId();
  if (!prId) {
    console.log('[PR-Reorder] Not a PR page, skipping initialization');
    return;
  }

  console.log('[PR-Reorder] Initializing on PR:', prId);

  // Inject buttons
  injectButtons();

  // Load and apply saved order
  await applySavedOrder();

  // Mark as loaded
  extensionLoaded = true;
  document.documentElement.setAttribute('data-pr-reorder', 'loaded');

  console.log('[PR-Reorder] Extension initialized');
}

/**
 * Inject reorder and view buttons into GitHub UI
 */
function injectButtons() {
  if (buttonsInjected) return;

  // Find the file header (where "Files changed" is)
  const fileHeader = document.querySelector('.pr-review-tools');
  if (!fileHeader) {
    console.warn('[PR-Reorder] Could not find file header, retrying...');
    // BUG-002: Track timeout for cleanup
    const manager = getCleanupManager();
    manager.trackTimeout(injectButtons, 1000);
    return;
  }

  const manager = getCleanupManager();

  // Create button container
  const container = document.createElement('div');
  container.className = 'pr-reorder-button-container';
  container.style.cssText = 'display: inline-flex; gap: 8px; margin-left: 8px;';

  // Create Reorder button
  const reorderBtn = document.createElement('button');
  reorderBtn.className = 'btn btn-sm';
  reorderBtn.textContent = '↕️ Reorder Files';
  reorderBtn.title = 'Drag and drop to reorder files';
  // BUG-002: Track event listener
  manager.trackEventListener(reorderBtn, 'click', handleReorderClick);

  // Create View Orders button
  const viewBtn = document.createElement('button');
  viewBtn.className = 'btn btn-sm';
  viewBtn.textContent = '👥 View Orders';
  viewBtn.title = 'View all user orders and consensus';
  // BUG-002: Track event listener
  manager.trackEventListener(viewBtn, 'click', handleViewOrdersClick);

  container.appendChild(reorderBtn);
  container.appendChild(viewBtn);

  // Inject into UI
  fileHeader.appendChild(container);

  // BUG-002: Track injected element
  manager.trackElement(container);

  buttonsInjected = true;
  console.log('[PR-Reorder] Buttons injected');
}

/**
 * Handle Reorder button click
 */
function handleReorderClick() {
  console.log('[PR-Reorder] Opening reorder modal');

  const currentOrder = getCurrentOrder();

  createReorderModal({
    initialOrder: currentOrder,
    onSave: async (newOrder) => {
      console.log('[PR-Reorder] Saving new order:', newOrder);

      // Apply to DOM
      reorderFiles(newOrder);

      // Save to storage and GitHub
      const prId = getPRId();
      if (prId) {
        await saveOrder(prId, newOrder);

        // Post to GitHub comments
        await saveOrderEverywhere(newOrder, {
          postToGitHub: true,
          metadata: {
            source: 'manual-reorder',
          },
        });
      }

      console.log('[PR-Reorder] Order saved and applied');
    },
    onCancel: () => {
      console.log('[PR-Reorder] Reorder cancelled');
    },
  });
}

/**
 * Handle View Orders button click
 */
async function handleViewOrdersClick() {
  console.log('[PR-Reorder] Opening order viewer');

  try {
    // Load all orders
    const orders = await loadAllOrders();

    // Calculate consensus
    const consensus = calculateConsensus(orders, { excludeOutliers: false });
    const metadata = getConsensusMetadata(orders, consensus);

    console.log('[PR-Reorder] Loaded orders:', {
      count: orders.length,
      agreement: metadata.agreementScore,
      conflicts: metadata.conflicts.length,
    });

    // Show modal
    createOrderViewerModal({
      orders,
      consensus,
      metadata,
      onSelectOrder: (order) => {
        console.log('[PR-Reorder] Applying selected order');
        reorderFiles(order);
      },
      onClose: () => {
        console.log('[PR-Reorder] Order viewer closed');
      },
    });
  } catch (error) {
    console.error('[PR-Reorder] Failed to load orders:', error);
    alert('Failed to load orders. Please try again.');
  }
}

/**
 * Apply saved order from storage
 */
async function applySavedOrder() {
  const prId = getPRId();
  if (!prId) return;

  try {
    // Load all orders and calculate consensus
    const orders = await loadAllOrders();

    if (orders.length === 0) {
      console.log('[PR-Reorder] No saved orders found');
      return;
    }

    // Calculate consensus
    const consensus = calculateConsensus(orders, { excludeOutliers: false });

    if (consensus.length > 0) {
      console.log(
        '[PR-Reorder] Applying consensus order from',
        orders.length,
        'user(s)'
      );
      reorderFiles(consensus);
    }
  } catch (error) {
    console.error('[PR-Reorder] Failed to apply saved order:', error);
  }
}

/**
 * Wait for GitHub to finish loading the PR page
 */
function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
      return;
    }

    window.addEventListener('load', () => {
      // Give GitHub a moment to finish rendering
      setTimeout(resolve, 500);
    });
  });
}

/**
 * Main entry point
 */
async function main() {
  console.log('[PR-Reorder] Content script loaded');

  // Wait for page to load
  await waitForPageLoad();

  // Check if we're on a PR page
  const prId = getPRId();
  if (!prId) {
    console.log('[PR-Reorder] Not a PR page');
    return;
  }

  // Initialize extension
  await init();

  // Watch for navigation (GitHub uses PJAX)
  observeNavigation();
}

/**
 * Observe for GitHub navigation events
 * BUG-002: Track observers for proper cleanup
 */
function observeNavigation() {
  const manager = getCleanupManager();

  // Navigation handler
  const handleNavigation = async () => {
    console.log('[PR-Reorder] Navigation detected, reinitializing...');
    await init();
  };

  // GitHub fires these events on navigation
  manager.trackEventListener(document, 'pjax:end', handleNavigation);

  // Also watch for URL changes
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log(
        '[PR-Reorder] URL changed, checking if reinitialization needed...'
      );
      // BUG-002: Track timeout for cleanup
      manager.trackTimeout(init, 500);
    }
  });

  urlObserver.observe(document.body, { childList: true, subtree: true });

  // BUG-002: Track observer for cleanup
  manager.trackObserver(urlObserver);
}

// Start the extension
main().catch((error) => {
  console.error('[PR-Reorder] Fatal error:', error);
});
