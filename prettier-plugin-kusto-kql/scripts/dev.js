#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const plugin = require('../src/index.js');

console.log('🚀 Starting prettier-plugin-kusto-kql development server...');

// Watch for file changes and reformat
const examplesDir = path.join(__dirname, '../examples');
const srcDir = path.join(__dirname, '../src');

async function formatAllExamples() {
  if (!fs.existsSync(examplesDir)) {
    console.log('📁 Creating examples directory...');
    fs.mkdirSync(examplesDir, { recursive: true });
    return;
  }

  const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.kql') && !f.endsWith('.formatted.kql'));
  
  for (const file of files) {
    try {
      const filePath = path.join(examplesDir, file);
      const code = fs.readFileSync(filePath, 'utf8');
      
      console.log(`🔧 Formatting ${file}...`);
      
      const formatted = await prettier.format(code, {
        parser: 'kusto',
        plugins: [plugin],
        printWidth: 80,
        tabWidth: 2,
      });
      
      const outputFile = path.join(examplesDir, file.replace('.kql', '.formatted.kql'));
      fs.writeFileSync(outputFile, formatted);
      
      console.log(`✅ ${file} -> ${path.basename(outputFile)}`);
    } catch (error) {
      console.error(`❌ Error formatting ${file}:`, error.message);
    }
  }
}

async function testQuery() {
  // Test with simple query
  const testQuery = `StormEvents|where State=="TEXAS"|project State,EventType,DamageProperty|summarize TotalDamage=sum(DamageProperty) by EventType|order by TotalDamage desc|take 5`;

  console.log('\n📝 Testing with sample query:');
  console.log('Input:', testQuery);

  try {
    const formatted = await prettier.format(testQuery, {
      parser: 'kusto',
      plugins: [plugin],
      printWidth: 80,
    });
    console.log('Output:\n', formatted);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  // Initial format
  await formatAllExamples();
  await testQuery();
  console.log('\n✨ Development server ready! Modify files in src/ or examples/ to test changes.');
}

main().catch(console.error);