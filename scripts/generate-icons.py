#!/usr/bin/env python3
"""
Generate Firefox extension icons from a source PNG
Requires: Pillow (pip install Pillow)

Usage: python scripts/generate-icons.py path/to/icon-1024.png
"""

import sys
import os
from pathlib import Path

# Icon sizes required for Firefox extensions
ICON_SIZES = [
    (16, 'icon-16.png'),
    (32, 'icon-32.png'),
    (48, 'icon-48.png'),
    (96, 'icon-96.png')
]


def generate_icons(source_path):
    """Generate all required icon sizes from source PNG"""

    # Check if PIL/Pillow is available
    try:
        from PIL import Image
    except ImportError:
        print('❌ Error: Pillow is not installed')
        print('\nInstall it with:')
        print('  pip install Pillow')
        print('\nOr use the Node.js version instead:')
        print('  npm install --save-dev sharp')
        print('  node scripts/generate-icons.js path/to/icon.png')
        sys.exit(1)

    # Verify source file exists
    if not os.path.exists(source_path):
        print(f'❌ Error: Source file not found: {source_path}')
        sys.exit(1)

    # Create icons directory in src/
    script_dir = Path(__file__).parent
    icons_dir = script_dir.parent / 'src' / 'icons'
    icons_dir.mkdir(parents=True, exist_ok=True)
    print(f'✓ Created directory: src/icons/')

    print(f'\nGenerating icons from: {source_path}\n')

    # Open source image
    try:
        img = Image.open(source_path)
        print(f'Source image: {img.size[0]}x{img.size[1]} ({img.format})\n')

        # Ensure RGBA mode for transparency
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
    except Exception as e:
        print(f'❌ Error opening image: {e}')
        sys.exit(1)

    # Generate each icon size
    for size, name in ICON_SIZES:
        output_path = icons_dir / name

        try:
            # Resize with high-quality Lanczos resampling
            resized = img.resize((size, size), Image.Resampling.LANCZOS)

            # Save with maximum quality
            resized.save(output_path, 'PNG', optimize=True)

            # Get file size
            file_size = output_path.stat().st_size / 1024  # KB
            print(f'✓ {name:<15} {size}x{size}  ({file_size:.2f} KB)')
        except Exception as e:
            print(f'❌ Failed to generate {name}: {e}')

    print('\n✓ Icon generation complete!')
    print(f'\nIcons saved to: src/icons/')
    print('\nNext steps:')
    print('1. Rebuild: npm run build')
    print('2. Verify icons in Firefox')
    print('\nNote: manifest.json already configured to use these icons')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python scripts/generate-icons.py <source-icon.png>')
        print('\nExample:')
        print('  python scripts/generate-icons.py icon-1024.png')
        print('  python scripts/generate-icons.py ~/Downloads/my-icon.png')
        sys.exit(1)

    source_path = os.path.abspath(sys.argv[1])
    generate_icons(source_path)
