/**
 * Custom assertion helpers for testing
 */

/**
 * Assert that arrays are equal (order matters)
 * @param {Array} actual
 * @param {Array} expected
 * @param {string} message
 */
export function assertArrayEquals(actual, expected, message = '') {
  if (actual.length !== expected.length) {
    throw new Error(
      `${message}\nExpected length ${expected.length} but got ${actual.length}`
    );
  }

  for (let i = 0; i < expected.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(
        `${message}\nAt index ${i}: expected "${expected[i]}" but got "${actual[i]}"`
      );
    }
  }
}

/**
 * Assert that arrays contain the same elements (order doesn't matter)
 * @param {Array} actual
 * @param {Array} expected
 * @param {string} message
 */
export function assertArrayContainsSame(actual, expected, message = '') {
  const actualSorted = [...actual].sort();
  const expectedSorted = [...expected].sort();

  assertArrayEquals(actualSorted, expectedSorted, message);
}

/**
 * Assert that element has attribute
 * @param {HTMLElement} element
 * @param {string} attribute
 * @param {string} expectedValue
 * @param {string} message
 */
export function assertElementHasAttribute(
  element,
  attribute,
  expectedValue,
  message = ''
) {
  if (!element.hasAttribute(attribute)) {
    throw new Error(
      `${message}\nElement does not have attribute "${attribute}"`
    );
  }

  const actualValue = element.getAttribute(attribute);
  if (actualValue !== expectedValue) {
    throw new Error(
      `${message}\nExpected attribute "${attribute}" to be "${expectedValue}" but got "${actualValue}"`
    );
  }
}

/**
 * Assert that element has class
 * @param {HTMLElement} element
 * @param {string} className
 * @param {string} message
 */
export function assertElementHasClass(element, className, message = '') {
  if (!element.classList.contains(className)) {
    throw new Error(
      `${message}\nElement does not have class "${className}". Classes: ${element.className}`
    );
  }
}

/**
 * Assert that element is visible
 * @param {HTMLElement} element
 * @param {string} message
 */
export function assertElementVisible(element, message = '') {
  const style = window.getComputedStyle(element);

  if (style.display === 'none' || style.visibility === 'hidden') {
    throw new Error(`${message}\nElement is not visible`);
  }

  if (element.offsetParent === null && element !== document.body) {
    throw new Error(`${message}\nElement is not visible (no offset parent)`);
  }
}

/**
 * Assert that value is within range
 * @param {number} actual
 * @param {number} min
 * @param {number} max
 * @param {string} message
 */
export function assertInRange(actual, min, max, message = '') {
  if (actual < min || actual > max) {
    throw new Error(
      `${message}\nExpected value to be between ${min} and ${max} but got ${actual}`
    );
  }
}

/**
 * Assert that function throws error
 * @param {Function} fn
 * @param {string|RegExp} errorMatch - Expected error message or pattern
 * @param {string} message
 */
export function assertThrows(fn, errorMatch, message = '') {
  let threw = false;
  let error;

  try {
    fn();
  } catch (e) {
    threw = true;
    error = e;
  }

  if (!threw) {
    throw new Error(`${message}\nExpected function to throw but it didn't`);
  }

  if (errorMatch) {
    const errorMessage = error.message;
    const matches =
      typeof errorMatch === 'string'
        ? errorMessage.includes(errorMatch)
        : errorMatch.test(errorMessage);

    if (!matches) {
      throw new Error(
        `${message}\nExpected error message to match "${errorMatch}" but got "${errorMessage}"`
      );
    }
  }
}

/**
 * Assert that async function throws error
 * @param {Function} fn
 * @param {string|RegExp} errorMatch - Expected error message or pattern
 * @param {string} message
 */
export async function assertThrowsAsync(fn, errorMatch, message = '') {
  let threw = false;
  let error;

  try {
    await fn();
  } catch (e) {
    threw = true;
    error = e;
  }

  if (!threw) {
    throw new Error(`${message}\nExpected function to throw but it didn't`);
  }

  if (errorMatch) {
    const errorMessage = error.message;
    const matches =
      typeof errorMatch === 'string'
        ? errorMessage.includes(errorMatch)
        : errorMatch.test(errorMessage);

    if (!matches) {
      throw new Error(
        `${message}\nExpected error message to match "${errorMatch}" but got "${errorMessage}"`
      );
    }
  }
}
