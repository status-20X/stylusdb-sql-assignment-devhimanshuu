function parseQuery(query) {
  const selectRegex = /SELECT (.+?) FROM (.+?)(?: WHERE (.*))?$/i;
  const match = query.match(selectRegex);

  if (match) {
    const [, fields, table, whereString] = match;
    const whereClauses = whereString ? parseWhereClause(whereString) : [];
    return {
      fields: fields.split(",").map((field) => field.trim()),
      table: table.trim(),
      whereClauses,
    };
  } else {
    throw new Error("Invalid query format");
  }
}

// src/queryParser.js

function parseWhereClause(whereString) {
  const conditions = whereString.split(/ AND | OR /i);
  const whereClauses = [];

  for (let condition of conditions) {
    const parts = condition.trim().split(/\s+/);
    // Ensure at least 3 parts (field, operator, value)
    if (parts.length < 3) {
      throw new Error(`Invalid WHERE clause syntax: ${condition}`);
    }

    const [field, operator, ...valueParts] = parts;
    if (valueParts.length === 0) {
      throw new Error(
        `Invalid condition format: Missing value after '${operator}' in '${field}'`
      );
    }
    if (!isValidOperator(operator)) {
      throw new Error(`Invalid operator in WHERE clause: ${operator}`);
    }

    const value = valueParts.join(" "); // Join remaining parts as value
    whereClauses.push({ field, operator, value });
  }

  return whereClauses;
}

function isValidOperator(operator) {
  // Define a list of supported operators
  const supportedOperators = ["=", "!=", ">", "<", ">=", "<=", "LIKE"];
  return supportedOperators.includes(operator.toUpperCase());
}

module.exports = parseQuery;
