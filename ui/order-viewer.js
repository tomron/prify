/**
 * Order Viewer Modal
 * Display all user orders, consensus, and agreement metrics
 */

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
    const orderCard = createOrderCard(order, onSelectOrder);
    section.appendChild(orderCard);
  });

  return section;
}

/**
 * Create order card
 * @param {Object} order - Order data
 * @param {Function} [onSelectOrder] - Callback when order selected
 * @returns {HTMLElement}
 */
function createOrderCard(order, onSelectOrder) {
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

  // Apply button
  if (onSelectOrder) {
    const applyBtn = document.createElement('button');
    applyBtn.className = 'pr-reorder-btn pr-reorder-btn-secondary pr-viewer-apply-btn';
    applyBtn.textContent = 'Apply This Order';
    applyBtn.addEventListener('click', () => {
      onSelectOrder(order.order);
    });
    card.appendChild(applyBtn);
  }

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
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}
