#!/usr/bin/env node

/**
 * Manifest Validation Script for Chrome Web Store Submission
 *
 * Validates manifest.json against Chrome Web Store requirements
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'manifest.json');
const ROOT_DIR = path.join(__dirname, '..');

const errors = [];
const warnings = [];
const checks = [];

function check(name, condition, errorMsg, warningMsg = null) {
  if (condition) {
    checks.push(`✓ ${name}`);
    return true;
  } else {
    if (errorMsg) {
      errors.push(`✗ ${name}: ${errorMsg}`);
    }
    if (warningMsg) {
      warnings.push(`⚠ ${name}: ${warningMsg}`);
    }
    return false;
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(ROOT_DIR, filePath));
}

console.log('🔍 Validating manifest.json for Chrome Web Store...\n');

// Load manifest
let manifest;
try {
  const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
  manifest = JSON.parse(manifestContent);
  check('JSON Syntax', true, null);
} catch (err) {
  console.error('✗ Failed to parse manifest.json:', err.message);
  process.exit(1);
}

// Required fields
check('Manifest Version 3', manifest.manifest_version === 3, 'Must be 3');
check(
  'Name field',
  manifest.name && manifest.name.length > 0,
  'Name is required'
);
check(
  'Version field',
  manifest.version && /^\d+\.\d+\.\d+$/.test(manifest.version),
  'Version must follow semantic versioning (e.g., 0.1.0)'
);
check(
  'Description field',
  manifest.description && manifest.description.length > 0,
  'Description is required'
);
check(
  'Description length',
  manifest.description && manifest.description.length <= 132,
  'Description must be 132 characters or less'
);

// Icons
check('Icons field', manifest.icons, 'Icons field is required');
check(
  'Icon 16x16',
  manifest.icons && manifest.icons['16'],
  'Must include 16x16 icon'
);
check(
  'Icon 48x48',
  manifest.icons && manifest.icons['48'],
  'Must include 48x48 icon'
);
check(
  'Icon 128x128',
  manifest.icons && manifest.icons['128'],
  'Must include 128x128 icon'
);

// Verify icon files exist
if (manifest.icons) {
  for (const [size, iconPath] of Object.entries(manifest.icons)) {
    check(
      `Icon file ${size}x${size}`,
      fileExists(iconPath),
      `Icon file not found: ${iconPath}`
    );
  }
}

// Permissions
check(
  'Permissions minimal',
  manifest.permissions && manifest.permissions.length <= 2,
  null,
  'Consider if all permissions are necessary'
);
check(
  'Storage permission',
  manifest.permissions && manifest.permissions.includes('storage'),
  null,
  'Storage permission not found'
);
check(
  'Host permissions',
  manifest.host_permissions && manifest.host_permissions.length === 1,
  null,
  'Multiple host permissions detected'
);
check(
  'Host permissions scoped',
  manifest.host_permissions &&
    manifest.host_permissions[0] === 'https://github.com/*',
  null,
  'Host permissions should be scoped to github.com'
);

// Content Security Policy
check(
  'CSP defined',
  manifest.content_security_policy,
  'Content Security Policy is recommended'
);
if (
  manifest.content_security_policy &&
  manifest.content_security_policy.extension_pages
) {
  const csp = manifest.content_security_policy.extension_pages;
  check(
    'CSP script-src',
    csp.includes("script-src 'self'"),
    null,
    "CSP should restrict script-src to 'self'"
  );
  check(
    'CSP object-src',
    csp.includes("object-src 'none'") || csp.includes("object-src 'self'"),
    null,
    'CSP should restrict object-src'
  );
}

// Content scripts
if (manifest.content_scripts) {
  manifest.content_scripts.forEach((script, index) => {
    check(
      `Content script ${index} has matches`,
      script.matches && script.matches.length > 0,
      `Content script ${index} must specify matches`
    );

    if (script.js) {
      script.js.forEach((jsFile) => {
        check(
          `Content script JS: ${jsFile}`,
          fileExists(jsFile),
          `File not found: ${jsFile}`
        );
      });
    }

    if (script.css) {
      script.css.forEach((cssFile) => {
        check(
          `Content script CSS: ${cssFile}`,
          fileExists(cssFile),
          `File not found: ${cssFile}`
        );
      });
    }
  });
}

// Action/Popup
if (manifest.action && manifest.action.default_popup) {
  check(
    'Popup HTML',
    fileExists(manifest.action.default_popup),
    `Popup file not found: ${manifest.action.default_popup}`
  );
}

// Background scripts (should not have background for this extension)
check(
  'No background script',
  !manifest.background,
  null,
  'Background scripts detected - ensure they are necessary'
);

// Print results
console.log('Checks Passed:');
checks.forEach((check) => console.log(check));

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach((warning) => console.log(warning));
}

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach((error) => console.log(error));
  console.log(
    `\n${errors.length} error(s) found. Please fix before submission.`
  );
  process.exit(1);
} else {
  console.log(
    `\n✅ Manifest validation passed! (${checks.length} checks, ${warnings.length} warnings)`
  );
  process.exit(0);
}
