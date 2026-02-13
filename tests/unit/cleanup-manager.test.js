/**
 * Tests for cleanup manager (BUG-002)
 */

import {
  getCleanupManager,
  cleanup,
  resetCleanupManager,
} from '../../utils/cleanup-manager.js';

describe('Cleanup Manager', () => {
  beforeEach(() => {
    resetCleanupManager();
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
  });

  afterEach(() => {
    resetCleanupManager();
  });

  it('should track and remove elements', () => {
    const manager = getCleanupManager();
    const div = document.createElement('div');
    div.className = 'test-div';
    document.body.appendChild(div);
    manager.trackElement(div);

    expect(manager.getStats().elements).toBe(1);
    expect(document.querySelector('.test-div')).toBeTruthy();

    cleanup();

    expect(manager.getStats().elements).toBe(0);
    expect(document.querySelector('.test-div')).toBeNull();
  });

  it('should track and remove event listeners', () => {
    const manager = getCleanupManager();
    const button = document.createElement('button');
    let callCount = 0;
    const handler = () => {
      callCount++;
    };

    manager.trackEventListener(button, 'click', handler);
    button.click();
    expect(callCount).toBe(1);

    cleanup();

    button.click();
    expect(callCount).toBe(1); // Still 1, listener removed
  });

  it('should clean up all resources', () => {
    const manager = getCleanupManager();

    // Track various resources
    const div = document.createElement('div');
    document.body.appendChild(div);
    manager.trackElement(div);

    let timeoutCalled = false;
    manager.trackTimeout(() => {
      timeoutCalled = true;
    }, 1000);

    manager.trackInterval(() => {}, 100);

    const controller = manager.createAbortController();

    expect(manager.hasTrackedResources()).toBe(true);

    cleanup();

    expect(manager.hasTrackedResources()).toBe(false);
    expect(controller.signal.aborted).toBe(true);

    // Wait to ensure timeout doesn't fire
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(timeoutCalled).toBe(false);
        resolve();
      }, 1100);
    });
  });
});
