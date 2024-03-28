const parseQuery = require("./queryParser");
const readCSV = require("./csvReader");

async function executeSELECTQuery(query) {
  const { fields, table, whereClause } = parseQuery(query);
  const data = await readCSV(`${table}.csv`);

  const filteredData = whereClause
    ? data.filter((row) => {
        const [field, value] = whereClause
          .split("=")
          .map((s) => s.trim().toLowerCase());
        if (!data[0].hasOwnProperty(field)) {
          throw new Error("Invalid field in WHERE clause");
        }
        return row[field].toLowerCase() === value;
      })
    : data;

  // Selecting the specified fields
  return filteredData.map((row) => {
    const selectedRow = {};
    fields.forEach((field) => {
      selectedRow[field] = row[field];
    });
    return selectedRow;
  });
}

module.exports = executeSELECTQuery;
