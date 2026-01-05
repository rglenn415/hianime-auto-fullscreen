#!/usr/bin/env node
/**
 * Generate Firefox extension icons from a source PNG
 * Requires: sharp (npm install --save-dev sharp)
 *
 * Usage: node scripts/generate-icons.js path/to/icon-1024.png
 */

const fs = require('fs');
const path = require('path');

// Icon sizes required for Firefox extensions
const ICON_SIZES = [
  { size: 16, name: 'icon-16.png' },
  { size: 32, name: 'icon-32.png' },
  { size: 48, name: 'icon-48.png' },
  { size: 96, name: 'icon-96.png' }
];

async function generateIcons(sourcePath) {
  // Check if sharp is available
  let sharp;
  try {
    sharp = require('sharp');
  } catch (error) {
    console.error('❌ Error: sharp is not installed');
    console.log('\nInstall it with:');
    console.log('  npm install --save-dev sharp');
    console.log('\nOr use the Python version instead:');
    console.log('  python scripts/generate-icons.py path/to/icon.png');
    process.exit(1);
  }

  // Verify source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Error: Source file not found: ${sourcePath}`);
    process.exit(1);
  }

  // Create icons directory in src/
  const iconsDir = path.join(__dirname, '..', 'src', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log(`✓ Created directory: src/icons/`);
  }

  console.log(`\nGenerating icons from: ${sourcePath}\n`);

  // Get source image info
  const metadata = await sharp(sourcePath).metadata();
  console.log(`Source image: ${metadata.width}x${metadata.height} (${metadata.format})\n`);

  // Generate each icon size
  for (const { size, name } of ICON_SIZES) {
    const outputPath = path.join(iconsDir, name);

    try {
      await sharp(sourcePath)
        .resize(size, size, {
          kernel: sharp.kernel.lanczos3, // High-quality downscaling
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        })
        .png({
          compressionLevel: 9, // Maximum compression
          quality: 100
        })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✓ ${name.padEnd(15)} ${size}x${size}  (${sizeKB} KB)`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\n✓ Icon generation complete!');
  console.log(`\nIcons saved to: src/icons/`);
  console.log('\nNext steps:');
  console.log('1. Rebuild: npm run build');
  console.log('2. Verify icons in Firefox');
  console.log('\nNote: manifest.json already configured to use these icons');
}

// Main
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/generate-icons.js <source-icon.png>');
    console.log('\nExample:');
    console.log('  node scripts/generate-icons.js icon-1024.png');
    console.log('  node scripts/generate-icons.js ~/Downloads/my-icon.png');
    process.exit(1);
  }

  const sourcePath = path.resolve(args[0]);
  generateIcons(sourcePath).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { generateIcons };
