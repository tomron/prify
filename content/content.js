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
import {
  saveToHistory,
  undo,
  redo,
  canUndo,
  canRedo,
  clearHistory,
} from '../utils/history.js';

// Extension state
let extensionLoaded = false;
let buttonsInjected = false;

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

  // Set up keyboard shortcuts
  setupKeyboardShortcuts();

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

  // Create Undo button
  const undoBtn = document.createElement('button');
  undoBtn.className = 'btn btn-sm pr-reorder-undo-btn';
  undoBtn.textContent = '↶ Undo';
  undoBtn.title = 'Undo last reorder (Ctrl+Z)';
  undoBtn.disabled = true;
  undoBtn.addEventListener('click', handleUndo);

  // Create Redo button
  const redoBtn = document.createElement('button');
  redoBtn.className = 'btn btn-sm pr-reorder-redo-btn';
  redoBtn.textContent = '↷ Redo';
  redoBtn.title = 'Redo last undone reorder (Ctrl+Y)';
  redoBtn.disabled = true;
  redoBtn.addEventListener('click', handleRedo);

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

  container.appendChild(undoBtn);
  container.appendChild(redoBtn);
  container.appendChild(reorderBtn);
  container.appendChild(viewBtn);

  // Inject into UI
  fileHeader.appendChild(container);

  buttonsInjected = true;
  console.log('[PR-Reorder] Buttons injected');

  // Update button states
  updateUndoRedoButtons();
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

        // Save to history for undo/redo
        await saveToHistory(prId, newOrder);

        // Update button states
        await updateUndoRedoButtons();

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
 * Update undo/redo button states
 */
async function updateUndoRedoButtons() {
  const prId = getPRId();
  if (!prId) return;

  try {
    const undoAvailable = await canUndo(prId);
    const redoAvailable = await canRedo(prId);

    const undoBtn = document.querySelector('.pr-reorder-undo-btn');
    const redoBtn = document.querySelector('.pr-reorder-redo-btn');

    if (undoBtn) {
      undoBtn.disabled = !undoAvailable;
    }

    if (redoBtn) {
      redoBtn.disabled = !redoAvailable;
    }
  } catch (error) {
    console.error('[PR-Reorder] Failed to update button states:', error);
  }
}

/**
 * Handle undo action
 */
async function handleUndo() {
  const prId = getPRId();
  if (!prId) return;

  try {
    const previousOrder = await undo(prId);
    if (previousOrder) {
      console.log('[PR-Reorder] Undoing to previous order');
      reorderFiles(previousOrder);
      await saveOrder(prId, previousOrder);
      await updateUndoRedoButtons();
    } else {
      console.log('[PR-Reorder] Nothing to undo');
    }
  } catch (error) {
    console.error('[PR-Reorder] Failed to undo:', error);
  }
}

/**
 * Handle redo action
 */
async function handleRedo() {
  const prId = getPRId();
  if (!prId) return;

  try {
    const nextOrder = await redo(prId);
    if (nextOrder) {
      console.log('[PR-Reorder] Redoing to next order');
      reorderFiles(nextOrder);
      await saveOrder(prId, nextOrder);
      await updateUndoRedoButtons();
    } else {
      console.log('[PR-Reorder] Nothing to redo');
    }
  } catch (error) {
    console.error('[PR-Reorder] Failed to redo:', error);
  }
}

/**
 * Set up keyboard shortcuts for undo/redo
 */
function setupKeyboardShortcuts() {
  // Prevent duplicate listeners
  document.removeEventListener('keydown', handleKeyboardShortcut);
  document.addEventListener('keydown', handleKeyboardShortcut);
}

/**
 * Handle keyboard shortcut events
 */
function handleKeyboardShortcut(event) {
  // Check if we're on a PR page
  if (!getPRId()) return;

  // Check if user is typing in an input field
  const target = event.target;
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    return;
  }

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? event.metaKey : event.ctrlKey;

  // Ctrl+Z / Cmd+Z - Undo
  if (modKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault();
    handleUndo();
  }

  // Ctrl+Y / Cmd+Shift+Z - Redo
  if (
    (modKey && event.key === 'y' && !isMac) ||
    (modKey && event.key === 'z' && event.shiftKey && isMac)
  ) {
    event.preventDefault();
    handleRedo();
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
 */
function observeNavigation() {
  let lastPrId = getPRId();

  // GitHub fires these events on navigation
  document.addEventListener('pjax:end', async () => {
    console.log('[PR-Reorder] Navigation detected, reinitializing...');
    const currentPrId = getPRId();

    // Clear history if navigating to a different PR
    if (currentPrId && currentPrId !== lastPrId) {
      console.log('[PR-Reorder] New PR detected, clearing history');
      await clearHistory(lastPrId);
      lastPrId = currentPrId;
    }

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
      const currentPrId = getPRId();

      console.log(
        '[PR-Reorder] URL changed, checking if reinitialization needed...'
      );

      // Clear history if navigating to a different PR
      if (currentPrId && currentPrId !== lastPrId) {
        console.log('[PR-Reorder] New PR detected, clearing history');
        clearHistory(lastPrId);
        lastPrId = currentPrId;
      }

      extensionLoaded = false;
      buttonsInjected = false;
      setTimeout(init, 500);
    }
  }).observe(document.body, { childList: true, subtree: true });
}

// Start the extension
main().catch((error) => {
  console.error('[PR-Reorder] Fatal error:', error);
});
