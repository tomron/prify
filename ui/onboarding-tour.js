/**
 * Onboarding Tour Component
 * Guided tour for first-time users
 */

import { getTourSteps, markTourComplete } from '../utils/onboarding.js';

/**
 * Create and show onboarding tour
 * @param {Object} options - Tour options
 * @param {Function} [options.onComplete] - Callback when tour is completed
 * @param {Function} [options.onSkip] - Callback when tour is skipped
 * @returns {Object} Tour instance
 */
export function createOnboardingTour(options = {}) {
  const { onComplete, onSkip } = options;

  const steps = getTourSteps();
  let currentStep = 0;

  // Create tour overlay
  const overlay = createTourOverlay();
  const modal = createTourModal();
  const content = document.createElement('div');
  content.className = 'pr-tour-content';

  modal.appendChild(content);
  overlay.appendChild(modal);

  // Render current step
  const renderStep = () => {
    const step = steps[currentStep];
    content.innerHTML = '';

    // Step header
    const header = document.createElement('div');
    header.className = 'pr-tour-header';

    const title = document.createElement('h2');
    title.className = 'pr-tour-title';
    title.textContent = step.title;

    const progress = document.createElement('div');
    progress.className = 'pr-tour-progress';
    progress.textContent = `${currentStep + 1} of ${steps.length}`;

    header.appendChild(title);
    header.appendChild(progress);

    // Step body
    const body = document.createElement('div');
    body.className = 'pr-tour-body';
    body.textContent = step.content;

    // Step footer
    const footer = document.createElement('div');
    footer.className = 'pr-tour-footer';

    // Skip button (only show on first steps)
    if (currentStep < steps.length - 1) {
      const skipBtn = document.createElement('button');
      skipBtn.className =
        'pr-reorder-btn pr-reorder-btn-tertiary pr-tour-skip-btn';
      skipBtn.textContent = 'Skip Tour';
      skipBtn.addEventListener('click', handleSkip);
      footer.appendChild(skipBtn);
    }

    // Navigation buttons
    const navButtons = document.createElement('div');
    navButtons.className = 'pr-tour-nav-buttons';

    if (currentStep > 0) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'pr-reorder-btn pr-reorder-btn-secondary';
      prevBtn.textContent = 'Previous';
      prevBtn.addEventListener('click', handlePrevious);
      navButtons.appendChild(prevBtn);
    }

    if (currentStep < steps.length - 1) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'pr-reorder-btn pr-reorder-btn-primary';
      nextBtn.textContent = 'Next';
      nextBtn.addEventListener('click', handleNext);
      navButtons.appendChild(nextBtn);
    } else {
      const doneBtn = document.createElement('button');
      doneBtn.className = 'pr-reorder-btn pr-reorder-btn-primary';
      doneBtn.textContent = 'Get Started';
      doneBtn.addEventListener('click', handleComplete);
      navButtons.appendChild(doneBtn);
    }

    footer.appendChild(navButtons);

    // Assemble step
    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(footer);

    // Highlight target element if specified
    highlightTarget(step.target);

    // Position modal if needed
    positionModal(modal, step.target, step.placement);
  };

  // Event handlers
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      renderStep();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      currentStep--;
      renderStep();
    }
  };

  const handleComplete = async () => {
    await markTourComplete();
    close();
    if (onComplete) onComplete();
  };

  const handleSkip = async () => {
    await markTourComplete();
    close();
    if (onSkip) onSkip();
  };

  const close = () => {
    overlay.remove();
    removeHighlights();
  };

  // Keyboard navigation
  const handleKeyboard = (e) => {
    if (e.key === 'Escape') {
      handleSkip();
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      if (currentStep < steps.length - 1) {
        handleNext();
      } else {
        handleComplete();
      }
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    }
  };

  document.addEventListener('keydown', handleKeyboard);

  // Cleanup on close
  const cleanup = () => {
    document.removeEventListener('keydown', handleKeyboard);
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      handleSkip();
      cleanup();
    }
  });

  // Initialize
  document.body.appendChild(overlay);
  renderStep();

  return {
    close: () => {
      close();
      cleanup();
    },
    next: handleNext,
    previous: handlePrevious,
    goToStep: (index) => {
      if (index >= 0 && index < steps.length) {
        currentStep = index;
        renderStep();
      }
    },
  };
}

/**
 * Create tour overlay
 * @returns {HTMLElement}
 */
function createTourOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'pr-tour-overlay';
  return overlay;
}

/**
 * Create tour modal
 * @returns {HTMLElement}
 */
function createTourModal() {
  const modal = document.createElement('div');
  modal.className = 'pr-tour-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'pr-tour-title');
  return modal;
}

/**
 * Highlight target element
 * @param {string} target - CSS selector for target element
 */
function highlightTarget(target) {
  removeHighlights();

  if (!target) return;

  const element = document.querySelector(target);
  if (element) {
    element.classList.add('pr-tour-highlight');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Remove highlights from all elements
 */
function removeHighlights() {
  document.querySelectorAll('.pr-tour-highlight').forEach((el) => {
    el.classList.remove('pr-tour-highlight');
  });
}

/**
 * Position modal relative to target
 * @param {HTMLElement} modal - Modal element
 * @param {string} target - CSS selector for target
 * @param {string} placement - Placement (top, bottom, left, right, center)
 */
function positionModal(modal, target, placement) {
  if (!target || placement === 'center') {
    // Center modal
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    return;
  }

  const element = document.querySelector(target);
  if (!element) {
    // Fallback to center if target not found
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    return;
  }

  const rect = element.getBoundingClientRect();
  modal.style.position = 'fixed';

  switch (placement) {
    case 'bottom':
      modal.style.top = `${rect.bottom + 10}px`;
      modal.style.left = `${rect.left}px`;
      modal.style.transform = 'none';
      break;
    case 'top':
      modal.style.bottom = `${window.innerHeight - rect.top + 10}px`;
      modal.style.left = `${rect.left}px`;
      modal.style.transform = 'none';
      break;
    case 'left':
      modal.style.top = `${rect.top}px`;
      modal.style.right = `${window.innerWidth - rect.left + 10}px`;
      modal.style.transform = 'none';
      break;
    case 'right':
      modal.style.top = `${rect.top}px`;
      modal.style.left = `${rect.right + 10}px`;
      modal.style.transform = 'none';
      break;
    default:
      // Center
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
  }
}
