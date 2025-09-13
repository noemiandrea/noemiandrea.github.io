#!/usr/bin/env node

/**
 * Simple usage example for prettier-plugin-kusto-kql
 */

const prettier = require('prettier');
const plugin = require('../src/index.js');

// Example KQL query that needs formatting
const messyKQL = `
StormEvents|where State=="TEXAS"|project State,EventType,DamageProperty|summarize TotalDamage=sum(DamageProperty) by EventType|order by TotalDamage desc|take 10
`;

console.log('Original KQL:');
console.log(messyKQL);

prettier.format(messyKQL.trim(), {
  parser: 'kusto',
  plugins: [plugin],
}).then(formatted => {
  console.log('\nFormatted KQL:');
  console.log(formatted);
}).catch(console.error);