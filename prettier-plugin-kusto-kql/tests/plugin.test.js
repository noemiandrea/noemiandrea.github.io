const { parsers } = require('../src/parsers');
const { printers } = require('../src/printers');
const prettier = require('prettier');

// Test the parser
describe('KQL Parser', () => {
  test('should parse simple table query', () => {
    const code = 'StormEvents | take 10';
    const ast = parsers.kusto.parse(code);
    
    expect(ast.type).toBe('Program');
    expect(ast.body).toHaveLength(1);
    expect(ast.body[0].type).toBe('Query');
    expect(ast.body[0].segments).toHaveLength(2);
  });

  test('should parse query with where clause', () => {
    const code = 'StormEvents | where State == "TEXAS" | take 5';
    const ast = parsers.kusto.parse(code);
    
    expect(ast.body[0].segments).toHaveLength(3);
    expect(ast.body[0].segments[1].type).toBe('WhereClause');
  });

  test('should handle comments', () => {
    const code = '// This is a comment\nStormEvents | take 10';
    const ast = parsers.kusto.parse(code);
    
    expect(ast.body).toHaveLength(2);
    expect(ast.body[0].type).toBe('Comment');
  });
});

// Test the formatter
describe('KQL Formatter', () => {
  test('should format simple query', () => {
    const code = 'StormEvents|take 10';
    const formatted = prettier.format(code, {
      parser: 'kusto',
      plugins: [require('../src/index.js')],
    });
    
    expect(formatted).toContain('StormEvents\n| take 10');
  });

  test('should format complex query with proper indentation', () => {
    const code = 'StormEvents|where State=="TEXAS"|project State,EventType|summarize count() by State';
    const formatted = prettier.format(code, {
      parser: 'kusto',
      plugins: [require('../src/index.js')],
    });
    
    expect(formatted).toContain('| where');
    expect(formatted).toContain('| project');
    expect(formatted).toContain('| summarize');
  });

  test('should preserve comments', () => {
    const code = '// Test comment\nStormEvents | take 10';
    const formatted = prettier.format(code, {
      parser: 'kusto',
      plugins: [require('../src/index.js')],
    });
    
    expect(formatted).toContain('// Test comment');
  });
});

// Integration tests
describe('KQL Plugin Integration', () => {
  test('should register with prettier', () => {
    const plugin = require('../src/index.js');
    
    expect(plugin.languages).toBeDefined();
    expect(plugin.parsers).toBeDefined();
    expect(plugin.printers).toBeDefined();
  });

  test('should handle file extensions', () => {
    const plugin = require('../src/index.js');
    const kqlLanguage = plugin.languages.find(lang => lang.name === 'kusto');
    
    expect(kqlLanguage.extensions).toContain('.kql');
    expect(kqlLanguage.extensions).toContain('.kusto');
  });
});