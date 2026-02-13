/**
 * Unit tests for Sort Presets
 */
import {
  sortAlphabetical,
  sortReverseAlphabetical,
  sortByExtension,
  sortReadmeFirstTestsLast,
  sortNewFilesFirst,
  sortMostChangedFirst,
  getAllPresets,
  applyPreset,
} from '../../utils/presets.js';

describe('presets', () => {
  describe('sortAlphabetical', () => {
    it('should sort files alphabetically A-Z', () => {
      const files = [
        { path: 'src/utils.js' },
        { path: 'README.md' },
        { path: 'package.json' },
      ];

      const sorted = sortAlphabetical(files);

      expect(sorted.map((f) => f.path)).toEqual([
        'package.json',
        'README.md',
        'src/utils.js',
      ]);
    });

    it('should handle files with different cases', () => {
      const files = [
        { path: 'Zebra.js' },
        { path: 'apple.js' },
        { path: 'Banana.js' },
      ];

      const sorted = sortAlphabetical(files);

      expect(sorted.map((f) => f.path)).toEqual([
        'apple.js',
        'Banana.js',
        'Zebra.js',
      ]);
    });

    it('should not mutate original array', () => {
      const files = [{ path: 'z.js' }, { path: 'a.js' }];
      const original = [...files];

      sortAlphabetical(files);

      expect(files).toEqual(original);
    });

    it('should handle empty array', () => {
      const sorted = sortAlphabetical([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single file', () => {
      const files = [{ path: 'single.js' }];
      const sorted = sortAlphabetical(files);
      expect(sorted).toEqual(files);
    });
  });

  describe('sortReverseAlphabetical', () => {
    it('should sort files alphabetically Z-A', () => {
      const files = [
        { path: 'README.md' },
        { path: 'package.json' },
        { path: 'src/utils.js' },
      ];

      const sorted = sortReverseAlphabetical(files);

      expect(sorted.map((f) => f.path)).toEqual([
        'src/utils.js',
        'README.md',
        'package.json',
      ]);
    });

    it('should handle files with different cases', () => {
      const files = [
        { path: 'apple.js' },
        { path: 'Banana.js' },
        { path: 'Zebra.js' },
      ];

      const sorted = sortReverseAlphabetical(files);

      expect(sorted.map((f) => f.path)).toEqual([
        'Zebra.js',
        'Banana.js',
        'apple.js',
      ]);
    });

    it('should not mutate original array', () => {
      const files = [{ path: 'a.js' }, { path: 'z.js' }];
      const original = [...files];

      sortReverseAlphabetical(files);

      expect(files).toEqual(original);
    });
  });

  describe('sortByExtension', () => {
    it('should group files by extension', () => {
      const files = [
        { path: 'app.js' },
        { path: 'styles.css' },
        { path: 'utils.js' },
        { path: 'README.md' },
        { path: 'test.css' },
      ];

      const sorted = sortByExtension(files);

      expect(sorted.map((f) => f.path)).toEqual([
        'styles.css',
        'test.css',
        'app.js',
        'utils.js',
        'README.md',
      ]);
    });

    it('should handle files without extensions', () => {
      const files = [
        { path: 'Dockerfile' },
        { path: 'app.js' },
        { path: 'Makefile' },
      ];

      const sorted = sortByExtension(files);

      // Files without extensions should be grouped together
      const paths = sorted.map((f) => f.path);
      const dockerIdx = paths.indexOf('Dockerfile');
      const makeIdx = paths.indexOf('Makefile');
      const jsIdx = paths.indexOf('app.js');

      // Files without extension should be together
      expect(Math.abs(dockerIdx - makeIdx)).toBe(1);
      // JS file should be separate
      expect(jsIdx).not.toBe(dockerIdx);
      expect(jsIdx).not.toBe(makeIdx);
    });

    it('should sort alphabetically within same extension', () => {
      const files = [{ path: 'z.js' }, { path: 'a.js' }, { path: 'm.js' }];

      const sorted = sortByExtension(files);

      expect(sorted.map((f) => f.path)).toEqual(['a.js', 'm.js', 'z.js']);
    });

    it('should not mutate original array', () => {
      const files = [{ path: 'a.js' }, { path: 'b.css' }];
      const original = [...files];

      sortByExtension(files);

      expect(files).toEqual(original);
    });
  });

  describe('sortReadmeFirstTestsLast', () => {
    it('should place README files first', () => {
      const files = [
        { path: 'src/app.js' },
        { path: 'README.md' },
        { path: 'package.json' },
      ];

      const sorted = sortReadmeFirstTestsLast(files);

      expect(sorted[0].path).toBe('README.md');
    });

    it('should place test files last', () => {
      const files = [
        { path: 'src/app.js' },
        { path: 'src/app.test.js' },
        { path: 'package.json' },
      ];

      const sorted = sortReadmeFirstTestsLast(files);

      expect(sorted[sorted.length - 1].path).toBe('src/app.test.js');
    });

    it('should handle multiple README files', () => {
      const files = [
        { path: 'docs/README.md' },
        { path: 'README.md' },
        { path: 'src/README.md' },
      ];

      const sorted = sortReadmeFirstTestsLast(files);

      // All READMEs should be at the start
      expect(sorted[0].path).toContain('README');
      expect(sorted[1].path).toContain('README');
      expect(sorted[2].path).toContain('README');
    });

    it('should detect various test file patterns', () => {
      const files = [
        { path: 'src/app.js' },
        { path: 'app.test.js' },
        { path: 'utils.spec.js' },
        { path: 'tests/integration.js' },
        { path: 'xtests/unit.js' },
      ];

      const sorted = sortReadmeFirstTestsLast(files);

      // Regular file should be first
      expect(sorted[0].path).toBe('src/app.js');

      // Test files should be last (order may vary)
      const lastFour = sorted.slice(-4).map((f) => f.path);
      expect(lastFour).toContain('app.test.js');
      expect(lastFour).toContain('utils.spec.js');
      expect(lastFour).toContain('tests/integration.js');
      expect(lastFour).toContain('xtests/unit.js');
    });

    it('should handle README.md variants', () => {
      const files = [
        { path: 'src/app.js' },
        { path: 'readme.md' },
        { path: 'README.MD' },
        { path: 'ReadMe.md' },
      ];

      const sorted = sortReadmeFirstTestsLast(files);

      // All README variants should be first
      expect(sorted[0].path.toLowerCase()).toContain('readme');
      expect(sorted[1].path.toLowerCase()).toContain('readme');
      expect(sorted[2].path.toLowerCase()).toContain('readme');
    });

    it('should not mutate original array', () => {
      const files = [{ path: 'app.js' }, { path: 'README.md' }];
      const original = [...files];

      sortReadmeFirstTestsLast(files);

      expect(files).toEqual(original);
    });
  });

  describe('sortNewFilesFirst', () => {
    it('should place new files first', () => {
      const files = [
        { path: 'modified.js', status: 'modified' },
        { path: 'new.js', status: 'added' },
        { path: 'deleted.js', status: 'removed' },
      ];

      const sorted = sortNewFilesFirst(files);

      expect(sorted[0].path).toBe('new.js');
    });

    it('should use isNew flag as fallback', () => {
      const files = [
        { path: 'modified.js', isNew: false },
        { path: 'new.js', isNew: true },
        { path: 'old.js', isNew: false },
      ];

      const sorted = sortNewFilesFirst(files);

      expect(sorted[0].path).toBe('new.js');
    });

    it('should maintain alphabetical order within groups', () => {
      const files = [
        { path: 'z.js', status: 'modified' },
        { path: 'new-z.js', status: 'added' },
        { path: 'a.js', status: 'modified' },
        { path: 'new-a.js', status: 'added' },
      ];

      const sorted = sortNewFilesFirst(files);

      expect(sorted.map((f) => f.path)).toEqual([
        'new-a.js',
        'new-z.js',
        'a.js',
        'z.js',
      ]);
    });

    it('should handle files without status', () => {
      const files = [
        { path: 'no-status.js' },
        { path: 'new.js', status: 'added' },
      ];

      const sorted = sortNewFilesFirst(files);

      expect(sorted[0].path).toBe('new.js');
      expect(sorted[1].path).toBe('no-status.js');
    });

    it('should not mutate original array', () => {
      const files = [
        { path: 'old.js', status: 'modified' },
        { path: 'new.js', status: 'added' },
      ];
      const original = [...files];

      sortNewFilesFirst(files);

      expect(files).toEqual(original);
    });
  });

  describe('sortMostChangedFirst', () => {
    it('should sort by total changes descending', () => {
      const files = [
        { path: 'small.js', additions: 5, deletions: 2 },
        { path: 'large.js', additions: 100, deletions: 50 },
        { path: 'medium.js', additions: 20, deletions: 10 },
      ];

      const sorted = sortMostChangedFirst(files);

      expect(sorted.map((f) => f.path)).toEqual([
        'large.js',
        'medium.js',
        'small.js',
      ]);
    });

    it('should use changes field if available', () => {
      const files = [
        { path: 'a.js', changes: 100 },
        { path: 'b.js', changes: 50 },
        { path: 'c.js', changes: 200 },
      ];

      const sorted = sortMostChangedFirst(files);

      expect(sorted.map((f) => f.path)).toEqual(['c.js', 'a.js', 'b.js']);
    });

    it('should handle files with zero changes', () => {
      const files = [
        { path: 'no-change.js', additions: 0, deletions: 0 },
        { path: 'changed.js', additions: 10, deletions: 5 },
      ];

      const sorted = sortMostChangedFirst(files);

      expect(sorted[0].path).toBe('changed.js');
      expect(sorted[1].path).toBe('no-change.js');
    });

    it('should handle missing metadata gracefully', () => {
      const files = [
        { path: 'no-metadata.js' },
        { path: 'with-changes.js', additions: 10, deletions: 5 },
      ];

      const sorted = sortMostChangedFirst(files);

      expect(sorted[0].path).toBe('with-changes.js');
    });

    it('should sort alphabetically for equal changes', () => {
      const files = [
        { path: 'z.js', additions: 10, deletions: 5 },
        { path: 'a.js', additions: 10, deletions: 5 },
        { path: 'm.js', additions: 10, deletions: 5 },
      ];

      const sorted = sortMostChangedFirst(files);

      expect(sorted.map((f) => f.path)).toEqual(['a.js', 'm.js', 'z.js']);
    });

    it('should not mutate original array', () => {
      const files = [
        { path: 'a.js', additions: 5, deletions: 2 },
        { path: 'b.js', additions: 10, deletions: 5 },
      ];
      const original = [...files];

      sortMostChangedFirst(files);

      expect(files).toEqual(original);
    });
  });

  describe('getAllPresets', () => {
    it('should return all available presets', () => {
      const presets = getAllPresets();

      expect(presets).toHaveLength(6);
      expect(presets.map((p) => p.id)).toEqual([
        'alphabetical',
        'reverse-alphabetical',
        'by-extension',
        'readme-first-tests-last',
        'new-files-first',
        'most-changed-first',
      ]);
    });

    it('should include name and description for each preset', () => {
      const presets = getAllPresets();

      presets.forEach((preset) => {
        expect(preset.id).toBeDefined();
        expect(preset.name).toBeDefined();
        expect(preset.description).toBeDefined();
        expect(typeof preset.sort).toBe('function');
      });
    });
  });

  describe('applyPreset', () => {
    it('should apply preset by id', () => {
      const files = [{ path: 'z.js' }, { path: 'a.js' }, { path: 'm.js' }];

      const sorted = applyPreset('alphabetical', files);

      expect(sorted.map((f) => f.path)).toEqual(['a.js', 'm.js', 'z.js']);
    });

    it('should throw error for invalid preset id', () => {
      const files = [{ path: 'a.js' }];

      expect(() => {
        applyPreset('invalid-preset', files);
      }).toThrow('Unknown preset: invalid-preset');
    });

    it('should handle all preset ids', () => {
      const files = [
        { path: 'z.js', additions: 10, deletions: 5, status: 'modified' },
      ];

      const presets = getAllPresets();

      presets.forEach((preset) => {
        expect(() => {
          applyPreset(preset.id, files);
        }).not.toThrow();
      });
    });
  });
});
