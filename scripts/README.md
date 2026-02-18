# Scripts

Utility scripts for the PR File Reorder extension.

## Icon Generation

### svg-to-png.js

Converts SVG files to PNG format with specific dimensions and padding.

**Features:**
- Outputs 128x128 PNG
- Scales SVG content to 96x96
- Centers content with 16px transparent padding on all sides
- Perfect for Chrome Web Store icon requirements

**Usage:**

```bash
# Direct usage
node scripts/svg-to-png.js <input.svg> <output.png>

# Example
node scripts/svg-to-png.js icons/icon.svg store/icons/icon128.png

# Using npm script
npm run icons:convert -- icons/icon.svg store/icons/icon128.png
```

### generate-icons.sh

Batch generates all required icon sizes for Chrome Web Store submission.

**Usage:**

```bash
# Generate all icons
npm run icons:generate

# Or directly
bash scripts/generate-icons.sh
```

**Output:**
- `store/icons/icon128.png` - 128x128 store listing icon

## Requirements

- Node.js 14+
- `canvas` package (installed as dev dependency)

## Adding New Icons

To generate additional icon sizes, edit `generate-icons.sh` and add:

```bash
node scripts/svg-to-png.js icons/icon.svg store/icons/icon<SIZE>.png
```

The script will automatically handle centering and padding.
