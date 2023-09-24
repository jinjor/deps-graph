import assert from "node:assert";
import { describe, test } from "node:test";
import { newGraph, add, getRows } from "../dist";

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
});
