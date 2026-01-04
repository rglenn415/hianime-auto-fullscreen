#!/usr/bin/env node
/**
 * Clean build script for Firefox extension
 * Only includes essential files, excludes all development files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files that MUST be included in the extension package
// Per Mozilla AMO: only files referenced in manifest.json are required
const REQUIRED_FILES = [
  'manifest.json',  // Required - extension manifest
  'content.js',     // Referenced in manifest content_scripts
  'popup.html',     // Referenced in manifest browser_action
  'popup.js'        // Referenced in popup.html
];

// NOTE: LICENSE and PRIVACY.md are provided via AMO submission form, NOT in the package

// Verify all required files exist
console.log('Verifying required files...');
let allFilesExist = true;

for (const file of REQUIRED_FILES) {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file}`);
  } else {
    console.error(`✗ ${file} - MISSING!`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('\nError: Some required files are missing!');
  process.exit(1);
}

console.log('\nAll required files present.\n');

// Build the ignore-files arguments
const ignorePatterns = [
  'node_modules/',
  'tests/',
  'coverage/',
  'docs/',
  'dist/',
  'web-ext-artifacts/',
  '.git/',
  '.github/',
  '*.sh',
  '*.py',
  '*.bat',
  '*.js',  // Ignore all JS except the ones we need
  '!content.js',  // But keep content.js
  '!popup.js',    // But keep popup.js
  '*.md',  // Ignore all markdown files (PRIVACY.md provided via AMO form)
  'LICENSE',  // LICENSE provided via AMO form
  '*.txt',
  '*.csv',
  'package.json',
  'package-lock.json',
  'jest.config.js',
  '.gitignore',
  '.webextignore',
  '.webext-source-ignore',
  '.npmrc'
];

const ignoreArgs = ignorePatterns.map(pattern => `--ignore-files="${pattern}"`).join(' ');

const buildCommand = `web-ext build --overwrite-dest ${ignoreArgs}`;

console.log('Building extension...\n');
console.log('Command:', buildCommand.substring(0, 100) + '...\n');

try {
  execSync(buildCommand, { stdio: 'inherit' });
  console.log('\n✓ Build complete!');

  // Show what's in the artifacts folder
  const artifactsDir = 'web-ext-artifacts';
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
