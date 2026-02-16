/**
 * Order Viewer Modal
 * Display all user orders, consensus, and agreement metrics
 */

import {
  calculateOrderDiff,
  formatPositionChange,
} from '../utils/order-diff.js';

/**
 * Create and show order viewer modal
 * @param {Object} options - Modal options
 * @param {Array<Object>} options.orders - All user orders
 * @param {Array<string>} options.consensus - Consensus order
 * @param {Object} options.metadata - Consensus metadata
 * @param {Function} [options.onClose] - Callback when modal closes
 * @param {Function} [options.onSelectOrder] - Callback when user selects an order to apply
 * @returns {Object} Modal instance
 */
export function createOrderViewerModal(options = {}) {
  const { orders, consensus, metadata, onClose, onSelectOrder } = options;

  // Create modal structure
  const overlay = createModalOverlay();
  const modal = createModalDialog();
  const header = createModalHeader();
  const body = createModalBody();
  const footer = createModalFooter();

  // Create sections
  const consensusSection = createConsensusSection(consensus, metadata);
  const ordersSection = createOrdersSection(orders, onSelectOrder);

  // Assemble modal
  body.appendChild(consensusSection);
  body.appendChild(ordersSection);
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
    if (e.target === overlay) {
      close();
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Add to DOM
  document.body.appendChild(overlay);

  return {
    close,
  };
}

/**
 * Create modal overlay
 * @returns {HTMLElement}
 */
function createModalOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'pr-reorder-modal-overlay';
  return overlay;
}

/**
 * Create modal dialog
 * @returns {HTMLElement}
 */
function createModalDialog() {
  const modal = document.createElement('div');
  modal.className = 'pr-reorder-modal pr-reorder-viewer-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'pr-viewer-modal-title');
  return modal;
}

/**
 * Create modal header
 * @returns {HTMLElement}
 */
