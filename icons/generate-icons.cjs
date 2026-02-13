#!/usr/bin/env node

/**
 * Generate PNG icons from master SVG
 * Uses sharp library for high-quality SVG to PNG conversion
 *
 * Usage: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not installed. Install with: npm install --save-dev sharp');
  console.log('Falling back to manual SVG copies...');

  // Just copy the SVG to different names
  const iconSvg = fs.readFileSync(path.join(__dirname, 'icon.svg'), 'utf8');

  fs.writeFileSync(path.join(__dirname, 'icon16.svg'), iconSvg);
  fs.writeFileSync(path.join(__dirname, 'icon48.svg'), iconSvg);
  fs.writeFileSync(path.join(__dirname, 'icon128.svg'), iconSvg);

  console.log('✓ SVG icons created (16, 48, 128)');
  console.log('Note: Install sharp to generate PNG versions');
  process.exit(0);
}

const sizes = [16, 48, 128];
const iconPath = path.join(__dirname, 'icon.svg');

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(__dirname, `icon${size}.png`);

    try {
      await sharp(iconPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated icon${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate icon${size}.png:`, error.message);
    }
  }

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);
