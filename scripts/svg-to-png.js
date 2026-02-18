#!/usr/bin/env node

/**
 * SVG to PNG Converter
 *
 * Converts an SVG file to a 128x128 PNG with:
 * - SVG content scaled to 96x96
 * - Centered with transparent padding (16px on all sides)
 *
 * Usage: node scripts/svg-to-png.js <input.svg> <output.png>
 */

import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const CANVAS_SIZE = 128;
const CONTENT_SIZE = 96;
const PADDING = (CANVAS_SIZE - CONTENT_SIZE) / 2; // 16px

async function convertSvgToPng(inputPath, outputPath) {
  try {
    // Validate input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Read SVG file
    const svgBuffer = fs.readFileSync(inputPath);
    const svgDataUrl = `data:image/svg+xml;base64,${svgBuffer.toString('base64')}`;

    // Create canvas
    const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const ctx = canvas.getContext('2d');

    // Clear canvas (transparent background)
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Load and draw SVG
    const image = await loadImage(svgDataUrl);

    // Draw SVG centered with padding
    ctx.drawImage(
      image,
      PADDING, // x position
      PADDING, // y position
      CONTENT_SIZE, // width
      CONTENT_SIZE // height
    );

    // Write PNG to output
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`✓ Converted ${inputPath} → ${outputPath}`);
    console.log(`  Canvas: ${CANVAS_SIZE}x${CANVAS_SIZE}px`);
    console.log(`  Content: ${CONTENT_SIZE}x${CONTENT_SIZE}px (centered)`);
    console.log(`  Padding: ${PADDING}px on all sides`);
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    process.exit(1);
  }
}

// CLI usage
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error('Usage: node scripts/svg-to-png.js <input.svg> <output.png>');
  console.error('');
  console.error('Example:');
  console.error(
    '  node scripts/svg-to-png.js icons/icon.svg store/icons/icon128.png'
  );
  process.exit(1);
}

const [inputPath, outputPath] = args;
convertSvgToPng(inputPath, outputPath);

export { convertSvgToPng };
