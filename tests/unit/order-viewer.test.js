/**
 * @jest-environment jsdom
 */

import { createOrderViewerModal } from '../../ui/order-viewer.js';

describe('Order Viewer Modal', () => {
  beforeEach(() => {
    // Clear DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  afterEach(() => {
    // Clean up
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  describe('createOrderViewerModal', () => {
    it('should create modal with consensus and orders', () => {
      const orders = [
        {
          user: 'alice',
          order: ['a.js', 'b.js', 'c.js'],
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          user: 'bob',
          order: ['b.js', 'a.js', 'c.js'],
          timestamp: '2024-01-01T01:00:00Z',
        },
      ];

      const consensus = ['a.js', 'b.js', 'c.js'];
      const metadata = {
        participantCount: 2,
        agreementScore: 0.95,
        conflicts: [],
        mostRecentTimestamp: '2024-01-01T01:00:00Z',
      };

      const modal = createOrderViewerModal({
        orders,
        consensus,
        metadata,
      });

      // Check modal was added to DOM
      const overlay = document.querySelector('.pr-reorder-modal-overlay');
      expect(overlay).not.toBeNull();

      // Check modal content
      const title = document.getElementById('pr-viewer-modal-title');
      expect(title.textContent).toBe('File Order Consensus');

      // Check consensus section
      const consensusSection = document.querySelector('.pr-viewer-section');
      expect(consensusSection).not.toBeNull();

      // Clean up
      modal.close();
    });

    it('should display participant count', () => {
      const orders = [
        { user: 'alice', order: ['a.js'], timestamp: '2024-01-01T00:00:00Z' },
        { user: 'bob', order: ['a.js'], timestamp: '2024-01-01T00:00:00Z' },
      ];

      const consensus = ['a.js'];
      const metadata = {
        participantCount: 2,
        agreementScore: 1.0,
        conflicts: [],
        mostRecentTimestamp: null,
      };

      const modal = createOrderViewerModal({
        orders,
        consensus,
        metadata,
      });

      const participantStat = Array.from(
        document.querySelectorAll('.pr-viewer-stat')
      ).find((el) => el.textContent.includes('participant'));

      expect(participantStat.textContent).toBe('2 participants');

      modal.close();
    });

    it('should display agreement score with correct styling', () => {
      const testCases = [
        { score: 0.95, expectedClass: 'pr-viewer-stat-success' },
        { score: 0.75, expectedClass: 'pr-viewer-stat-warning' },
        { score: 0.45, expectedClass: 'pr-viewer-stat-danger' },
      ];

      testCases.forEach(({ score, expectedClass }) => {
        // Clear DOM
        while (document.body.firstChild) {
          document.body.removeChild(document.body.firstChild);
        }

        const modal = createOrderViewerModal({
          orders: [{ user: 'test', order: ['a.js'] }],
          consensus: ['a.js'],
          metadata: {
            participantCount: 1,
            agreementScore: score,
            conflicts: [],
            mostRecentTimestamp: null,
          },
        });

        const agreementStat = Array.from(
          document.querySelectorAll('.pr-viewer-stat')
        ).find((el) => el.textContent.includes('agreement'));

        expect(agreementStat.classList.contains(expectedClass)).toBe(true);

        modal.close();
      });
    });

    it('should display consensus files in order', () => {
      const consensus = ['file1.js', 'file2.js', 'file3.js'];
      const metadata = {
        participantCount: 1,
        agreementScore: 1.0,
        conflicts: [],
        mostRecentTimestamp: null,
      };

      const modal = createOrderViewerModal({
        orders: [{ user: 'test', order: consensus }],
        consensus,
        metadata,
      });

      const fileItems = document.querySelectorAll('.pr-viewer-file-item');
      expect(fileItems.length).toBeGreaterThanOrEqual(3);

      // Check first file
      const firstFile = Array.from(fileItems).find((item) =>
        item.textContent.includes('file1.js')
      );
      expect(firstFile).not.toBeNull();

      modal.close();
    });

    it('should display controversial files with badges', () => {
      const consensus = ['a.js', 'b.js'];
      const metadata = {
        participantCount: 2,
        agreementScore: 0.8,
        conflicts: [
          {
            file: 'a.js',
            positions: [0, 1],
            averagePosition: 0.5,
            standardDeviation: 0.5,
          },
        ],
        mostRecentTimestamp: null,
      };

      const modal = createOrderViewerModal({
        orders: [
          { user: 'alice', order: ['a.js', 'b.js'] },
          { user: 'bob', order: ['b.js', 'a.js'] },
        ],
        consensus,
        metadata,
      });

      const controversialBadge = Array.from(
        document.querySelectorAll('.pr-reorder-badge-warning')
      ).find((el) => el.textContent === 'Controversial');

      expect(controversialBadge).not.toBeNull();

      modal.close();
    });

    it('should display individual user orders', () => {
      const orders = [
        {
          user: 'alice',
          order: ['a.js', 'b.js'],
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          user: 'bob',
          order: ['b.js', 'a.js'],
          timestamp: '2024-01-01T01:00:00Z',
        },
      ];

      const modal = createOrderViewerModal({
        orders,
        consensus: ['a.js', 'b.js'],
        metadata: {
          participantCount: 2,
          agreementScore: 0.8,
          conflicts: [],
          mostRecentTimestamp: null,
        },
      });

      const orderCards = document.querySelectorAll('.pr-viewer-order-card');
      expect(orderCards.length).toBe(2);

      const userNames = Array.from(orderCards).map((card) =>
        card.querySelector('.pr-viewer-order-user').textContent
      );
      expect(userNames).toContain('alice');
      expect(userNames).toContain('bob');

      modal.close();
    });

    it('should call onSelectOrder when apply button clicked', () => {
      const orders = [
        { user: 'alice', order: ['a.js', 'b.js'], timestamp: '2024-01-01T00:00:00Z' },
      ];

      let called = false;
      let calledWith = null;
      const onSelectOrder = (order) => {
        called = true;
        calledWith = order;
      };

      const modal = createOrderViewerModal({
        orders,
        consensus: ['a.js', 'b.js'],
        metadata: {
          participantCount: 1,
          agreementScore: 1.0,
          conflicts: [],
          mostRecentTimestamp: null,
        },
        onSelectOrder,
      });

      const applyBtn = document.querySelector('.pr-viewer-apply-btn');
      expect(applyBtn).not.toBeNull();

      applyBtn.click();

      expect(called).toBe(true);
      expect(calledWith).toEqual(['a.js', 'b.js']);

      modal.close();
    });

    it('should close on Escape key', (done) => {
      let closeCalled = false;
      const onClose = () => {
        closeCalled = true;
      };

      const modal = createOrderViewerModal({
        orders: [],
        consensus: [],
        metadata: {
          participantCount: 0,
          agreementScore: 0,
          conflicts: [],
          mostRecentTimestamp: null,
        },
        onClose,
      });

      // Simulate Escape key
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      setTimeout(() => {
        expect(closeCalled).toBe(true);
        const overlay = document.querySelector('.pr-reorder-modal-overlay');
        expect(overlay).toBeNull();
        done();
      }, 10);
    });

    it('should close when close button clicked', () => {
      let closeCalled = false;
      const onClose = () => {
        closeCalled = true;
      };

      const modal = createOrderViewerModal({
        orders: [],
        consensus: [],
        metadata: {
          participantCount: 0,
          agreementScore: 0,
          conflicts: [],
          mostRecentTimestamp: null,
        },
        onClose,
      });

      const closeBtn = document.querySelector('.pr-reorder-modal-close');
      closeBtn.click();

      expect(closeCalled).toBe(true);
      const overlay = document.querySelector('.pr-reorder-modal-overlay');
      expect(overlay).toBeNull();
    });

    it('should show empty state when no consensus', () => {
      const modal = createOrderViewerModal({
        orders: [],
        consensus: [],
        metadata: {
          participantCount: 0,
          agreementScore: 0,
          conflicts: [],
          mostRecentTimestamp: null,
        },
      });

      const emptyMessage = Array.from(
        document.querySelectorAll('.pr-viewer-empty')
      ).find((el) => el.textContent.includes('No consensus yet'));

      expect(emptyMessage).not.toBeNull();

      modal.close();
    });

    it('should mark local orders with badge', () => {
      const orders = [
        {
          user: 'alice',
          order: ['a.js'],
          timestamp: '2024-01-01T00:00:00Z',
          source: 'local',
        },
      ];

      const modal = createOrderViewerModal({
        orders,
        consensus: ['a.js'],
        metadata: {
          participantCount: 1,
          agreementScore: 1.0,
          conflicts: [],
          mostRecentTimestamp: null,
        },
      });

      const localBadge = Array.from(
        document.querySelectorAll('.pr-reorder-badge')
      ).find((el) => el.textContent === 'Local');

      expect(localBadge).not.toBeNull();

      modal.close();
    });
  });
});
