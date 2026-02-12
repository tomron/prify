/**
 * Main content script for PR File Reorder extension
 * Orchestrates all components to enable collaborative file ordering
 */

import { getCurrentOrder, reorderFiles } from './dom-manipulator.js';
import { createReorderModal } from '../ui/reorder-modal.js';
import { createOrderViewerModal } from '../ui/order-viewer.js';
import { createKeyboardHelpModal } from '../ui/keyboard-help-modal.js';
import { saveOrder } from '../utils/storage.js';
import { getPRId, loadAllOrders, saveOrderEverywhere } from './github-api.js';
import { calculateConsensus, getConsensusMetadata } from './consensus.js';
import {
  registerShortcut,
  unregisterShortcut,
  DEFAULT_SHORTCUTS,
} from '../utils/keyboard.js';

// Extension state
let extensionLoaded = false;
let buttonsInjected = false;
let shortcutIds = [];

/**
 * Initialize extension on GitHub PR pages
 */
async function init() {
  if (extensionLoaded) return;

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

  // Register keyboard shortcuts
  registerKeyboardShortcuts();

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
    setTimeout(injectButtons, 1000);
    return;
  }

  // Create button container
  const container = document.createElement('div');
  container.className = 'pr-reorder-button-container';
  container.style.cssText = 'display: inline-flex; gap: 8px; margin-left: 8px;';

  // Create Reorder button
  const reorderBtn = document.createElement('button');
  reorderBtn.className = 'btn btn-sm';
  reorderBtn.textContent = '↕️ Reorder Files';
  reorderBtn.title = 'Drag and drop to reorder files';
  reorderBtn.addEventListener('click', handleReorderClick);

  // Create View Orders button
  const viewBtn = document.createElement('button');
  viewBtn.className = 'btn btn-sm';
  viewBtn.textContent = '👥 View Orders';
  viewBtn.title = 'View all user orders and consensus';
  viewBtn.addEventListener('click', handleViewOrdersClick);

  container.appendChild(reorderBtn);
  container.appendChild(viewBtn);

  // Inject into UI
  fileHeader.appendChild(container);

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
 * Register keyboard shortcuts
 */
function registerKeyboardShortcuts() {
  // Clear any existing shortcuts
  shortcutIds.forEach((id) => unregisterShortcut(id));
  shortcutIds = [];

  // Ctrl+Shift+R: Open reorder modal
  shortcutIds.push(
    registerShortcut({
      ...DEFAULT_SHORTCUTS.REORDER_MODAL,
      handler: () => {
        console.log('[PR-Reorder] Keyboard shortcut: Open reorder modal');
        handleReorderClick();
      },
      scope: 'global',
    })
  );

  // Ctrl+Shift+V: View all orders
  shortcutIds.push(
    registerShortcut({
      ...DEFAULT_SHORTCUTS.VIEW_ORDERS,
      handler: () => {
        console.log('[PR-Reorder] Keyboard shortcut: View orders');
        handleViewOrdersClick();
      },
      scope: 'global',
    })
  );

  // Ctrl+Shift+C: Apply consensus
  shortcutIds.push(
    registerShortcut({
      ...DEFAULT_SHORTCUTS.APPLY_CONSENSUS,
      handler: async () => {
        console.log('[PR-Reorder] Keyboard shortcut: Apply consensus');
        await applySavedOrder();
      },
      scope: 'global',
    })
  );

  // ?: Show keyboard shortcuts help
  shortcutIds.push(
    registerShortcut({
      ...DEFAULT_SHORTCUTS.HELP,
      handler: () => {
        console.log('[PR-Reorder] Keyboard shortcut: Show help');
        handleShowKeyboardHelp();
      },
      scope: 'global',
    })
  );

  console.log(
    '[PR-Reorder] Keyboard shortcuts registered:',
    shortcutIds.length
  );
}

/**
 * Handle show keyboard help
 */
function handleShowKeyboardHelp() {
  createKeyboardHelpModal({
    onClose: () => {
      console.log('[PR-Reorder] Keyboard help closed');
    },
  });
}

/**
 * Cleanup extension on navigation
 */
function cleanup() {
  // Unregister all shortcuts
  shortcutIds.forEach((id) => unregisterShortcut(id));
  shortcutIds = [];

  console.log('[PR-Reorder] Extension cleaned up');
}

/**
 * Observe for GitHub navigation events
 */
function observeNavigation() {
  // GitHub fires these events on navigation
  document.addEventListener('pjax:end', async () => {
    console.log('[PR-Reorder] Navigation detected, reinitializing...');
    cleanup();
    extensionLoaded = false;
    buttonsInjected = false;
    await init();
  });

  // Also watch for URL changes
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log(
        '[PR-Reorder] URL changed, checking if reinitialization needed...'
      );
      cleanup();
      extensionLoaded = false;
      buttonsInjected = false;
      setTimeout(init, 500);
    }
  }).observe(document.body, { childList: true, subtree: true });
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Start the extension
main().catch((error) => {
  console.error('[PR-Reorder] Fatal error:', error);
});
