#!/usr/bin/env node

const plugin = require('./src/index.js');

console.log('Testing KQL Prettier Plugin...');

// Test simple query
const testQuery = 'StormEvents | where State == "TEXAS" | take 10';
console.log('Input:', testQuery);

try {
  // Test parser
  const ast = plugin.parsers.kusto.parse(testQuery);
  console.log('✅ Parser works');
  console.log('AST:', JSON.stringify(ast, null, 2));
  
  // Test printer with better path simulation
  const createMockPath = (node) => ({
    getValue: () => node,
    map: (fn, prop) => {
      if (!node[prop] || !Array.isArray(node[prop])) return [];
      return node[prop].map(item => fn(createMockPath(item)));
    }
  });
  
  const mockPath = createMockPath(ast);
  const mockPrint = (path) => plugin.printers['kusto-ast'].print(path, {}, mockPrint);
  
  const formatted = plugin.printers['kusto-ast'].print(mockPath, {}, mockPrint);
  console.log('✅ Printer works');
  console.log('Formatted result type:', typeof formatted);
  console.log('Formatted length:', formatted ? formatted.length : 'null/undefined');
  console.log('Formatted:', JSON.stringify(formatted));
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}