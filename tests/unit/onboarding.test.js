/**
 * Tests for onboarding tour functionality
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  shouldShowTour,
  markTourComplete,
  resetTour,
  getTourSteps,
} from '../../utils/onboarding.js';

describe('shouldShowTour', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    global.localStorage = {
      storage: {},
      getItem(key) {
        return this.storage[key] || null;
      },
      setItem(key, value) {
        this.storage[key] = value;
      },
      removeItem(key) {
        delete this.storage[key];
      },
      clear() {
        this.storage = {};
      },
    };
  });

  it('returns true for first-time users', async () => {
    const result = await shouldShowTour();
    expect(result).toBe(true);
  });

  it('returns false after tour is marked complete', async () => {
    await markTourComplete();
    const result = await shouldShowTour();
    expect(result).toBe(false);
  });

  it('returns true after tour is reset', async () => {
    await markTourComplete();
    await resetTour();
    const result = await shouldShowTour();
    expect(result).toBe(true);
  });
});

describe('getTourSteps', () => {
  it('returns array of tour steps', () => {
    const steps = getTourSteps();
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThanOrEqual(4);
    expect(steps.length).toBeLessThanOrEqual(6); // Updated to allow 6 steps
  });

  it('each step has required properties', () => {
    const steps = getTourSteps();
    steps.forEach((step) => {
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('content');
      expect(step).toHaveProperty('target');
      expect(typeof step.title).toBe('string');
      expect(typeof step.content).toBe('string');
    });
  });

  it('steps have proper order', () => {
    const steps = getTourSteps();
    expect(steps[0].title).toContain('Welcome');
    expect(steps[steps.length - 1].title).toMatch(/set|ready|done|complete/i);
  });
});

describe('markTourComplete', () => {
  beforeEach(() => {
    global.localStorage = {
      storage: {},
      getItem(key) {
        return this.storage[key] || null;
      },
      setItem(key, value) {
        this.storage[key] = value;
      },
    };
  });

  it('stores completion status', async () => {
    await markTourComplete();
    const stored = global.localStorage.getItem('pr-reorder-tour-complete');
    expect(stored).toBeTruthy();
  });

  it('stores timestamp of completion', async () => {
    const before = Date.now();
    await markTourComplete();
    const after = Date.now();

    const stored = JSON.parse(
      global.localStorage.getItem('pr-reorder-tour-complete')
    );
    expect(stored.timestamp).toBeGreaterThanOrEqual(before);
    expect(stored.timestamp).toBeLessThanOrEqual(after);
  });
});
