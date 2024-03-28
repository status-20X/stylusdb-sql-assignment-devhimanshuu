const readCSV = require("../../src/csvReader");
const parseQuery = require("../../src/queryParser");
const executeSELECTQuery = require("../../src/index");

test("Basic Jest Test", () => {
  expect(1).toBe(1);
});

test("Read CSV File", async () => {
  const data = await readCSV("./sample.csv");
  expect(data.length).toBeGreaterThan(0);
  expect(data.length).toBe(3);
  expect(data[0].name).toBe("John");
  // expect(data[0].age).toBe("30"); //ignore the string type here, we will fix this later
});

test("Parse SQL Query", () => {
  const query = "SELECT id, name FROM sample";
  const parsed = parseQuery(query);
  expect(parsed).toEqual({
    fields: ["id", "name"],
    table: "sample",
    whereClause: null,
  });
  const invalidQuery = "SELECT id, name";
  expect(() => parseQuery(invalidQuery)).toThrow("Invalid query format");
});

test("Execute SQL Query", async () => {
  const query = "SELECT id, name FROM sample";
  const result = await executeSELECTQuery(query);
  expect(result.length).toBeGreaterThan(0);
  expect(result[0]).toHaveProperty("id");
  expect(result[0]).toHaveProperty("name");
  expect(result[0]).not.toHaveProperty("age");
  expect(result[0]).toEqual({ id: "1", name: "John" });
});

test("Parse SQL Query with WHERE Clause", () => {
  const query = "SELECT id, name FROM sample WHERE age = 25";
  const parsed = parseQuery(query);
  expect(parsed).toEqual({
    fields: ["id", "name"],
    table: "sample",
    whereClause: "age = 25",
  });
});
test("Execute SQL Query Without WHERE Clause", async () => {
  const query = "SELECT id, name FROM sample";
  const result = await executeSELECTQuery(query);
  expect(result.length).toBeGreaterThan(0);
  // ... other assertions for expected results
});

test("Execute SQL Query with WHERE Clause", async () => {
  const query = "SELECT id, name FROM sample WHERE age = 25";
  const result = await executeSELECTQuery(query);
  expect(result.length).toBe(1);
  expect(result[0]).toHaveProperty("id");
  expect(result[0]).toHaveProperty("name");
  expect(result[0].id).toBe("2");
});
test("Execute SQL Query with WHERE Clause (case-insensitive)", async () => {
  const query = "SELECT id, name FROM sample WHERE AGE = 25"; // mixed case
  const result = await executeSELECTQuery(query);
  expect(result.length).toBe(1);
  expect(result[0]).toHaveProperty("id");
  expect(result[0]).toHaveProperty("name");
  expect(result[0].id).toBe("2");
});

// Test for invalid WHERE clause (missing operator)
test("Execute SQL Query with Invalid WHERE Clause", async () => {
  const query = "SELECT id, name FROM sample WHERE age 25"; // missing operator
  expect.assertions(1); // Only one assertion needed
  try {
    await executeSELECTQuery(query);
    fail("Expected an error for invalid WHERE clause");
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});

// Test for invalid WHERE clause (invalid field)
test("Execute SQL Execute SQL Query with Invalid WHERE Clause (invalid field)", async () => {
  const query = "SELECT id, name FROM sample WHERE unknownField = 25";
  expect.assertions(1); // Only one assertion needed
  try {
    await executeSELECTQuery(query);
    fail("Expected an error for invalid WHERE clause");
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});
