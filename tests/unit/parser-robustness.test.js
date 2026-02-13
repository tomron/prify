/**
 * Tests for parser robustness (BUG-004)
 */

import {
  getFilesContainer,
  
  getFilePath,
  detectDOMStructureVersion,
  getParserStats,
  resetParserStats,
  ParserErrorType,
} from '../../utils/parser.js';

describe('Parser Robustness (BUG-004)', () => {
  beforeEach(() => {
    resetParserStats();
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
  });

  afterEach(() => {
    resetParserStats();
  });

  describe('DOM structure detection', () => {
    it('should detect DOM structure version', () => {
      const container = document.createElement('div');
      container.className = 'files';
      document.body.appendChild(container);

      const version = detectDOMStructureVersion();

      expect(version).toBeTruthy();
      expect(version).toContain('hasFiles');
    });

    it('should return unknown for empty page', () => {
      const version = detectDOMStructureVersion();

      expect(version).toBe('unknown');
    });
  });

  describe('Error boundaries', () => {
    it('should handle missing container gracefully', () => {
      const container = getFilesContainer();

      expect(container).toBeNull();
      expect(() => getFilesContainer()).not.toThrow();
    });

    it('should handle invalid file element', () => {
      const path = getFilePath(null);

      expect(path).toBeNull();
      expect(() => getFilePath(null)).not.toThrow();
    });

    it('should track failed extractions', () => {
      resetParserStats();

      getFilesContainer(); // Will fail

      const stats = getParserStats();
      expect(stats.failedExtractions).toBeGreaterThan(0);
    });
  });

  describe('Fallback selectors', () => {
    it('should use fallback container selector', () => {
      const container = document.createElement('div');
      container.setAttribute('data-target', 'diff-container');
      document.body.appendChild(container);

      const found = getFilesContainer();

      expect(found).toBe(container);

      const stats = getParserStats();
      expect(stats.fallbacksUsed).toBeGreaterThan(0);
    });

    it('should track successful extractions', () => {
      const container = document.createElement('div');
      container.className = 'files';
      document.body.appendChild(container);

      resetParserStats();

      getFilesContainer();

      const stats = getParserStats();
      expect(stats.successfulExtractions).toBe(1);
      expect(stats.failedExtractions).toBe(0);
    });
  });

  describe('Parser statistics', () => {
    it('should provide statistics', () => {
      const stats = getParserStats();

      expect(stats).toHaveProperty('successfulExtractions');
      expect(stats).toHaveProperty('failedExtractions');
      expect(stats).toHaveProperty('fallbacksUsed');
      expect(stats).toHaveProperty('lastError');
      expect(stats).toHaveProperty('domStructureVersion');
    });

    it('should reset statistics', () => {
      resetParserStats();
      getFilesContainer(); // Will fail

      let stats = getParserStats();
      expect(stats.failedExtractions).toBeGreaterThan(0);

      resetParserStats();

      stats = getParserStats();
      expect(stats.failedExtractions).toBe(0);
    });
  });

  describe('Error logging', () => {
    it('should log last error', () => {
      resetParserStats();

      getFilesContainer(); // Will fail

      const stats = getParserStats();
      expect(stats.lastError).toBeTruthy();
      expect(stats.lastError.type).toBe(ParserErrorType.CONTAINER_NOT_FOUND);
    });

    it('should include DOM version in error', () => {
      detectDOMStructureVersion();
      getFilesContainer(); // Will fail

      const stats = getParserStats();
      expect(stats.lastError.domVersion).toBeTruthy();
    });
  });
});
