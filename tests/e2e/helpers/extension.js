import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load Chrome extension in a new browser context
 * @returns {Promise<{context: BrowserContext, extensionId: string}>}
 */
export async function loadExtension() {
  const extensionPath = path.join(__dirname, '../../..');

  // Create temporary user data directory
  const userDataDir = path.join(
    os.tmpdir(),
    `playwright-${Date.now()}-${Math.random().toString(36).substring(7)}`
  );

  // Launch browser with extension (headless: false required for extensions)
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    timeout: 10000,
  });

  // Get extension ID - note that extensions without background pages
  // won't have service workers, so we'll extract ID differently
  let extensionId = 'unknown';

  try {
    // Try to get from service workers (if extension has background page)
    const serviceWorkers = context.serviceWorkers();
    if (serviceWorkers.length > 0) {
      extensionId = serviceWorkers[0].url().split('/')[2];
    }
  } catch (error) {
    // Extension may not have background page, which is fine
  }

  return { context, extensionId };
}

/**
 * Get extension page (popup, options, etc.)
 * @param {BrowserContext} context
 * @param {string} extensionId
 * @param {string} page - Page name (e.g., 'popup.html')
 * @returns {Promise<Page>}
 */
export async function getExtensionPage(context, extensionId, page) {
  const pages = context.pages();
  for (const p of pages) {
    if (p.url().includes(extensionId) && p.url().includes(page)) {
      return p;
    }
  }

  // Open the page if not found
  const extensionPage = await context.newPage();
  await extensionPage.goto(`chrome-extension://${extensionId}/${page}`);
  return extensionPage;
}

/**
 * Wait for extension to be loaded on a page
 * @param {Page} page
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>}
 */
export async function waitForExtension(page, timeout = 5000) {
  try {
    await page.waitForFunction(
      () => {
        // Check if our extension's content script has run
        return document.querySelector('[data-pr-reorder]') !== null;
      },
      { timeout }
    );
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Create a new page with GitHub PR content
 * @param {BrowserContext} context
 * @param {string} htmlContent - HTML content to load
 * @returns {Promise<Page>}
 */
export async function createPRPage(context, htmlContent) {
  const page = await context.newPage();

  // Set the page content
  await page.setContent(htmlContent, {
    waitUntil: 'domcontentloaded',
  });

  return page;
}