function createModalHeader() {
  const header = document.createElement('div');
  header.className = 'pr-reorder-modal-header';

  const title = document.createElement('h2');
  title.id = 'pr-viewer-modal-title';
  title.className = 'pr-reorder-modal-title';
  title.textContent = 'File Order Consensus';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'pr-reorder-modal-close';
  closeBtn.setAttribute('aria-label', 'Close modal');

  // SECURITY: innerHTML used only for static SVG icons (safe)
  closeBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
    </svg>
  `;

  header.appendChild(title);
  header.appendChild(closeBtn);

  return header;
}

/**
 * Create modal body
 * @returns {HTMLElement}
 */
function createModalBody() {
  const body = document.createElement('div');
  body.className = 'pr-reorder-modal-body pr-reorder-viewer-body';
  return body;
}

/**
 * Create modal footer
 * @returns {HTMLElement}
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
 * Create consensus section
 * @param {Array<string>} consensus - Consensus order
 * @param {Object} metadata - Consensus metadata
 * @returns {HTMLElement}
 */
function createConsensusSection(consensus, metadata) {
  const section = document.createElement('div');
  section.className = 'pr-viewer-section';

  // Section header
  const header = document.createElement('div');
  header.className = 'pr-viewer-section-header';

  const title = document.createElement('h3');
  title.className = 'pr-viewer-section-title';
  title.textContent = 'Consensus Order';

  const stats = document.createElement('div');
  stats.className = 'pr-viewer-stats';

  // Participant count
  const participants = document.createElement('span');
  participants.className = 'pr-viewer-stat';
  // SECURITY: Using textContent for dynamic data
  participants.textContent = `${metadata.participantCount} participant${
    metadata.participantCount !== 1 ? 's' : ''
  }`;

  // Agreement score
  const agreement = document.createElement('span');
  agreement.className = 'pr-viewer-stat';
  const agreementPercent = Math.round(metadata.agreementScore * 100);
  agreement.textContent = `${agreementPercent}% agreement`;

  if (agreementPercent >= 80) {
    agreement.classList.add('pr-viewer-stat-success');
  } else if (agreementPercent >= 60) {
    agreement.classList.add('pr-viewer-stat-warning');
  } else {
    agreement.classList.add('pr-viewer-stat-danger');
  }

  stats.appendChild(participants);
  stats.appendChild(agreement);
  header.appendChild(title);
  header.appendChild(stats);
  section.appendChild(header);

  // Consensus file list
  const fileList = document.createElement('div');
  fileList.className = 'pr-viewer-file-list pr-viewer-consensus-list';

  if (consensus.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'pr-viewer-empty';
    empty.textContent = 'No consensus yet. Be the first to create an order!';
    fileList.appendChild(empty);
  } else {
    consensus.forEach((file, index) => {
      const item = createConsensusFileItem(file, index, metadata.conflicts);
      fileList.appendChild(item);
    });
  }

  section.appendChild(fileList);

  // Conflicts section
  if (metadata.conflicts && metadata.conflicts.length > 0) {
    const conflictsHeader = document.createElement('h4');
    conflictsHeader.className = 'pr-viewer-subsection-title';
    conflictsHeader.textContent = 'Controversial Files';

    const conflictsList = document.createElement('div');
    conflictsList.className = 'pr-viewer-conflicts-list';

    metadata.conflicts.slice(0, 5).forEach((conflict) => {
      const item = createConflictItem(conflict);
      conflictsList.appendChild(item);
    });

    section.appendChild(conflictsHeader);
    section.appendChild(conflictsList);
  }

  return section;
}

/**
 * Create consensus file item
 * @param {string} file - File path
 * @param {number} index - Position
 * @param {Array<Object>} conflicts - Conflict data
 * @returns {HTMLElement}
 */
function createConsensusFileItem(file, index, conflicts) {
  const item = document.createElement('div');
  item.className = 'pr-viewer-file-item';

  // Check if file is controversial
  const conflict = conflicts.find((c) => c.file === file);
  if (conflict) {
    item.classList.add('pr-viewer-file-item-conflict');
  }

  const position = document.createElement('span');
  position.className = 'pr-viewer-file-position';
  position.textContent = `${index + 1}`;

  const path = document.createElement('span');
  path.className = 'pr-viewer-file-path';
  // SECURITY: Using textContent for file paths
  path.textContent = file;

  item.appendChild(position);
  item.appendChild(path);

  if (conflict) {
    const badge = document.createElement('span');
    badge.className = 'pr-reorder-badge pr-reorder-badge-warning';
    badge.textContent = 'Controversial';
    badge.title = `High position variance (σ=${conflict.standardDeviation.toFixed(1)})`;
    item.appendChild(badge);
  }

  return item;
}

/**
 * Create conflict item
 * @param {Object} conflict - Conflict data
 * @returns {HTMLElement}
 */
function createConflictItem(conflict) {
  const item = document.createElement('div');
  item.className = 'pr-viewer-conflict-item';

  const fileName = document.createElement('span');
  fileName.className = 'pr-viewer-conflict-file';
  // SECURITY: Using textContent for file paths
  fileName.textContent = conflict.file;

  const positions = document.createElement('span');
  positions.className = 'pr-viewer-conflict-positions';
  positions.textContent = `Positions: ${conflict.positions.join(', ')}`;

  const stdDev = document.createElement('span');
  stdDev.className = 'pr-viewer-conflict-stddev';
  stdDev.textContent = `σ=${conflict.standardDeviation.toFixed(1)}`;

  item.appendChild(fileName);
  item.appendChild(positions);
  item.appendChild(stdDev);

  return item;
}

/**
 * Create orders section
 * @param {Array<Object>} orders - User orders
 * @param {Function} [onSelectOrder] - Callback when order selected
 * @returns {HTMLElement}
 */
function createOrdersSection(orders, onSelectOrder) {
  const section = document.createElement('div');
  section.className = 'pr-viewer-section';

  const header = document.createElement('h3');
  header.className = 'pr-viewer-section-title';
  header.textContent = 'Individual Orders';

  section.appendChild(header);

  if (orders.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'pr-viewer-empty';
    empty.textContent = 'No orders yet.';
    section.appendChild(empty);
    return section;
  }

  // Sort orders by timestamp (most recent first)
  const sortedOrders = [...orders].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
  });

  sortedOrders.forEach((order) => {
    const orderCard = createOrderCard(order, sortedOrders, onSelectOrder);
    section.appendChild(orderCard);
  });

  return section;
}

/**
 * Create order card
 * @param {Object} order - Order data
 * @param {Array<Object>} allOrders - All orders (for comparison)
 * @param {Function} [onSelectOrder] - Callback when order selected
 * @returns {HTMLElement}
 */
function createOrderCard(order, allOrders, onSelectOrder) {
  const card = document.createElement('div');
  card.className = 'pr-viewer-order-card';

  // Card header
  const cardHeader = document.createElement('div');
  cardHeader.className = 'pr-viewer-order-header';

  const user = document.createElement('span');
  user.className = 'pr-viewer-order-user';
  // SECURITY: Using textContent for username
  user.textContent = order.user || 'Unknown';

  const timestamp = document.createElement('span');
  timestamp.className = 'pr-viewer-order-timestamp';
  if (order.timestamp) {
    const date = new Date(order.timestamp);
    timestamp.textContent = formatTimestamp(date);
  }

  cardHeader.appendChild(user);
  cardHeader.appendChild(timestamp);

  // Source badge
  if (order.source === 'local') {
    const badge = document.createElement('span');
    badge.className = 'pr-reorder-badge';
    badge.textContent = 'Local';
    badge.title = 'Not yet posted to GitHub';
    cardHeader.appendChild(badge);
  }

  card.appendChild(cardHeader);

  // File list preview (first 5 files)
  const fileList = document.createElement('div');
  fileList.className = 'pr-viewer-file-list pr-viewer-order-files';

  const preview = order.order.slice(0, 5);
  preview.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'pr-viewer-file-item pr-viewer-file-item-compact';

    const position = document.createElement('span');
    position.className = 'pr-viewer-file-position';
    position.textContent = `${index + 1}`;

    const path = document.createElement('span');
    path.className = 'pr-viewer-file-path';
    // SECURITY: Using textContent for file paths
    path.textContent = file;

    item.appendChild(position);
    item.appendChild(path);
    fileList.appendChild(item);
  });

  if (order.order.length > 5) {
    const more = document.createElement('div');
    more.className = 'pr-viewer-file-item pr-viewer-more';
    more.textContent = `+ ${order.order.length - 5} more files`;
    fileList.appendChild(more);
  }

  card.appendChild(fileList);

  // Buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'pr-viewer-card-buttons';

  // Apply button
  if (onSelectOrder) {
    const applyBtn = document.createElement('button');
    applyBtn.className =
      'pr-reorder-btn pr-reorder-btn-secondary pr-viewer-apply-btn';
    applyBtn.textContent = 'Apply This Order';
    applyBtn.addEventListener('click', () => {
      onSelectOrder(order.order);
    });
    buttonsContainer.appendChild(applyBtn);
  }

  // Compare button (if there are other orders)
  if (allOrders && allOrders.length > 1) {
    const compareBtn = document.createElement('button');
    compareBtn.className =
      'pr-reorder-btn pr-reorder-btn-tertiary pr-viewer-compare-btn';
    compareBtn.textContent = 'Compare...';
    compareBtn.addEventListener('click', () => {
      showCompareMenu(order, allOrders);
    });
    buttonsContainer.appendChild(compareBtn);
  }

  card.appendChild(buttonsContainer);

  return card;
}

/**
 * Format timestamp for display
 * @param {Date} date - Date object
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60)
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}

/**
 * Show compare menu to select which order to compare with
 * @param {Object} currentOrder - Current order to compare
 * @param {Array<Object>} allOrders - All available orders
 */
function showCompareMenu(currentOrder, allOrders) {
  // Filter out the current order
  const otherOrders = allOrders.filter((o) => o !== currentOrder);

  if (otherOrders.length === 0) {
    return;
  }

  // Create dropdown menu
  const menu = document.createElement('div');
  menu.className = 'pr-compare-menu';

  const title = document.createElement('div');
  title.className = 'pr-compare-menu-title';
  title.textContent = 'Compare with:';
  menu.appendChild(title);

  otherOrders.forEach((otherOrder) => {
    const item = document.createElement('button');
    item.className = 'pr-compare-menu-item';

    const user = document.createElement('span');
    user.className = 'pr-compare-menu-user';
    user.textContent = otherOrder.user || 'Unknown';

    const timestamp = document.createElement('span');
    timestamp.className = 'pr-compare-menu-timestamp';
    if (otherOrder.timestamp) {
      const date = new Date(otherOrder.timestamp);
      timestamp.textContent = formatTimestamp(date);
    }

    item.appendChild(user);
    item.appendChild(timestamp);

    item.addEventListener('click', () => {
      menu.remove();
      createDiffViewerModal({
        orderA: currentOrder.order,
        orderB: otherOrder.order,
        titleA: currentOrder.user || 'Unknown',
        titleB: otherOrder.user || 'Unknown',
      });
    });

    menu.appendChild(item);
  });

  // Position near the button that triggered it
  document.body.appendChild(menu);

  // Close menu on outside click
  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => document.addEventListener('click', closeMenu), 0);
}

/**
 * Create diff visualization modal
 * @param {Object} options - Modal options
 * @param {Array<string>} options.orderA - First order
 * @param {Array<string>} options.orderB - Second order
 * @param {string} options.titleA - Title for order A
 * @param {string} options.titleB - Title for order B
 * @param {Function} [options.onClose] - Callback when modal closes
 * @returns {Object} Modal instance
 */
export function createDiffViewerModal(options = {}) {
  const {
    orderA,
    orderB,
    titleA = 'Order A',
    titleB = 'Order B',
    onClose,
  } = options;

  // Calculate diff
  const diff = calculateOrderDiff(orderA, orderB);

  // Create modal structure
  const overlay = createModalOverlay();
  const modal = createModalDialog();
  modal.classList.add('pr-reorder-diff-modal');

  const header = createDiffModalHeader(titleA, titleB, diff);
  const body = createDiffModalBody(orderA, orderB, diff);
  const footer = createModalFooter();

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);

  // Setup close handlers
  const closeBtn = header.querySelector('.pr-reorder-modal-close');
  const doneBtn = footer.querySelector('[data-action="done"]');

  const close = () => {
    overlay.remove();
    if (onClose) onClose();
  };

  closeBtn.addEventListener('click', close);
  doneBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  document.body.appendChild(overlay);

  return { close };
}

/**
 * Create diff modal header
 * @param {string} titleA - Title for order A
 * @param {string} titleB - Title for order B
 * @param {Object} diff - Diff calculation result
 * @returns {HTMLElement}
 */
function createDiffModalHeader(titleA, titleB, diff) {
  const header = document.createElement('div');
  header.className = 'pr-reorder-modal-header';

  const title = document.createElement('h2');
  title.id = 'pr-viewer-modal-title';
  title.className = 'pr-reorder-modal-title';
  title.textContent = 'Order Comparison';

  const subtitle = document.createElement('div');
  subtitle.className = 'pr-reorder-modal-subtitle';
  subtitle.textContent = `${titleA} vs ${titleB}`;

  const similarity = document.createElement('div');
  similarity.className = 'pr-diff-similarity-badge';
  similarity.textContent = `${diff.similarityScore}% similar`;

  // Color code similarity
  if (diff.similarityScore >= 80) {
    similarity.classList.add('pr-diff-similarity-high');
  } else if (diff.similarityScore >= 50) {
    similarity.classList.add('pr-diff-similarity-medium');
  } else {
    similarity.classList.add('pr-diff-similarity-low');
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = 'pr-reorder-modal-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '&times;';

  header.appendChild(title);
  header.appendChild(subtitle);
  header.appendChild(similarity);
  header.appendChild(closeBtn);

  return header;
}

/**
 * Create diff modal body
 * @param {Array<string>} orderA - First order
 * @param {Array<string>} orderB - Second order
 * @param {Object} diff - Diff calculation result
 * @returns {HTMLElement}
 */
function createDiffModalBody(orderA, orderB, diff) {
  const body = document.createElement('div');
  body.className = 'pr-reorder-modal-body pr-diff-modal-body';

  // Summary section
  const summary = createDiffSummary(diff);
  body.appendChild(summary);

  // Side-by-side comparison
  const comparison = createSideBySideComparison(orderA, orderB, diff);
  body.appendChild(comparison);

  return body;
}

/**
 * Create diff summary section
 * @param {Object} diff - Diff calculation result
 * @returns {HTMLElement}
 */
function createDiffSummary(diff) {
  const summary = document.createElement('div');
  summary.className = 'pr-diff-summary';

  const stats = [
    {
      label: 'Unchanged',
      value: diff.unchanged.length,
      className: 'unchanged',
    },
    { label: 'Moved', value: diff.moved.length, className: 'moved' },
    { label: 'Added', value: diff.addedInB.length, className: 'added' },
    { label: 'Removed', value: diff.removedFromB.length, className: 'removed' },
  ];

  stats.forEach((stat) => {
    const item = document.createElement('div');
    item.className = `pr-diff-stat pr-diff-stat-${stat.className}`;

    const value = document.createElement('span');
    value.className = 'pr-diff-stat-value';
    value.textContent = stat.value;

    const label = document.createElement('span');
    label.className = 'pr-diff-stat-label';
    label.textContent = stat.label;

    item.appendChild(value);
    item.appendChild(label);
    summary.appendChild(item);
  });

  return summary;
}

/**
 * Create side-by-side comparison
 * @param {Array<string>} orderA - First order
 * @param {Array<string>} orderB - Second order
 * @param {Object} diff - Diff calculation result
 * @returns {HTMLElement}
 */
function createSideBySideComparison(orderA, orderB, diff) {
  const container = document.createElement('div');
  container.className = 'pr-diff-comparison';

  const columnA = createDiffColumn(orderA, 'A', diff, true);
  const columnB = createDiffColumn(orderB, 'B', diff, false);

  container.appendChild(columnA);
  container.appendChild(columnB);

  return container;
}

/**
 * Create diff column
 * @param {Array<string>} order - File order
 * @param {string} label - Column label
 * @param {Object} diff - Diff calculation result
 * @param {boolean} isOrderA - Whether this is order A
 * @returns {HTMLElement}
 */
function createDiffColumn(order, label, diff, isOrderA) {
  const column = document.createElement('div');
  column.className = 'pr-diff-column';

  const header = document.createElement('div');
  header.className = 'pr-diff-column-header';
  header.textContent = `Order ${label}`;
  column.appendChild(header);

  const fileList = document.createElement('div');
  fileList.className = 'pr-diff-file-list';

  order.forEach((file, index) => {
    const item = createDiffFileItem(file, index, diff, isOrderA);
    fileList.appendChild(item);
  });

  column.appendChild(fileList);

  return column;
}

/**
 * Create diff file item
 * @param {string} file - File path
 * @param {number} index - Position in order
 * @param {Object} diff - Diff calculation result
 * @param {boolean} isOrderA - Whether this is order A
 * @returns {HTMLElement}
 */
function createDiffFileItem(file, index, diff, isOrderA) {
  const item = document.createElement('div');
  item.className = 'pr-diff-file-item';

  // Determine file status
  let status = 'unchanged';
  let movement = null;

  if (diff.addedInB.includes(file) && !isOrderA) {
    status = 'added';
  } else if (diff.removedFromB.includes(file) && isOrderA) {
    status = 'removed';
  } else {
    const movedFile = diff.moved.find((m) => m.file === file);
    if (movedFile) {
      status = 'moved';
      movement = movedFile;
    }
  }

  item.classList.add(`pr-diff-file-${status}`);
  if (movement && movement.isLargeMove) {
    item.classList.add('pr-diff-file-large-move');
  }

  // Position
  const position = document.createElement('span');
  position.className = 'pr-diff-file-position';
  position.textContent = `${index + 1}`;

  // File path
  const path = document.createElement('span');
  path.className = 'pr-diff-file-path';
  path.textContent = file;

  // Movement indicator
  if (movement) {
    const indicator = document.createElement('span');
    indicator.className = 'pr-diff-file-movement';
    indicator.textContent = formatPositionChange(
      isOrderA ? movement.distance : -movement.distance
    );

    item.appendChild(position);
    item.appendChild(path);
    item.appendChild(indicator);
  } else {
    item.appendChild(position);
    item.appendChild(path);
  }

  return item;
}
