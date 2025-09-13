#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const plugin = require('../src/index.js');

console.log('Building prettier-plugin-kusto-kql...');

// Validate plugin structure
if (!plugin.languages || !plugin.parsers || !plugin.printers) {
  console.error('❌ Plugin structure is invalid');
  process.exit(1);
}

console.log('✅ Plugin structure is valid');

// Test with sample files
const examplesDir = path.join(__dirname, '../examples');
const sampleFile = path.join(examplesDir, 'sample.kql');

if (fs.existsSync(sampleFile)) {
  try {
    const code = fs.readFileSync(sampleFile, 'utf8');
    
    // Use async format and handle promise
    prettier.format(code, {
      parser: 'kusto',
      plugins: [plugin],
    }).then(formatted => {
      const outputFile = path.join(examplesDir, 'sample.formatted.kql');
      fs.writeFileSync(outputFile, formatted);
      
      console.log('✅ Sample file formatted successfully');
      console.log(`📝 Output written to ${outputFile}`);
      console.log('🎉 Build completed successfully!');
    }).catch(error => {
      console.error('❌ Error formatting sample file:', error.message);
      // Try synchronous version
      try {
        const formatted = prettier.format(code, {
          parser: 'kusto',
          plugins: [plugin],
        });
        
        if (typeof formatted === 'string') {
          const outputFile = path.join(examplesDir, 'sample.formatted.kql');
          fs.writeFileSync(outputFile, formatted);
          console.log('✅ Sample file formatted successfully (sync)');
          console.log('🎉 Build completed successfully!');
        } else {
          console.error('❌ Unexpected format result type:', typeof formatted);
          process.exit(1);
        }
      } catch (syncError) {
        console.error('❌ Sync format also failed:', syncError.message);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Error reading sample file:', error.message);
    process.exit(1);
  }
} else {
  console.warn('⚠️  No sample file found');
  console.log('🎉 Build completed successfully!');
}