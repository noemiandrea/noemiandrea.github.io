// Optional dependency - fallback if not available
let KustoParser = null;
try {
  const monacoKusto = require('@kusto/monaco-kusto');
  KustoParser = monacoKusto.KustoParser;
} catch (error) {
  // Monaco-kusto not available, use standalone parser
  console.warn('Warning: @kusto/monaco-kusto not found, using standalone parser');
}

/**
 * Simplified AST node types for KQL formatting
 */
const NODE_TYPES = {
  PROGRAM: 'Program',
  QUERY: 'Query',
  PIPE: 'Pipe',
  OPERATOR: 'Operator',
  FUNCTION_CALL: 'FunctionCall',
  IDENTIFIER: 'Identifier',
  LITERAL: 'Literal',
  PARAMETER: 'Parameter',
  COMMENT: 'Comment',
  EXPRESSION: 'Expression',
  WHERE_CLAUSE: 'WhereClause',
  PROJECT_CLAUSE: 'ProjectClause',
  SUMMARIZE_CLAUSE: 'SummarizeClause',
  JOIN_CLAUSE: 'JoinClause',
  UNION_CLAUSE: 'UnionClause',
  ORDER_BY_CLAUSE: 'OrderByClause',
  TAKE_CLAUSE: 'TakeClause',
  TOP_CLAUSE: 'TopClause',
  EXTEND_CLAUSE: 'ExtendClause',
  DISTINCT_CLAUSE: 'DistinctClause',
};

/**
 * Simple tokenizer for KQL
 */
function tokenize(text) {
  const tokens = [];
  const lines = text.split('\n');
  
  let currentQuery = null;
  
  lines.forEach((line, lineNumber) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      if (currentQuery) {
        tokens.push({
          type: 'QUERY_END',
          line: lineNumber,
        });
        currentQuery = null;
      }
      return;
    }
    
    // Handle comments
    if (trimmedLine.startsWith('//')) {
      tokens.push({
        type: 'COMMENT',
        value: line,
        line: lineNumber,
        column: line.indexOf('//'),
      });
      return;
    }
    
    // Split by pipe operator to identify query segments
    const parts = line.split('|');
    parts.forEach((part, index) => {
      const trimmedPart = part.trim();
      if (trimmedPart) {
        tokens.push({
          type: 'QUERY_SEGMENT',
          value: trimmedPart,
          line: lineNumber,
          column: line.indexOf(part),
        });
        currentQuery = true;
      }
      
      if (index < parts.length - 1) {
        tokens.push({
          type: 'PIPE',
          value: '|',
          line: lineNumber,
          column: line.indexOf('|', line.indexOf(part) + part.length),
        });
      }
    });
  });
  
  // End any remaining query
  if (currentQuery) {
    tokens.push({
      type: 'QUERY_END',
      line: lines.length,
    });
  }
  
  return tokens;
}

/**
 * Parse KQL query into AST
 */
function parseKQL(text) {
  const tokens = tokenize(text);
  const ast = {
    type: NODE_TYPES.PROGRAM,
    body: [],
    tokens,
  };
  
  let currentQuery = null;
  
  tokens.forEach(token => {
    switch (token.type) {
      case 'QUERY_SEGMENT':
        const segment = parseQuerySegment(token.value);
        if (!currentQuery) {
          currentQuery = {
            type: NODE_TYPES.QUERY,
            segments: [segment],
            line: token.line,
          };
        } else {
          currentQuery.segments.push(segment);
        }
        break;
        
      case 'PIPE':
        // Pipe continues the current query
        break;
        
      case 'COMMENT':
        ast.body.push({
          type: NODE_TYPES.COMMENT,
          value: token.value,
          line: token.line,
        });
        break;
        
      case 'QUERY_END':
        if (currentQuery) {
          ast.body.push(currentQuery);
          currentQuery = null;
        }
        break;
    }
  });
  
  // Add any remaining query
  if (currentQuery) {
    ast.body.push(currentQuery);
  }
  
  return ast;
}

/**
 * Parse individual query segment
 */
function parseQuerySegment(segment) {
  const trimmed = segment.trim();
  
  // Identify common KQL operators
  const operators = [
    'where', 'project', 'summarize', 'join', 'union', 
    'order by', 'sort by', 'take', 'top', 'extend', 
    'distinct', 'count', 'evaluate', 'render'
  ];
  
  const lowerSegment = trimmed.toLowerCase();
  const foundOperator = operators.find(op => lowerSegment.startsWith(op));
  
  if (foundOperator) {
    return {
      type: getOperatorNodeType(foundOperator),
      operator: foundOperator,
      expression: trimmed.substring(foundOperator.length).trim(),
      raw: trimmed,
    };
  }
  
  // If no operator found, treat as table name or expression
  return {
    type: NODE_TYPES.EXPRESSION,
    value: trimmed,
    raw: trimmed,
  };
}

/**
 * Get AST node type for operator
 */
function getOperatorNodeType(operator) {
  switch (operator.toLowerCase()) {
    case 'where': return NODE_TYPES.WHERE_CLAUSE;
    case 'project': return NODE_TYPES.PROJECT_CLAUSE;
    case 'summarize': return NODE_TYPES.SUMMARIZE_CLAUSE;
    case 'join': return NODE_TYPES.JOIN_CLAUSE;
    case 'union': return NODE_TYPES.UNION_CLAUSE;
    case 'order by':
    case 'sort by': return NODE_TYPES.ORDER_BY_CLAUSE;
    case 'take': return NODE_TYPES.TAKE_CLAUSE;
    case 'top': return NODE_TYPES.TOP_CLAUSE;
    case 'extend': return NODE_TYPES.EXTEND_CLAUSE;
    case 'distinct': return NODE_TYPES.DISTINCT_CLAUSE;
    default: return NODE_TYPES.OPERATOR;
  }
}

/**
 * Main parser function for Prettier
 */
function parse(text, parsers, options) {
  try {
    return parseKQL(text);
  } catch (error) {
    // Fallback to simple text parsing if KQL parsing fails
    return {
      type: NODE_TYPES.PROGRAM,
      body: [{
        type: NODE_TYPES.EXPRESSION,
        value: text,
        raw: text,
      }],
      tokens: [],
    };
  }
}

module.exports = {
  parsers: {
    kusto: {
      parse,
      astFormat: 'kusto-ast',
      locStart: (node) => node.start || 0,
      locEnd: (node) => node.end || 0,
    },
  },
  NODE_TYPES,
};