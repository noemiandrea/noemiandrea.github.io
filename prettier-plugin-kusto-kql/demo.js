#!/usr/bin/env node

/**
 * Demo script showing the prettier-plugin-kusto-kql in action
 */

const prettier = require('prettier');
const plugin = require('./src/index.js');

console.log('🎯 Prettier Plugin for Kusto KQL - Demo\n');

const examples = [
  {
    name: 'Simple Query',
    input: 'StormEvents|take 10',
  },
  {
    name: 'Where Clause',
    input: 'StormEvents|where State=="TEXAS"|take 5',
  },
  {
    name: 'Complex Query with Multiple Operations',
    input: 'StormEvents|where StartTime >= datetime(2007-01-01)|project State,EventType,DamageProperty|summarize TotalDamage=sum(DamageProperty),EventCount=count() by EventType|order by TotalDamage desc|take 10',
  },
  {
    name: 'Query with Comments',
    input: '// Get top storm events\nStormEvents|where State=="FLORIDA"|project EventType,DamageProperty|order by DamageProperty desc',
  },
  {
    name: 'Union Query',
    input: 'union (StormEvents|where EventType=="Tornado"),(StormEvents|where EventType=="Hurricane")|summarize count() by EventType',
  },
];

async function demonstrateFormatting() {
  for (const example of examples) {
    console.log(`📝 ${example.name}`);
    console.log('─'.repeat(50));
    console.log('Input:');
    console.log(example.input);
    console.log('\nFormatted:');
    
    try {
      const formatted = await prettier.format(example.input, {
        parser: 'kusto',
        plugins: [plugin],
        printWidth: 80,
        tabWidth: 2,
      });
      
      console.log(formatted);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('\n');
  }
}

console.log('Features:');
console.log('✅ Automatic pipe operator formatting');
console.log('✅ Multi-line operator support (project, summarize, etc.)');
console.log('✅ Comment preservation');
console.log('✅ Proper indentation');
console.log('✅ KQL operator recognition');
console.log('\n');

demonstrateFormatting().then(() => {
  console.log('🎉 Demo completed!');
}).catch(console.error);