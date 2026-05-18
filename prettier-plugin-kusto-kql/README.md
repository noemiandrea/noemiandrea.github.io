# Prettier Plugin for Kusto KQL

A [Prettier](https://prettier.io/) plugin for formatting [Kusto Query Language (KQL)](https://docs.microsoft.com/en-us/azure/data-explorer/kusto/query/) code. This plugin provides automatic formatting for KQL queries with proper indentation, spacing, and line breaks.

## Features

- 🎯 **Smart formatting** of KQL queries with proper indentation
- 🔧 **Pipe operator formatting** with consistent line breaks
- 📝 **Comment preservation** 
- 🎨 **Multi-line operator support** (summarize, project, join, etc.)
- ⚙️ **Configurable** with Prettier options
- 🔌 **Monaco Kusto integration** for syntax understanding

## Installation

```bash
npm install --save-dev prettier prettier-plugin-kusto-kql
```

## Usage

### Command Line

```bash
# Format a single file
npx prettier --write query.kql

# Format all KQL files
npx prettier --write "**/*.kql"
```

### Programmatically

```javascript
const prettier = require('prettier');

const code = `StormEvents|where State=="TEXAS"|take 10`;

const formatted = prettier.format(code, {
  parser: 'kusto',
  plugins: ['prettier-plugin-kusto-kql'],
});

console.log(formatted);
// Output:
// StormEvents
// | where State == "TEXAS"
// | take 10
```

### Editor Integration

#### VS Code

1. Install the Prettier extension
2. Add to your `settings.json`:

```json
{
  "prettier.documentSelectors": ["**/*.kql"],
  "[kusto]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Supported File Extensions

- `.kql`
- `.kusto`

## Configuration

The plugin supports standard Prettier configuration options:

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Examples

### Input

```kql
StormEvents|where State=="TEXAS"|project State,EventType,DamageProperty|summarize TotalDamage=sum(DamageProperty),EventCount=count() by EventType|order by TotalDamage desc|take 10
```

### Output

```kql
StormEvents
| where State == "TEXAS"
| project State,
    EventType,
    DamageProperty
| summarize TotalDamage = sum(DamageProperty),
    EventCount = count() by EventType
| order by TotalDamage desc
| take 10
```

### Complex Query

#### Input
```kql
StormEvents|where StartTime >= datetime(2007-01-01)|join kind=inner (PopulationData|project State,Population) on State|extend DamagePerCapita = DamageProperty / Population|summarize AvgDamagePerCapita=avg(DamagePerCapita) by State|order by AvgDamagePerCapita desc
```

#### Output
```kql
StormEvents
| where StartTime >= datetime(2007-01-01)
| join kind=inner (
    PopulationData
    | project State,
        Population
) on State
| extend DamagePerCapita = DamageProperty / Population
| summarize AvgDamagePerCapita = avg(DamagePerCapita) by State
| order by AvgDamagePerCapita desc
```

## Development

### Setup

```bash
git clone <repository>
cd prettier-plugin-kusto-kql
npm install
```

### Testing

```bash
# Run tests
npm test

# Run development server
npm run dev

# Build and test
npm run build
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for your changes
4. Ensure all tests pass
5. Submit a pull request

## Architecture

The plugin consists of three main components:

### Parser (`src/parsers.js`)
- Tokenizes KQL code
- Builds an Abstract Syntax Tree (AST)
- Identifies KQL operators and structures
- Uses simplified parsing for robust formatting

### Printer (`src/printers.js`)
- Converts AST back to formatted code
- Handles indentation and line breaks
- Manages operator-specific formatting rules
- Preserves comments and structure

### Plugin Entry (`src/index.js`)
- Registers the plugin with Prettier
- Defines supported languages and file extensions
- Connects parser and printer

## Supported KQL Operations

- ✅ **Table references**
- ✅ **Pipe operators** (`|`)
- ✅ **Filter operations** (`where`)
- ✅ **Projection** (`project`)
- ✅ **Aggregation** (`summarize`)
- ✅ **Joins** (`join`)
- ✅ **Unions** (`union`)
- ✅ **Sorting** (`order by`, `sort by`)
- ✅ **Limiting** (`take`, `top`)
- ✅ **Extension** (`extend`)
- ✅ **Distinct** (`distinct`)
- ✅ **Comments** (`//`)

## Limitations

- Complex nested expressions may need manual formatting
- Some advanced KQL features might not be perfectly formatted
- Plugin focuses on common query patterns

## License

MIT

## Related Projects

- [@kusto/monaco-kusto](https://www.npmjs.com/package/@kusto/monaco-kusto) - Monaco editor language support for KQL
- [Prettier](https://prettier.io/) - Code formatter
- [Azure Data Explorer](https://azure.microsoft.com/en-us/services/data-explorer/) - Azure's data analytics service