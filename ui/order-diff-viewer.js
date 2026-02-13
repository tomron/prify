/**
 * Order Diff Viewer UI
 * Visual diff between two file orders
 */

import {
  calculateOrderDiff,
  formatPositionChange,
  getDiffStats,
} from '../utils/order-diff.js';

/**
 * Create order diff viewer modal
 * @param {Object} options - Diff viewer options
 * @param {Array<string>} options.orderA - First order (baseline)
 * @param {Array<string>} options.orderB - Second order (comparison)
 * @param {string} [options.labelA='Order A'] - Label for first order
 * @param {string} [options.labelB='Order B'] - Label for second order
 * @param {Function} [options.onClose] - Callback when modal closes
 * @returns {Object} Modal instance
 */
export function createOrderDiffModal(options = {}) {
  const {
    orderA,
    orderB,
    labelA = 'Order A',
    labelB = 'Order B',
    onClose,
  } = options;

  // Calculate diff
  const diff = calculateOrderDiff(orderA, orderB);
  const stats = getDiffStats(diff);

  // Create modal structure
  const overlay = createModalOverlay();
  const modal = createModalDialog();
  const header = createModalHeader(labelA, labelB);
  const body = createModalBody();
  const footer = createModalFooter();

  // Create content sections
  const statsSection = createStatsSection(stats);
  const diffSection = createDiffSection(diff);

  // Assemble modal
  body.appendChild(statsSection);
  body.appendChild(diffSection);
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);

  // Setup event handlers
  const closeBtn = header.querySelector('.pr-reorder-modal-close');
  const doneBtn = footer.querySelector('[data-action="done"]');

  const close = () => {
    overlay.remove();
    if (onClose) onClose();
  };

  closeBtn.addEventListener('click', close);
  doneBtn.addEventListener('click', close);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Append to document
  document.body.appendChild(overlay);

  return {
    element: overlay,
    close,
  };
}

/**
 * Create modal overlay
 */
function createModalOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'pr-reorder-modal-overlay';
  return overlay;
}

/**
 * Create modal dialog
 */
function createModalDialog() {
  const modal = document.createElement('div');
  modal.className = 'pr-reorder-modal pr-reorder-diff-modal';
  return modal;
}

/**
 * Create modal header
 */
function createModalHeader(labelA, labelB) {
  const header = document.createElement('div');
  header.className = 'pr-reorder-modal-header';

  const title = document.createElement('h2');
  title.className = 'pr-reorder-modal-title';
  title.textContent = 'Order Comparison';

  const subtitle = document.createElement('div');
  subtitle.className = 'pr-reorder-diff-labels';

  const labelAEl = document.createElement('span');
  labelAEl.className = 'pr-reorder-diff-label pr-reorder-diff-label-a';
  labelAEl.textContent = labelA;

  const vs = document.createElement('span');
  vs.className = 'pr-reorder-diff-vs';
  vs.textContent = 'vs';

  const labelBEl = document.createElement('span');
  labelBEl.className = 'pr-reorder-diff-label pr-reorder-diff-label-b';
  labelBEl.textContent = labelB;

  subtitle.appendChild(labelAEl);
  subtitle.appendChild(vs);
  subtitle.appendChild(labelBEl);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'pr-reorder-modal-close';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close');

  header.appendChild(title);
  header.appendChild(subtitle);
  header.appendChild(closeBtn);

  return header;
}

/**
 * Create modal body
 */
function createModalBody() {
  const body = document.createElement('div');
  body.className = 'pr-reorder-modal-body pr-reorder-diff-body';
  return body;
}

/**
 * Create modal footer
 */
function createModalFooter() {
  const footer = document.createElement('div');
  footer.className = 'pr-reorder-modal-footer';

  const doneBtn = document.createElement('button');
  doneBtn.className = 'pr-reorder-btn pr-reorder-btn-primary';
  doneBtn.textContent = 'Done';
  doneBtn.setAttribute('data-action', 'done');

  footer.appendChild(doneBtn);

  return footer;
}

/**
 * Create stats section
 */
function createStatsSection(stats) {
  const section = document.createElement('div');
  section.className = 'pr-reorder-diff-stats';

  const items = [
    {
      label: 'Unchanged',
      value: stats.unchanged,
      className: 'unchanged',
    },
    { label: 'Moved Up', value: stats.movedUp, className: 'moved-up' },
    {
      label: 'Moved Down',
      value: stats.movedDown,
      className: 'moved-down',
    },
    { label: 'Added', value: stats.added, className: 'added' },
    { label: 'Removed', value: stats.removed, className: 'removed' },
  ];

  items.forEach((item) => {
    if (item.value === 0) return; // Skip zero counts

    const statItem = document.createElement('div');
    statItem.className = `pr-reorder-diff-stat pr-reorder-diff-stat-${item.className}`;

    const value = document.createElement('div');
    value.className = 'pr-reorder-diff-stat-value';
    value.textContent = item.value;

    const label = document.createElement('div');
    label.className = 'pr-reorder-diff-stat-label';
    label.textContent = item.label;

    statItem.appendChild(value);
    statItem.appendChild(label);
    section.appendChild(statItem);
  });

  return section;
}

/**
 * Create diff section
 */
function createDiffSection(diff) {
  const section = document.createElement('div');
  section.className = 'pr-reorder-diff-list';

  diff.forEach((entry) => {
    const item = createDiffItem(entry);
    section.appendChild(item);
  });

  return section;
}

/**
 * Create diff item
 */
function createDiffItem(entry) {
  const item = document.createElement('div');
  item.className = `pr-reorder-diff-item pr-reorder-diff-item-${entry.category}`;

  // File name
  const fileName = document.createElement('div');
  fileName.className = 'pr-reorder-diff-file';
  fileName.textContent = entry.file;

  // Position change
  const change = document.createElement('div');
  change.className = 'pr-reorder-diff-change';

  if (entry.category === 'added') {
    change.textContent = 'Added';
  } else if (entry.category === 'removed') {
    change.textContent = 'Removed';
  } else {
    change.textContent = formatPositionChange(entry.change);
  }

  // Position indicators
  const positions = document.createElement('div');
  positions.className = 'pr-reorder-diff-positions';

  const posA = document.createElement('span');
  posA.className = 'pr-reorder-diff-pos-a';
  posA.textContent = entry.fromIndex === -1 ? '—' : `#${entry.fromIndex + 1}`;

  const arrow = document.createElement('span');
  arrow.className = 'pr-reorder-diff-arrow';
  arrow.textContent = '→';

  const posB = document.createElement('span');
  posB.className = 'pr-reorder-diff-pos-b';
  posB.textContent = entry.toIndex === -1 ? '—' : `#${entry.toIndex + 1}`;

  positions.appendChild(posA);
  positions.appendChild(arrow);
  positions.appendChild(posB);

  item.appendChild(fileName);
  item.appendChild(change);
  item.appendChild(positions);

  return item;
}
