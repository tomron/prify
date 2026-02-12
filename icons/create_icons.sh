#!/bin/bash
# Create simple colored squares as placeholder icons using ImageMagick or base64 encoded PNGs

# Create 16x16 icon (base64 encoded simple PNG)
cat > icon16.png.b64 << 'ICON16'
iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA
QgAAAEIBarqQRAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABJSURBVDiN7dIx
CoAwDAXQv4iTk5u38P4XcHMRHBzciiDYwUGaD0mGQCAhbwjJD9h/hgBswAqUQAOcQA+0wAVcwB3EQAJE
QCxEwgs+SAzJfiTOYgAAAABJRU5ErkJggg==
ICON16
base64 --decode -i icon16.png.b64 -o icon16.png
rm icon16.png.b64

# For 48x48 and 128x128, we'll just copy and scale or use the 16x16 for now
cp icon16.png icon48.png
cp icon16.png icon128.png
