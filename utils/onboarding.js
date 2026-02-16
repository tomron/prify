/**
 * Onboarding Tour Utilities
 * Manages first-time user experience and guided tour
 */

const TOUR_STORAGE_KEY = 'pr-reorder-tour-complete';

/**
 * Check if tour should be shown to user
 * @returns {Promise<boolean>} True if tour should be shown
 */
export async function shouldShowTour() {
  try {
    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    return !stored;
  } catch (error) {
    console.error('Failed to check tour status:', error);
    return false;
  }
}

/**
 * Mark tour as complete
 * @returns {Promise<void>}
 */
export async function markTourComplete() {
  try {
    const data = {
      completed: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to mark tour complete:', error);
  }
}

/**
 * Reset tour (for testing or user request)
 * @returns {Promise<void>}
 */
export async function resetTour() {
  try {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset tour:', error);
  }
}

/**
 * Get tour steps configuration
 * @returns {Array<Object>} Tour steps
 */
export function getTourSteps() {
  return [
    {
      title: 'Welcome to PR File Reorder!',
      content:
        "This extension helps you and your team organize file order in GitHub PRs for better code reviews. Let's take a quick tour!",
      target: null, // Center overlay
      placement: 'center',
    },
    {
      title: 'Drag Files to Reorder',
      content:
        'Click the "Reorder Files" button to open the modal, then drag and drop files to arrange them in the order that makes sense for reviewing.',
      target: '.pr-reorder-trigger-btn',
      placement: 'bottom',
    },
    {
      title: 'Use Quick Sort Presets',
      content:
        'Save time with preset sorting options like alphabetical, README first, or most changed first.',
      target: '.pr-reorder-preset-select',
      placement: 'bottom',
    },
    {
      title: 'Search for Files',
      content:
        'Working with many files? Use the search bar to quickly find what you need with fuzzy matching.',
      target: '.pr-reorder-search-input',
      placement: 'bottom',
    },
    {
      title: 'Collaborate with Your Team',
      content:
        "Your order is saved and shared with your team. View everyone's suggested orders and see the consensus!",
      target: '.pr-viewer-trigger-btn',
      placement: 'bottom',
    },
    {
      title: "You're All Set!",
      content:
        'Start reordering files to improve your code review experience. Need help? Check the documentation or contact support.',
      target: null,
      placement: 'center',
    },
  ];
}
