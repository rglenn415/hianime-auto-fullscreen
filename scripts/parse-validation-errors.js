#!/usr/bin/env node
/**
 * Parse Firefox Add-on validation errors into CSV format
 * Usage: node parse-validation-errors.js validation_error.txt output.csv
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const inputFile = process.argv[2] || 'validation_error.txt';
const outputFile = process.argv[3] || 'validation_errors.csv';

// Read input file
let content;
try {
  content = fs.readFileSync(inputFile, 'utf8');
} catch (err) {
  console.error(`Error reading file ${inputFile}:`, err.message);
  process.exit(1);
}

const lines = content.split('\n');

// Data structure for parsed errors
const errors = [];
let currentError = null;

// Parse the file
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  if (!line) continue;

  // First line is summary
  if (i === 0) {
    const match = line.match(/(\d+) errors, (\d+) warnings, (\d+) notices/);
    if (match) {
      errors.push({
        type: 'SUMMARY',
        severity: 'INFO',
        message: line,
        file: '',
        location: '',
        description: `Total: ${match[1]} errors, ${match[2]} warnings, ${match[3]} notices`
      });
    }
    continue;
  }

  // Check if line contains "Error:" or "Warning:"
  if (line.startsWith('Error:') || line.startsWith('Warning:')) {
    // Save previous error if exists
    if (currentError) {
      errors.push(currentError);
    }

    // Start new error
    const severity = line.startsWith('Error:') ? 'ERROR' : 'WARNING';
    const message = line.replace(/^(Error|Warning):\s*/, '');

    currentError = {
      type: 'VALIDATION',
      severity: severity,
      message: message,
      file: '',
      location: '',
      description: message
    };
  } else if (currentError) {
    // Check if line contains file path
    if (line.includes('.js') || line.includes('.json') || line.includes('.html') ||
        line.includes('.sh') || line.includes('.ps1') || line.includes('node_modules/')) {

      // Extract file path and location
      const locationMatch = line.match(/(.+?)\s+line\s+(\d+)\s+column\s+(\d+)/);
      if (locationMatch) {
        currentError.file = locationMatch[1].trim();
        currentError.location = `line ${locationMatch[2]}, col ${locationMatch[3]}`;
      } else {
        currentError.file = line;
        currentError.location = '';
      }
    } else if (line.startsWith('"') || line.includes('must match') || line.includes('is not')) {
      // Additional description
      currentError.description += ' | ' + line;
    }
  } else {
    // Check for inline patterns without "Error:" prefix
    const patternMatch = line.match(/^"([^"]+)"\s+(.+)/);
    if (patternMatch) {
      errors.push({
        type: 'VALIDATION',
        severity: 'ERROR',
        message: patternMatch[2],
        file: 'manifest.json',
        location: '',
        description: `Field "${patternMatch[1]}" - ${patternMatch[2]}`
      });
    }
  }
}

// Add last error
if (currentError) {
  errors.push(currentError);
}

// Categorize errors
const categorized = errors.map(error => {
  let category = 'OTHER';
  let subcategory = '';
  let fixable = 'MANUAL';

  const msg = error.message.toLowerCase();
  const file = error.file.toLowerCase();

  // Categorize by file location
  if (file.includes('node_modules')) {
    category = 'DEPENDENCY';
    subcategory = 'Third-party code';
    fixable = 'EXCLUDE_FILE';
  } else if (file.includes('coverage/')) {
    category = 'DEVELOPMENT';
    subcategory = 'Test coverage';
    fixable = 'EXCLUDE_FILE';
  } else if (file.includes('tests/') || file.includes('test-page')) {
    category = 'DEVELOPMENT';
    subcategory = 'Test files';
    fixable = 'EXCLUDE_FILE';
  } else if (file.includes('manifest.json')) {
    category = 'MANIFEST';
    subcategory = 'Configuration';
    fixable = 'FIXED';
  }

  // Categorize by error type
  if (msg.includes('json') && msg.includes('comment')) {
    category = 'DEPENDENCY';
    subcategory = 'JSON syntax';
    fixable = 'EXCLUDE_FILE';
  } else if (msg.includes('data_collection_permissions')) {
    category = 'MANIFEST';
    subcategory = 'Missing field';
    fixable = 'FIXED';
  } else if (msg.includes('inline script')) {
    category = 'SECURITY';
    subcategory = 'CSP violation';
    fixable = file.includes('test') ? 'EXCLUDE_FILE' : 'MANUAL';
  } else if (msg.includes('eval')) {
    category = 'SECURITY';
    subcategory = 'eval usage';
    fixable = file.includes('node_modules') ? 'EXCLUDE_FILE' : 'MANUAL';
  } else if (msg.includes('innerhtml')) {
    category = 'SECURITY';
    subcategory = 'innerHTML usage';
    fixable = file.includes('node_modules') ? 'EXCLUDE_FILE' : 'MANUAL';
  } else if (msg.includes('flagged file')) {
    category = 'DEPENDENCY';
    subcategory = 'Binary/executable';
    fixable = 'EXCLUDE_FILE';
  } else if (msg.includes('javascript syntax error')) {
    category = 'SYNTAX';
    subcategory = 'Parse error';
    fixable = file.includes('node_modules') ? 'EXCLUDE_FILE' : 'MANUAL';
  } else if (msg.includes('not supported')) {
    category = 'COMPATIBILITY';
    subcategory = 'Unsupported API';
    fixable = file.includes('node_modules') ? 'EXCLUDE_FILE' : 'MANUAL';
  }

  return {
    ...error,
    category,
    subcategory,
    fixable
  };
});

// Generate CSV
const csvHeader = 'Type,Severity,Category,Subcategory,Message,File,Location,Description,Fixable\n';
const csvRows = categorized.map(error => {
  return [
    error.type,
    error.severity,
    error.category,
    error.subcategory,
    `"${error.message.replace(/"/g, '""')}"`,
    `"${error.file.replace(/"/g, '""')}"`,
    `"${error.location.replace(/"/g, '""')}"`,
    `"${error.description.replace(/"/g, '""')}"`,
    error.fixable
  ].join(',');
});

const csv = csvHeader + csvRows.join('\n');

// Write output
try {
  fs.writeFileSync(outputFile, csv, 'utf8');
  console.log(`✅ Parsed ${categorized.length} validation issues`);
  console.log(`📊 Output written to: ${outputFile}`);

  // Print summary statistics
  const stats = {
    errors: categorized.filter(e => e.severity === 'ERROR').length,
    warnings: categorized.filter(e => e.severity === 'WARNING').length,
    byCategory: {}
  };

  categorized.forEach(e => {
    if (!stats.byCategory[e.category]) {
      stats.byCategory[e.category] = 0;
    }
    stats.byCategory[e.category]++;
  });

  console.log('\n📈 Summary:');
  console.log(`   Errors: ${stats.errors}`);
  console.log(`   Warnings: ${stats.warnings}`);
  console.log('\n📂 By Category:');
  Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });

  const fixable = categorized.filter(e => e.fixable === 'FIXED' || e.fixable === 'EXCLUDE_FILE').length;
  console.log(`\n✨ Fixable: ${fixable}/${categorized.length} (${Math.round(fixable/categorized.length*100)}%)`);

} catch (err) {
  console.error(`Error writing file ${outputFile}:`, err.message);
  process.exit(1);
}
