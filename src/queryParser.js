// src/queryParser.js

function parseQuery(query) {
  query = query.trim();

  let selectPart, fromPart;
  const whereSplit = query.split(/\sWHERE\s/i);
  query = whereSplit[0];
  const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;

  const joinSplit = query.split(/\sINNER JOIN\s/i);
  selectPart = joinSplit[0].trim();
  const joinPart = joinSplit.length > 1 ? joinSplit[1].trim() : null;

  const selectRegex = /^SELECT\s(.+?)\sFROM\s(.+)/i;
  const selectMatch = selectPart.match(selectRegex);
  if (!selectMatch) {
    throw new Error("Invalid query format");
  }

  const [, fields, table] = selectMatch;

  let joinTable = null,
    joinCondition = null;
  if (joinPart) {
    const joinRegex = /^(.+?)\sON\s([\w.]+)\s*=\s*([\w.]+)/i;
    const joinMatch = joinPart.match(joinRegex);
    if (!joinMatch) {
      throw new Error("Invalid JOIN format");
    }

    joinTable = joinMatch[1].trim();
    joinCondition = {
      left: joinMatch[2].trim(),
      right: joinMatch[3].trim(),
    };
  }

  let whereClauses = [];
  if (whereClause) {
    whereClauses = parseWhereClause(whereClause);
  }

  return {
    fields: fields.split(",").map((field) => field.trim()),
    table: table.trim(),
    whereClauses,
    joinTable,
    joinCondition,
  };
}
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
