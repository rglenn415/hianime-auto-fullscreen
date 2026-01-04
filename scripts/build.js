#!/usr/bin/env node
/**
 * Build script for HiAnime Auto Fullscreen extension
 * Creates a production-ready ZIP file excluding development files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building HiAnime Auto Fullscreen extension...\n');

// Files to include in the build
const includeFiles = [
  'manifest.json',
  'content.js',
  'popup.html',
  'popup.js',
  'popup.css',
  'README.md',
  'LICENSE',
  'PRIVACY.md',
  'PERMISSIONS.md'
];

// Output file
const outputFile = 'hianime-autofullscreen.zip';

// Remove old build if exists
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
  console.log(`🗑️  Removed old ${outputFile}`);
}

// Check all files exist
console.log('📋 Checking files...');
const missingFiles = [];
includeFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
    console.log(`   ❌ ${file} - MISSING`);
  } else {
    const stats = fs.statSync(file);
    console.log(`   ✅ ${file} (${stats.size} bytes)`);
  }
});

if (missingFiles.length > 0) {
  console.error(`\n❌ Build failed: Missing required files`);
  process.exit(1);
}

// Create ZIP using PowerShell on Windows
console.log('\n📦 Creating ZIP archive...');
try {
  const filesList = includeFiles.map(f => `"${f}"`).join(',');
  const command = `powershell -Command "Compress-Archive -Path ${filesList} -DestinationPath '${outputFile}' -Force"`;

  execSync(command, { stdio: 'inherit' });

  const stats = fs.statSync(outputFile);
  const sizeKB = (stats.size / 1024).toFixed(2);

  console.log(`\n✅ Build complete!`);
  console.log(`📦 Output: ${outputFile}`);
  console.log(`📊 Size: ${sizeKB} KB`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Test: Load ${outputFile} in Firefox via about:debugging`);
  console.log(`   2. Validate: Upload to https://addons.mozilla.org/developers/addon/submit/upload-unlisted`);
  console.log(`   3. Submit: Upload to Firefox Add-ons store`);

} catch (error) {
  console.error(`\n❌ Build failed:`, error.message);
  process.exit(1);
}
