/**
 * Unit tests for loading state utilities
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  createSpinner,
  showButtonLoading,
  createSkeleton,
  showLoadingOverlay,
  showSuccessAnimation,
  createEmptyState,
  withLoading,
} from '../../utils/loading-state.js';

describe('Loading State Utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createSpinner', () => {
    it('should create a spinner with default size and variant', () => {
      const spinner = createSpinner();

      expect(spinner.tagName).toBe('DIV');
      expect(spinner.className).toContain('pr-reorder-spinner');
      expect(spinner.getAttribute('role')).toBe('status');
      expect(spinner.getAttribute('aria-label')).toBe('Loading');
    });

    it('should create a small spinner', () => {
      const spinner = createSpinner('small');

      expect(spinner.className).toContain('pr-reorder-spinner-small');
    });

    it('should create a large spinner', () => {
      const spinner = createSpinner('large');

      expect(spinner.className).toContain('pr-reorder-spinner-large');
    });

    it('should create a dark variant spinner', () => {
      const spinner = createSpinner('medium', 'dark');

      expect(spinner.className).toContain('pr-reorder-spinner-dark');
    });
  });

  describe('showButtonLoading', () => {
    it('should show loading state on button', () => {
      const button = document.createElement('button');
      button.textContent = 'Save';
      button.disabled = false;

      const cleanup = showButtonLoading(button);

      expect(button.disabled).toBe(true);
      expect(button.querySelector('.pr-reorder-spinner')).not.toBeNull();
      expect(button.textContent).toContain('Loading');

      cleanup();
    });

    it('should restore button to original state', () => {
      const button = document.createElement('button');
      button.textContent = 'Save';
      button.disabled = false;

      const cleanup = showButtonLoading(button);
      cleanup();

      expect(button.disabled).toBe(false);
      expect(button.querySelector('.pr-reorder-spinner')).toBeNull();
    });

    it('should preserve original disabled state', () => {
      const button = document.createElement('button');
      button.textContent = 'Save';
      button.disabled = true;

      const cleanup = showButtonLoading(button);
      cleanup();

      expect(button.disabled).toBe(true);
    });
  });

  describe('createSkeleton', () => {
    it('should create skeleton with default rows', () => {
      const skeleton = createSkeleton();

      expect(skeleton.className).toBe('pr-reorder-skeleton');
      expect(skeleton.getAttribute('aria-label')).toBe('Loading content');

      const rows = skeleton.querySelectorAll('.pr-reorder-skeleton-row');
      expect(rows.length).toBe(3);
    });

    it('should create skeleton with custom rows', () => {
      const skeleton = createSkeleton({ rows: 5 });

      const rows = skeleton.querySelectorAll('.pr-reorder-skeleton-row');
      expect(rows.length).toBe(5);
    });

    it('should create skeleton with avatar', () => {
      const skeleton = createSkeleton({ showAvatar: true });

      const avatar = skeleton.querySelector('.pr-reorder-skeleton-avatar');
      expect(avatar).not.toBeNull();
    });

    it('should vary row widths', () => {
      const skeleton = createSkeleton({ rows: 4 });

      const rows = skeleton.querySelectorAll('.pr-reorder-skeleton-row');
      const widths = Array.from(rows).map((row) => row.style.width);

      // Should have different widths
      const uniqueWidths = new Set(widths);
      expect(uniqueWidths.size).toBeGreaterThan(1);
    });
  });

  describe('showLoadingOverlay', () => {
    it('should create loading overlay on element', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const cleanup = showLoadingOverlay(container, 'Loading files...');

      const overlay = container.querySelector('.pr-reorder-loading-overlay');
      expect(overlay).not.toBeNull();
      expect(overlay.querySelector('.pr-reorder-spinner')).not.toBeNull();
      expect(overlay.textContent).toContain('Loading files...');

      cleanup();
    });

    it('should remove overlay on cleanup', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const cleanup = showLoadingOverlay(container);
      cleanup();

      const overlay = container.querySelector('.pr-reorder-loading-overlay');
      expect(overlay).toBeNull();
    });

    it('should set container position to relative', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      showLoadingOverlay(container);

      expect(container.style.position).toBe('relative');
    });
  });

  describe('showSuccessAnimation', () => {
    it('should add checkmark animation class', () => {
      const element = document.createElement('div');

      showSuccessAnimation(element, 'checkmark');

      expect(element.classList.contains('pr-reorder-success-checkmark')).toBe(
        true
      );
    });

    it('should add pulse animation class', () => {
      const element = document.createElement('div');

      showSuccessAnimation(element, 'pulse');

      expect(element.classList.contains('pr-reorder-success-pulse')).toBe(true);
    });

    it('should remove animation class after timeout', (done) => {
      const element = document.createElement('div');

      showSuccessAnimation(element, 'checkmark');

      setTimeout(() => {
        expect(element.classList.contains('pr-reorder-success-checkmark')).toBe(
          false
        );
        done();
      }, 1100);
    });
  });

  describe('createEmptyState', () => {
    it('should create empty state with title', () => {
      const emptyState = createEmptyState({
        title: 'No files found',
      });

      expect(emptyState.className).toBe('pr-reorder-empty-state');

      const title = emptyState.querySelector('.pr-reorder-empty-state-title');
      expect(title.textContent).toBe('No files found');
    });

    it('should create empty state with message', () => {
      const emptyState = createEmptyState({
        title: 'No files',
        message: 'Try reloading the page',
      });

      const message = emptyState.querySelector(
        '.pr-reorder-empty-state-message'
      );
      expect(message.textContent).toBe('Try reloading the page');
    });

    it('should create empty state with custom icon', () => {
      const emptyState = createEmptyState({
        title: 'Empty',
        icon: '🎯',
      });

      const icon = emptyState.querySelector('.pr-reorder-empty-state-icon');
      expect(icon.textContent).toBe('🎯');
    });

    it('should create empty state with action button', () => {
      const onAction = jest.fn();
      const emptyState = createEmptyState({
        title: 'No orders',
        actionText: 'Create Order',
        onAction,
      });

      const button = emptyState.querySelector('button');
      expect(button).not.toBeNull();
      expect(button.textContent).toBe('Create Order');

      button.click();
      expect(onAction).toHaveBeenCalled();
    });
  });

  describe('withLoading', () => {
    it('should wrap async function with loading state', async () => {
      const asyncFn = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'result';
      });

      const wrapped = withLoading(asyncFn);
      const result = await wrapped();

      expect(result).toBe('result');
      expect(asyncFn).toHaveBeenCalled();
    });

    it('should show loading on button', async () => {
      const button = document.createElement('button');
      button.textContent = 'Save';
      document.body.appendChild(button);

      const asyncFn = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'done';
      });

      const wrapped = withLoading(asyncFn, { button });

      const promise = wrapped();

      // Button should show loading during execution
      await new Promise((resolve) => setTimeout(resolve, 5));
      expect(button.disabled).toBe(true);

      await promise;

      // Button should be restored after completion
      expect(button.disabled).toBe(false);
    });

    it('should handle errors and restore state', async () => {
      const button = document.createElement('button');
      button.disabled = false;
      document.body.appendChild(button);

      const asyncFn = jest.fn(async () => {
        throw new Error('Test error');
      });

      const wrapped = withLoading(asyncFn, { button });

      await expect(wrapped()).rejects.toThrow('Test error');

      // Button should be restored even after error
      expect(button.disabled).toBe(false);
    });

    it('should show loading overlay on container', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const asyncFn = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'done';
      });

      const wrapped = withLoading(asyncFn, {
        container,
        loadingMessage: 'Processing...',
      });

      const promise = wrapped();

      // Overlay should be present during execution
      await new Promise((resolve) => setTimeout(resolve, 5));
      expect(
        container.querySelector('.pr-reorder-loading-overlay')
      ).not.toBeNull();

      await promise;

      // Overlay should be removed after completion
      expect(container.querySelector('.pr-reorder-loading-overlay')).toBeNull();
    });
  });
});
