#!/bin/bash

# Generate all icon sizes for Chrome Web Store
# - 128x128 for store listing (96x96 content + 16px padding)
# - Also generates 16x16 and 48x48 using same script

set -e

echo "Generating icons from SVG..."

# Main icon
node scripts/svg-to-png.js icons/icon.svg store/icons/icon128.png

echo ""
echo "✓ Icon generation complete!"
echo ""
echo "Generated:"
echo "  - store/icons/icon128.png (128x128, 96x96 content centered)"
