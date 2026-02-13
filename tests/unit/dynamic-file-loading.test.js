/**
 * Tests for dynamic file loading (BUG-001)
 */

import {
  observeFileChanges,
  stopObserving,
} from '../../content/dom-manipulator.js';

describe('Dynamic File Loading (BUG-001)', () => {
  function createMockFile(path) {
    const file = document.createElement('div');
    file.className = 'file';
    file.setAttribute('data-path', path);

    const header = document.createElement('div');
    header.className = 'file-header';
    header.setAttribute('data-path', path);

    const link = document.createElement('a');
    link.className = 'Link--primary';
    link.title = path;
    link.textContent = path;

    header.appendChild(link);
    file.appendChild(header);

    return file;
  }

  beforeEach(() => {
    const container = document.createElement('div');
    container.className = 'files'; // GitHub's files container class
    container.appendChild(createMockFile('file1.js'));
    container.appendChild(createMockFile('file2.js'));
    document.body.appendChild(container);
  });

  afterEach(() => {
    stopObserving();
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
  });

  it('should create observer for file changes', () => {
    const observer = observeFileChanges(() => {}, 50);
    expect(observer).toBeTruthy();
    expect(observer).toBeInstanceOf(MutationObserver);
  });

  it('should stop observing when requested', () => {
    const observer = observeFileChanges(() => {}, 50);
    expect(observer).toBeTruthy();

    stopObserving();

    // Observer should be disconnected (can't easily test internals, but shouldn't throw)
    expect(() => stopObserving()).not.toThrow();
  });

  it('should not create duplicate observers', () => {
    const observer1 = observeFileChanges(() => {}, 100);
    expect(observer1).toBeTruthy();

    const observer2 = observeFileChanges(() => {}, 100);
    expect(observer2).toBeNull(); // Should return null for duplicate

    stopObserving();
  });

  it('should handle missing container gracefully', () => {
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }

    const observer = observeFileChanges(() => {}, 100);
    expect(observer).toBeNull();
  });
});
