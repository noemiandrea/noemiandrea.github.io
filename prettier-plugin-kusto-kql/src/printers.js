const { NODE_TYPES } = require('./parsers');

/**
 * Format KQL operators with proper spacing and indentation
 */
function formatOperator(node, options) {
  const { operator, expression } = node;
  
  if (!expression) {
    return operator;
  }
  
  // Multi-line operators that should be indented
  const multiLineOperators = ['summarize', 'project', 'join', 'union'];
  
  if (multiLineOperators.includes(operator.toLowerCase())) {
    // Check if expression contains commas (multiple items)
    if (expression.includes(',')) {
      const items = expression.split(',').map(item => item.trim());
      return operator + '\n    ' + items.join(',\n    ');
    }
  }
  
  // For simple expressions, keep on same line with space
  return operator + ' ' + expression;
}

/**
 * Format KQL query segments
 */
function formatQuery(node, options) {
  const { segments } = node;
  
  if (!segments || segments.length === 0) {
    return '';
  }
  
  // Format first segment (usually table name)
  const formattedSegments = segments.map((segment, index) => {
    if (index === 0) {
      // First segment is usually the table name
      return segment.raw || segment.value;
    }
    
    // Format operator segments
    return formatOperator(segment, options);
  });
  
  // Join segments with pipe operator and proper line breaks
  if (formattedSegments.length === 1) {
    return formattedSegments[0];
  }
  
  return formattedSegments[0] + 
    formattedSegments.slice(1).map(segment => 
      '\n| ' + segment
    ).join('');
}

/**
 * Format comments
 */
function formatComment(node, options) {
  return node.value;
}

/**
 * Format expressions
 */
function formatExpression(node, options) {
  return node.value || node.raw;
}

/**
 * Main print function for the AST
 */
function print(path, options, print) {
  const node = path.getValue();
  
  if (!node) {
    return '';
  }
  
  switch (node.type) {
    case NODE_TYPES.PROGRAM:
      const bodyResults = [];
      if (node.body && Array.isArray(node.body)) {
        for (const item of node.body) {
          if (item.type === NODE_TYPES.QUERY) {
            bodyResults.push(formatQuery(item, options));
          } else if (item.type === NODE_TYPES.COMMENT) {
            bodyResults.push(formatComment(item, options));
          } else if (item.type === NODE_TYPES.EXPRESSION) {
            bodyResults.push(formatExpression(item, options));
          } else {
            bodyResults.push(item.raw || item.value || '');
          }
        }
      }
      return bodyResults.join('\n') + '\n';
      
    case NODE_TYPES.QUERY:
      return formatQuery(node, options);
      
    case NODE_TYPES.COMMENT:
      return formatComment(node, options);
      
    case NODE_TYPES.EXPRESSION:
      return formatExpression(node, options);
      
    case NODE_TYPES.WHERE_CLAUSE:
    case NODE_TYPES.PROJECT_CLAUSE:
    case NODE_TYPES.SUMMARIZE_CLAUSE:
    case NODE_TYPES.JOIN_CLAUSE:
    case NODE_TYPES.UNION_CLAUSE:
    case NODE_TYPES.ORDER_BY_CLAUSE:
    case NODE_TYPES.TAKE_CLAUSE:
    case NODE_TYPES.TOP_CLAUSE:
    case NODE_TYPES.EXTEND_CLAUSE:
    case NODE_TYPES.DISTINCT_CLAUSE:
    case NODE_TYPES.OPERATOR:
      return formatOperator(node, options);
      
    default:
      // Fallback for unknown node types
      return node.raw || node.value || '';
  }
}

/**
 * Check if node can be embedded (for mixed-language files)
 */
function embed(path, options) {
  return null;
}

/**
 * Insert pragma (special comments) if needed
 */
function insertPragma(text) {
  return `// prettier-ignore\n${text}`;
}

/**
 * Check if text has pragma
 */
function hasPragma(text) {
  return text.includes('prettier-ignore');
}

module.exports = {
  printers: {
    'kusto-ast': {
      print,
      embed,
      insertPragma,
      hasPragma,
    },
  },
};