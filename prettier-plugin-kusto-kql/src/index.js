const { parsers } = require('./parsers');
const { printers } = require('./printers');

module.exports = {
  languages: [
    {
      name: 'kusto',
      aliases: ['kql', 'kusto-query'],
      extensions: ['.kql', '.kusto'],
      filenames: [],
      tmScope: 'source.kusto',
      aceMode: 'text',
      codemirrorMode: 'kusto',
      codemirrorMimeType: 'text/x-kusto',
      parsers: ['kusto'],
    },
  ],
  parsers,
  printers,
};