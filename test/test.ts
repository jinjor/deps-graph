import assert from "node:assert";
import { describe, test } from "node:test";
import { newGraph, add, getRows } from "../dist";
import { getCols, getLines } from "../src";

test("add", () => {
  const graph = newGraph();
  assert.strictEqual(add(graph, "a", "b"), true);
  assert.strictEqual(add(graph, "a", "b"), false);
});

describe("getRows", () => {
  test("empty", () => {
    const graph = newGraph();
    assert.deepStrictEqual(getRows(graph), []);
  });
  test("single", () => {
    const graph = newGraph();
    add(graph, "a", "b");
    assert.deepStrictEqual(getRows(graph), ["a", "b"]);
  });
  test("multi inputs", () => {
    const graph = newGraph();
    add(graph, "a", "c");
    add(graph, "b", "c");
    assert.deepStrictEqual(getRows(graph), ["a", "b", "c"]);
  });
  test("multi outputs", () => {
    const graph = newGraph();
    add(graph, "a", "b");
    add(graph, "a", "c");
    assert.deepStrictEqual(getRows(graph), ["a", "b", "c"]);
  });
  test("triangle", () => {
    const graph = newGraph();
    add(graph, "b", "c");
    add(graph, "a", "b");
    add(graph, "a", "c");
    assert.deepStrictEqual(getRows(graph), ["a", "b", "c"]);
  });
  test("diamond", () => {
    const graph = newGraph();
    add(graph, "b", "d");
    add(graph, "c", "d");
    add(graph, "a", "b");
    add(graph, "a", "c");
    assert.deepStrictEqual(getRows(graph), ["a", "b", "c", "d"]);
  });
  test("circular 1", () => {
    const graph = newGraph();
    add(graph, "a", "a");
    assert.throws(() => getRows(graph));
  });
  test("circular 2", () => {
    const graph = newGraph();
    add(graph, "a", "b");
    add(graph, "b", "a");
    assert.throws(() => getRows(graph));
  });
  test("circular 3", () => {
    const graph = newGraph();
    add(graph, "a", "b");
    add(graph, "b", "c");
    add(graph, "c", "a");
    assert.throws(() => getRows(graph));
  });
});

describe("getCols", () => {
  test("empty", () => {
    const graph = newGraph();
    assert.deepStrictEqual(getCols(graph), []);
  });
  test("single", () => {
    const graph = newGraph();
    add(graph, "a", "b");
    assert.deepStrictEqual(getCols(graph), [["a"], ["b"]]);
  });
  test("multi inputs", () => {
    const graph = newGraph();
    add(graph, "a", "c");
    add(graph, "b", "c");
    assert.deepStrictEqual(getCols(graph), [["b"], ["a"], ["c"]]);
  });
  test("multi outputs", () => {
    const graph = newGraph();
    add(graph, "a", "b");
    add(graph, "a", "c");
    assert.deepStrictEqual(getCols(graph), [["a"], ["c", "b"]]);
  });
  test("triangle", () => {
    const graph = newGraph();
    add(graph, "b", "c");
    add(graph, "a", "b");
    add(graph, "a", "c");
    assert.deepStrictEqual(getCols(graph), [["a"], ["b"], ["c"]]);
  });
  test("diamond", () => {
    const graph = newGraph();
    add(graph, "b", "d");
    add(graph, "c", "d");
    add(graph, "a", "b");
    add(graph, "a", "c");
    assert.deepStrictEqual(getCols(graph), [["a"], ["c"], ["b"], ["d"]]);
  });
  test("hexagon", () => {
    const graph = newGraph();
    add(graph, "a", "b");
    add(graph, "b", "c");
    add(graph, "c", "d");
    add(graph, "a", "e");
    add(graph, "e", "f");
    add(graph, "f", "d");
    assert.deepStrictEqual(getCols(graph), [
      ["a"],
      ["e"],
      ["f", "b"],
      ["c"],
      ["d"],
    ]);
  });
  test("circular 1", () => {
    const graph = newGraph();
    add(graph, "a", "a");
    assert.doesNotThrow(() => getCols(graph));
  });
  test("circular 2", () => {
    const graph = newGraph();
    add(graph, "a", "b");
    add(graph, "b", "a");
    assert.doesNotThrow(() => getCols(graph));
  });
  test("circular 3", () => {
    const graph = newGraph();
    add(graph, "a", "b");
    add(graph, "b", "c");
    add(graph, "c", "a");
    assert.doesNotThrow(() => getCols(graph));
  });
});

describe("getLines", () => {
  test("empty", () => {
    const graph = newGraph();
    const rows = getRows(graph);
    const cols = getCols(graph);
    assert.deepStrictEqual([...getLines(graph, rows, cols)], []);
  });
  test("complex (preview)", () => {
    const graph = newGraph();
    add(graph, "a", "b");
    add(graph, "b", "d");
    add(graph, "b", "c");
    add(graph, "b", "h");
    add(graph, "c", "d");
    add(graph, "d", "e");
    add(graph, "f", "g");
    add(graph, "g", "h");
    add(graph, "h", "e");
    add(graph, "h", "i");
    add(graph, "i", "j");
    add(graph, "j", "e");
    add(graph, "k", "g");
    add(graph, "k", "i");
    add(graph, "k", "h");
    const rows = getRows(graph);
    const cols = getCols(graph);
    for (const line of getLines(graph, rows, cols)) {
      console.log(line);
    }
  });
});
