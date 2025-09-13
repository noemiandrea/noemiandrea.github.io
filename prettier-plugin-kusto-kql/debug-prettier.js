const prettier = require('prettier');
const plugin = require('./src/index.js');

async function testPrettier() {
  console.log('Testing prettier integration...');
  
  const code = 'StormEvents | where State == "TEXAS" | take 10';
  console.log('Input:', code);
  
  try {
    console.log('Available parsers:', Object.keys(plugin.parsers));
    console.log('Available printers:', Object.keys(plugin.printers));
    console.log('Languages:', plugin.languages.map(l => l.name));
    
    const result = await prettier.format(code, {
      parser: 'kusto',
      plugins: [plugin],
    });
    
    console.log('Result type:', typeof result);
    console.log('Result:', JSON.stringify(result));
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPrettier();