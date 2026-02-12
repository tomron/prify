/**
 * Unit tests for GitHub DOM Parser
 */
import {
  extractFiles,
  getFilePath,
  getFileMetadata,
  getFilesContainer,
} from '../../utils/parser.js';
import {
  createMockFileElement,
  createMockFilesContainer,
} from '../helpers/dom.js';

describe('parser', () => {
  describe('getFilesContainer', () => {
    it('should find files container in document', () => {
      const container = document.createElement('div');
      container.className = 'files';
      document.body.appendChild(container);

      const result = getFilesContainer();
      expect(result).toBe(container);

      document.body.removeChild(container);
    });

    it('should return null if no container found', () => {
      const result = getFilesContainer();
      expect(result).toBeNull();
    });

    it('should accept custom container as parameter', () => {
      const customContainer = document.createElement('div');
      customContainer.className = 'custom-files';

      const result = getFilesContainer(customContainer);
      expect(result).toBe(customContainer);
    });
  });

  describe('extractFiles', () => {
    beforeEach(() => {
      // Clear document body - safe since we're setting to empty string
      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }
    });

    it('should extract all file elements from container', () => {
      const container = createMockFilesContainer([
        { path: 'a.js', additions: 10, deletions: 5 },
        { path: 'b.js', additions: 20, deletions: 10 },
        { path: 'c.js', additions: 15, deletions: 3 },
      ]);
      document.body.appendChild(container);

      const files = extractFiles();
      expect(files.length).toBe(3);
    });

    it('should return empty array if no files found', () => {
      const container = document.createElement('div');
      container.className = 'files';
      document.body.appendChild(container);

      const files = extractFiles();
      expect(files).toEqual([]);
    });

    it('should extract files from custom container', () => {
      const container = createMockFilesContainer([
        { path: 'x.js', additions: 5, deletions: 2 },
      ]);

      const files = extractFiles(container);
      expect(files.length).toBe(1);
    });

    it('should return array of HTMLElements', () => {
      const container = createMockFilesContainer([
        { path: 'test.js', additions: 1, deletions: 1 },
      ]);
      document.body.appendChild(container);

      const files = extractFiles();
      expect(files[0]).toBeInstanceOf(HTMLElement);
      expect(files[0].classList.contains('file')).toBe(true);
    });

    it('should handle large number of files', () => {
      const fileData = Array.from({ length: 100 }, (_, i) => ({
        path: `file${i}.js`,
        additions: i,
        deletions: i,
      }));
      const container = createMockFilesContainer(fileData);
      document.body.appendChild(container);

      const files = extractFiles();
      expect(files.length).toBe(100);
    });
  });

  describe('getFilePath', () => {
    it('should extract file path from file element', () => {
      const file = createMockFileElement('src/components/Button.tsx', 10, 5);
      const path = getFilePath(file);
      expect(path).toBe('src/components/Button.tsx');
    });

    it('should extract file path from data attribute', () => {
      const file = document.createElement('div');
      file.className = 'file';
      file.dataset.path = 'README.md';

      const path = getFilePath(file);
      expect(path).toBe('README.md');
    });

    it('should extract file path from link text as fallback', () => {
      const file = document.createElement('div');
      file.className = 'file';

      const info = document.createElement('div');
      info.className = 'file-info';

      const link = document.createElement('a');
      link.textContent = 'package.json';

      info.appendChild(link);
      file.appendChild(info);

      const path = getFilePath(file);
      expect(path).toBe('package.json');
    });

    it('should handle files with special characters', () => {
      const file = createMockFileElement('src/file with spaces.js', 5, 2);
      const path = getFilePath(file);
      expect(path).toBe('src/file with spaces.js');
    });

    it('should handle files with unicode characters', () => {
      const file = createMockFileElement('src/文件.js', 3, 1);
      const path = getFilePath(file);
      expect(path).toBe('src/文件.js');
    });

    it('should return null for invalid element', () => {
      const invalidElement = document.createElement('div');
      const path = getFilePath(invalidElement);
      expect(path).toBeNull();
    });

    it('should handle renamed files marker', () => {
      const file = createMockFileElement('new-name.js', 10, 5);
      file.dataset.oldPath = 'old-name.js';

      const path = getFilePath(file);
      expect(path).toBe('new-name.js');
    });
  });

  describe('getFileMetadata', () => {
    it('should extract additions and deletions', () => {
      const file = createMockFileElement('test.js', 15, 8);
      const metadata = getFileMetadata(file);

      expect(metadata.additions).toBe(15);
      expect(metadata.deletions).toBe(8);
    });

    it('should handle zero additions and deletions', () => {
      const file = createMockFileElement('test.js', 0, 0);
      const metadata = getFileMetadata(file);

      expect(metadata.additions).toBe(0);
      expect(metadata.deletions).toBe(0);
    });

    it('should extract file path as part of metadata', () => {
      const file = createMockFileElement('src/utils.js', 10, 5);
      const metadata = getFileMetadata(file);

      expect(metadata.path).toBe('src/utils.js');
    });

    it('should detect renamed files', () => {
      const file = createMockFileElement('new.js', 5, 5);
      file.dataset.oldPath = 'old.js';

      const metadata = getFileMetadata(file);

      expect(metadata.renamed).toBe(true);
      expect(metadata.oldPath).toBe('old.js');
      expect(metadata.newPath).toBe('new.js');
    });

    it('should detect binary files', () => {
      const file = createMockFileElement('image.png', 0, 0);
      file.dataset.binary = 'true';

      const metadata = getFileMetadata(file);

      expect(metadata.binary).toBe(true);
    });

    it('should calculate total changes', () => {
      const file = createMockFileElement('test.js', 20, 10);
      const metadata = getFileMetadata(file);

      expect(metadata.changes).toBe(30);
    });

    it('should handle missing metadata gracefully', () => {
      const file = document.createElement('div');
      file.className = 'file';

      const metadata = getFileMetadata(file);

      expect(metadata.additions).toBe(0);
      expect(metadata.deletions).toBe(0);
      expect(metadata.changes).toBe(0);
      expect(metadata.path).toBeNull();
    });

    it('should detect new files', () => {
      const file = createMockFileElement('new-file.js', 50, 0);
      file.dataset.fileStatus = 'added';

      const metadata = getFileMetadata(file);

      expect(metadata.status).toBe('added');
      expect(metadata.isNew).toBe(true);
    });

    it('should detect deleted files', () => {
      const file = createMockFileElement('deleted.js', 0, 100);
      file.dataset.fileStatus = 'removed';

      const metadata = getFileMetadata(file);

      expect(metadata.status).toBe('removed');
      expect(metadata.isDeleted).toBe(true);
    });

    it('should detect modified files', () => {
      const file = createMockFileElement('modified.js', 10, 5);
      file.dataset.fileStatus = 'modified';

      const metadata = getFileMetadata(file);

      expect(metadata.status).toBe('modified');
      expect(metadata.isModified).toBe(true);
    });
  });
});
