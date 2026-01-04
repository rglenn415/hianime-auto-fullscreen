#!/usr/bin/env node
/**
 * Clean build script for Firefox extension
 * Only includes essential files, excludes all development files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Source directory
const SRC_DIR = path.join(__dirname, '..', 'src');

// Files that MUST be included in the extension package
// Per Mozilla AMO: only files referenced in manifest.json are required
const REQUIRED_FILES = [
  'manifest.json',  // Required - extension manifest
  'content.js',     // Referenced in manifest content_scripts
  'popup.html',     // Referenced in manifest browser_action
  'popup.js'        // Referenced in popup.html
];

// NOTE: LICENSE and PRIVACY.md are provided via AMO submission form, NOT in the package

// Verify all required files exist in src/
console.log('Verifying required files in src/...');
let allFilesExist = true;

for (const file of REQUIRED_FILES) {
  const filePath = path.join(SRC_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`✓ src/${file}`);
  } else {
    console.error(`✗ src/${file} - MISSING!`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('\nError: Some required files are missing!');
  process.exit(1);
}

console.log('\nAll required files present.\n');

// Build from src directory
const buildCommand = `web-ext build --source-dir="${SRC_DIR}" --overwrite-dest`;

console.log('Building extension from src/...\n');

try {
  execSync(buildCommand, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('\n✓ Build complete!');

  // Show what's in the artifacts folder
  const artifactsDir = path.join(__dirname, '..', 'web-ext-artifacts');
  if (fs.existsSync(artifactsDir)) {
    const files = fs.readdirSync(artifactsDir);
    console.log('\nBuilt packages:');
    files.forEach(file => {
      const stats = fs.statSync(path.join(artifactsDir, file));
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  ${file} (${sizeKB} KB)`);
    });
  }
} catch (error) {
  console.error('\n✗ Build failed!');
  process.exit(1);
}
