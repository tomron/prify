/**
 * Tests for search/filter functionality
 */

import { describe, it, expect } from '@jest/globals';
import {
  fuzzyMatch,
  highlightMatches,
  filterFiles,
} from '../../utils/search-filter.js';

describe('fuzzyMatch', () => {
  it('matches exact substring', () => {
    expect(fuzzyMatch('readme', 'README.md')).toBe(true);
    expect(fuzzyMatch('test', 'src/test.js')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(fuzzyMatch('README', 'readme.md')).toBe(true);
    expect(fuzzyMatch('Test', 'TEST.js')).toBe(true);
  });

  it('matches characters in order (fuzzy)', () => {
    expect(fuzzyMatch('rdme', 'README.md')).toBe(true);
    expect(fuzzyMatch('tst', 'test.js')).toBe(true);
    expect(fuzzyMatch('srcmn', 'src/main.js')).toBe(true);
  });

  it('does not match when characters are out of order', () => {
    expect(fuzzyMatch('merd', 'README.md')).toBe(false);
    expect(fuzzyMatch('tse', 'test.js')).toBe(false);
  });

  it('handles empty search', () => {
    expect(fuzzyMatch('', 'any-file.js')).toBe(true);
    expect(fuzzyMatch('', '')).toBe(true);
  });

  it('handles empty filename', () => {
    expect(fuzzyMatch('test', '')).toBe(false);
  });

  it('handles special characters', () => {
    expect(fuzzyMatch('file.test', 'file.test.js')).toBe(true);
    expect(fuzzyMatch('src/test', 'src/test.js')).toBe(true);
  });

  it('matches path separators', () => {
    expect(fuzzyMatch('src/util', 'src/utils/helper.js')).toBe(true);
    expect(fuzzyMatch('test/unit', 'tests/unit/parser.test.js')).toBe(true);
  });
});

describe('highlightMatches', () => {
  it('highlights exact matches', () => {
    const result = highlightMatches('readme', 'README.md');
    expect(result).toContain('<mark>');
    expect(result).toContain('</mark>');
  });

  it('highlights fuzzy matches', () => {
    const result = highlightMatches('rdme', 'README.md');
    expect(result).toContain('<mark>R</mark>');
    expect(result).toContain('<mark>D</mark>');
    expect(result).toContain('<mark>M</mark>');
    expect(result).toContain('<mark>E</mark>');
  });

  it('escapes HTML in filenames', () => {
    const result = highlightMatches('test', '<script>test</script>');
    expect(result).not.toContain('<script>');
    // Should escape HTML and highlight matching chars
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).toContain('<mark>');
  });

  it('returns escaped text when no match', () => {
    const result = highlightMatches('xyz', 'README.md');
    expect(result).toBe('README.md');
    expect(result).not.toContain('<mark>');
  });

  it('handles empty search (no highlighting)', () => {
    const result = highlightMatches('', 'README.md');
    expect(result).toBe('README.md');
  });
});

describe('filterFiles', () => {
  const files = [
    'README.md',
    'src/main.js',
    'src/utils/helper.js',
    'tests/unit/parser.test.js',
    'docs/api.md',
    'package.json',
  ];

  it('returns all files for empty search', () => {
    const result = filterFiles(files, '');
    expect(result).toEqual(files);
  });

  it('filters files by exact match', () => {
    const result = filterFiles(files, 'test');
    expect(result).toContain('tests/unit/parser.test.js');
    expect(result.length).toBe(1);
  });

  it('filters files by fuzzy match', () => {
    const result = filterFiles(files, 'srcmn');
    expect(result).toContain('src/main.js');
    expect(result.length).toBe(1);
  });

  it('filters multiple matching files', () => {
    const result = filterFiles(files, 'src');
    expect(result).toContain('src/main.js');
    expect(result).toContain('src/utils/helper.js');
    expect(result.length).toBe(2);
  });

  it('preserves original order of filtered files', () => {
    const result = filterFiles(files, 'js');
    // Should maintain order: src/main.js, src/utils/helper.js, tests/unit/parser.test.js, package.json
    expect(result[0]).toBe('src/main.js');
    expect(result[1]).toBe('src/utils/helper.js');
    expect(result[2]).toBe('tests/unit/parser.test.js');
    expect(result[3]).toBe('package.json');
  });

  it('returns empty array when no matches', () => {
    const result = filterFiles(files, 'xyz123');
    expect(result).toEqual([]);
  });

  it('is case insensitive', () => {
    const result = filterFiles(files, 'README');
    expect(result).toContain('README.md');
  });

  it('handles large file lists efficiently', () => {
    const largeList = Array.from({ length: 1000 }, (_, i) => `file${i}.js`);
    const start = performance.now();
    const result = filterFiles(largeList, 'file5');
    const duration = performance.now() - start;

    // Should filter 1000 files in <10ms
    expect(duration).toBeLessThan(10);
    expect(result.length).toBeGreaterThan(0);
  });
});
