/**
 * Main content script for PR File Reorder extension
 * Orchestrates all components to enable collaborative file ordering
 */

import {
  getCurrentOrder,
  reorderFiles,
  observeFileChanges,
  reapplySavedOrder,
  stopObserving,
} from './dom-manipulator.js';
import { createReorderModal } from '../ui/reorder-modal.js';
import { createOrderViewerModal } from '../ui/order-viewer.js';
import { saveOrder } from '../utils/storage.js';
import {
  getPRId,
  loadAllOrders,
  saveOrderEverywhere,
  isOnFilesTab,
} from './github-api.js';
import { calculateConsensus, getConsensusMetadata } from './consensus.js';
import { getCleanupManager, cleanup } from '../utils/cleanup-manager.js';
import { shouldShowTour } from '../utils/onboarding.js';
import { createOnboardingTour } from '../ui/onboarding-tour.js';

// Extension state
let extensionLoaded = false;
let buttonsInjected = false;
let currentConsensusOrder = null; // BUG-001: Store order for re-application

/**
 * Initialize extension on GitHub PR pages
 */
async function init() {
  // BUG-002: Clean up any previous initialization before reinitializing
  if (extensionLoaded) {
    cleanup();
    extensionLoaded = false;
    buttonsInjected = false;
    // BUG-001: Reset consensus order on cleanup
    currentConsensusOrder = null;
    stopObserving();
  }

  // Verify we're on a PR page
  const prId = getPRId();
  if (!prId) {
    return;
  }

  // Check if we're on the Files tab
  if (!isOnFilesTab()) {
    return;
  }

  // Inject buttons
  injectButtons();

  // Load and apply saved order (BUG-001: also sets up dynamic file observer)
  await applySavedOrder();

  // Mark as loaded
  extensionLoaded = true;
  document.documentElement.setAttribute('data-pr-reorder', 'loaded');

  // Show onboarding tour for first-time users
  initializeOnboarding();
}

/**
 * Initialize onboarding tour for first-time users
 */
async function initializeOnboarding() {
  try {
    const showTour = await shouldShowTour();
    if (showTour) {
      // Wait a bit for UI to settle before showing tour
      setTimeout(() => {
        createOnboardingTour({
          onComplete: () => {},
          onSkip: () => {},
        });
      }, 1000);
    }
  } catch (error) {
    console.error('[PR-Reorder] Failed to initialize onboarding:', error);
  }
}

/**
 * Inject reorder and view buttons into GitHub UI
 */
function injectButtons() {
  if (buttonsInjected) return;

  // First, check if files have actually loaded
  // Try multiple selectors as GitHub changes attributes frequently
  const fileSelectors = [
    '[data-path]', // Old GitHub
    '[data-file-path]', // New GitHub
    '[id^="diff-"]', // Diff containers
  ];

  let filesExist = false;

  for (const selector of fileSelectors) {
    const count = document.querySelectorAll(selector).length;
    if (count > 0) {
      filesExist = true;
      break;
    }
  }

  if (!filesExist) {
    const manager = getCleanupManager();
    manager.trackTimeout(injectButtons, 500);
    return;
  }

  // Find the file header (where "Files changed" is)
  // Try multiple selectors for GitHub's evolving DOM structure
  const selectors = [
    '.pr-review-tools', // Old GitHub
    '#files_bucket .file-header[data-file-type]', // New GitHub (near first file)
    '#files .diffbar', // Alternative location
    '.diff-view .file-actions', // Another alternative
    '#files', // Fallback - just find the files container
    '[data-hpc]', // New GitHub structure (Primer React Components)
    'turbo-frame[id*="repo-content"]', // Turbo frame container
  ];

  let fileHeader = null;
  let usedFallback = false;

  for (let i = 0; i < selectors.length; i++) {
    const element = document.querySelector(selectors[i]);
    if (element) {
      fileHeader = element;
      if (i > 0) {
        usedFallback = true;
      }
      break;
    }
  }

  if (!fileHeader) {
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

  // Inject into UI - use different strategies based on where we found the header
  if (
    usedFallback &&
    (fileHeader.id === 'files' ||
      fileHeader.hasAttribute('data-hpc') ||
      fileHeader.tagName === 'TURBO-FRAME')
  ) {
    // If injecting into container (not a proper header), prepend with better styling
    container.style.cssText =
      'display: flex; gap: 8px; padding: 16px; border-bottom: 1px solid #d0d7de; background: #f6f8fa; position: sticky; top: 0; z-index: 100;';
    fileHeader.insertBefore(container, fileHeader.firstChild);
  } else {
    // Normal injection for proper header locations
    fileHeader.appendChild(container);
  }

  // BUG-002: Track injected element
  manager.trackElement(container);

  buttonsInjected = true;
}

/**
 * Handle Reorder button click
 */
function handleReorderClick() {
  const currentOrder = getCurrentOrder();

  createReorderModal({
    initialOrder: currentOrder,
    onSave: async (newOrder) => {
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
    },
    onCancel: () => {},
  });
}

/**
 * Handle View Orders button click
 */
async function handleViewOrdersClick() {
  try {
    // Load all orders
    const orders = await loadAllOrders();

    // Calculate consensus
    const consensus = calculateConsensus(orders, { excludeOutliers: false });
    const metadata = getConsensusMetadata(orders, consensus);

    // Show modal
    createOrderViewerModal({
      orders,
      consensus,
      metadata,
      onSelectOrder: (order) => {
        reorderFiles(order);
      },
      onClose: () => {},
    });
  } catch (error) {
    console.error('[PR-Reorder] Failed to load orders:', error);
    alert('Failed to load orders. Please try again.');
  }
}

/**
 * Apply saved order from storage
 * BUG-001: Also sets up observer for dynamic file loading
 */
async function applySavedOrder() {
  const prId = getPRId();
  if (!prId) return;

  try {
    // Load all orders and calculate consensus
    const orders = await loadAllOrders();

    if (orders.length === 0) {
      return;
    }

    // Calculate consensus
    const consensus = calculateConsensus(orders, { excludeOutliers: false });

    if (consensus.length > 0) {
      reorderFiles(consensus);

      // BUG-001: Store consensus for re-application when files load dynamically
      currentConsensusOrder = consensus;

      // BUG-001: Set up observer for dynamic file loading
      setupDynamicFileObserver();
    }
  } catch (error) {
    console.error('[PR-Reorder] Failed to apply saved order:', error);
  }
}

/**
 * Setup observer for GitHub's dynamic file loading
 * BUG-001: Re-applies order when new files are loaded
 */
function setupDynamicFileObserver() {
  const manager = getCleanupManager();

  // Stop any existing observer first
  stopObserving();

  // Create new observer
  const observer = observeFileChanges(() => {
    if (currentConsensusOrder && currentConsensusOrder.length > 0) {
      reapplySavedOrder(currentConsensusOrder);
    }
  }, 500); // 500ms debounce for dynamic loading

  // BUG-001: Track observer for cleanup (BUG-002 integration)
  if (observer) {
    manager.trackObserver(observer);
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
  // Wait for page to load
  await waitForPageLoad();

  // Check if we're on a PR page
  const prId = getPRId();
  if (!prId) {
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
