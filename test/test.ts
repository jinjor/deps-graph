import assert from "node:assert";
import { describe, test } from "node:test";
import { Graph } from "../dist";

describe("add", () => {
  test("add", () => {
    const graph = new Graph();
    assert.strictEqual(graph.add("a", "b"), true);
    assert.strictEqual(graph.add("a", "b"), false);
  });
});

describe("from", () => {
  test("1/2", () => {
    const graph = new Graph();
    graph.add("a", "b");
    const newGraph = graph.from("a");
    assert.strictEqual(newGraph.has("a", "b"), true);
  });
  test("2/2", () => {
    const graph = new Graph();
    graph.add("a", "b");
    const newGraph = graph.from("b");
    assert.strictEqual(newGraph.has("a", "b"), false);
  });
  test("?/2", () => {
    const graph = new Graph();
    graph.add("a", "b");
    const newGraph = graph.from("c");
    assert.strictEqual(newGraph.has("a", "b"), false);
  });
  test("1/3", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("b", "c");
    const newGraph = graph.from("a");
    assert.strictEqual(newGraph.has("b", "c"), true);
    assert.strictEqual(newGraph.has("a", "b"), true);
  });
  test("2/3", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("b", "c");
    const newGraph = graph.from("b");
    assert.strictEqual(newGraph.has("b", "c"), true);
    assert.strictEqual(newGraph.has("a", "b"), false);
  });
  test("multi inputs", () => {
    const graph = new Graph();
    graph.add("a", "c");
    graph.add("b", "c");
    const newGraph = graph.from("b");
    assert.strictEqual(newGraph.has("a", "c"), false);
    assert.strictEqual(newGraph.has("b", "c"), true);
  });
  test("multi inputs, from both", () => {
    const graph = new Graph();
    graph.add("a", "c");
    graph.add("b", "c");
    const newGraph = graph.from("a", "b");
    assert.strictEqual(newGraph.has("a", "c"), true);
    assert.strictEqual(newGraph.has("b", "c"), true);
  });
  test("multi outputs", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("a", "c");
    const newGraph = graph.from("a");
    assert.strictEqual(newGraph.has("a", "b"), true);
    assert.strictEqual(newGraph.has("a", "c"), true);
  });
});

describe("to", () => {
  test("1/2", () => {
    const graph = new Graph();
    graph.add("a", "b");
    const newGraph = graph.to("a");
    assert.strictEqual(newGraph.has("a", "b"), false);
  });
  test("2/2", () => {
    const graph = new Graph();
    graph.add("a", "b");
    const newGraph = graph.to("b");
    assert.strictEqual(newGraph.has("a", "b"), true);
  });
  test("?/2", () => {
    const graph = new Graph();
    graph.add("a", "b");
    const newGraph = graph.to("c");
    assert.strictEqual(newGraph.has("a", "b"), false);
  });
  test("2/3", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("b", "c");
    const newGraph = graph.to("b");
    assert.strictEqual(newGraph.has("a", "b"), true);
    assert.strictEqual(newGraph.has("b", "c"), false);
  });
  test("3/3", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("b", "c");
    const newGraph = graph.to("c");
    assert.strictEqual(newGraph.has("b", "c"), true);
    assert.strictEqual(newGraph.has("a", "b"), true);
  });
  test("multi inputs", () => {
    const graph = new Graph();
    graph.add("a", "c");
    graph.add("b", "c");
    const newGraph = graph.to("c");
    assert.strictEqual(newGraph.has("a", "c"), true);
    assert.strictEqual(newGraph.has("b", "c"), true);
  });
  test("multi outputs", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("a", "c");
    const newGraph = graph.to("b");
    assert.strictEqual(newGraph.has("a", "b"), true);
    assert.strictEqual(newGraph.has("a", "c"), false);
  });
  test("multi outputs, to both", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("a", "c");
    const newGraph = graph.to("b", "c");
    assert.strictEqual(newGraph.has("a", "b"), true);
    assert.strictEqual(newGraph.has("a", "c"), true);
  });
});

describe("getRows", () => {
  test("empty", () => {
    const graph = new Graph();
    assert.deepStrictEqual(graph.getRows(), []);
  });
  test("single", () => {
    const graph = new Graph();
    graph.add("a", "b");
    assert.deepStrictEqual(graph.getRows(), ["a", "b"]);
  });
  test("multi inputs", () => {
    const graph = new Graph();
    graph.add("a", "c");
    graph.add("b", "c");
    assert.deepStrictEqual(graph.getRows(), ["a", "b", "c"]);
  });
  test("multi outputs", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("a", "c");
    assert.deepStrictEqual(graph.getRows(), ["a", "b", "c"]);
  });
  test("triangle", () => {
    const graph = new Graph();
    graph.add("b", "c");
    graph.add("a", "b");
    graph.add("a", "c");
    assert.deepStrictEqual(graph.getRows(), ["a", "b", "c"]);
  });
  test("diamond", () => {
    const graph = new Graph();
    graph.add("b", "d");
    graph.add("c", "d");
    graph.add("a", "b");
    graph.add("a", "c");
    assert.deepStrictEqual(graph.getRows(), ["a", "b", "c", "d"]);
  });
  test("circular 1", () => {
    const graph = new Graph();
    graph.add("a", "a");
    assert.throws(() => graph.getRows());
  });
  test("circular 2", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("b", "a");
    assert.throws(() => graph.getRows());
  });
  test("circular 3", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("b", "c");
    graph.add("c", "a");
    assert.throws(() => graph.getRows());
  });
});

describe("getCols", () => {
  test("empty", () => {
    const graph = new Graph();
    assert.deepStrictEqual(graph.getCols(), []);
  });
  test("single", () => {
    const graph = new Graph();
    graph.add("a", "b");
    assert.deepStrictEqual(graph.getCols(), [["a"], ["b"]]);
  });
  test("multi inputs", () => {
    const graph = new Graph();
    graph.add("a", "c");
    graph.add("b", "c");
    assert.deepStrictEqual(graph.getCols(), [["b"], ["a"], ["c"]]);
  });
  test("multi outputs", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("a", "c");
    assert.deepStrictEqual(graph.getCols(), [["a"], ["c", "b"]]);
  });
  test("triangle", () => {
    const graph = new Graph();
    graph.add("b", "c");
    graph.add("a", "b");
    graph.add("a", "c");
    assert.deepStrictEqual(graph.getCols(), [["a"], ["b"], ["c"]]);
  });
  test("diamond", () => {
    const graph = new Graph();
    graph.add("b", "d");
    graph.add("c", "d");
    graph.add("a", "b");
    graph.add("a", "c");
    assert.deepStrictEqual(graph.getCols(), [["a"], ["c"], ["b"], ["d"]]);
  });
  test("hexagon", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("b", "c");
    graph.add("c", "d");
    graph.add("a", "e");
    graph.add("e", "f");
    graph.add("f", "d");
    assert.deepStrictEqual(graph.getCols(), [
      ["a"],
      ["e"],
      ["f", "b"],
      ["c"],
      ["d"],
    ]);
  });
  test("circular 1", () => {
    const graph = new Graph();
    graph.add("a", "a");
    assert.doesNotThrow(() => graph.getCols());
  });
  test("circular 2", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("b", "a");
    assert.doesNotThrow(() => graph.getCols());
  });
  test("circular 3", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("b", "c");
    graph.add("c", "a");
    assert.doesNotThrow(() => graph.getCols());
  });
});

describe("getLines", () => {
  test("empty", () => {
    const graph = new Graph();
    assert.deepStrictEqual([...graph.getLines()], []);
  });
  test("complex (preview)", () => {
    const graph = new Graph();
    graph.add("a", "b");
    graph.add("b", "d");
    graph.add("b", "c");
    graph.add("b", "h");
    graph.add("c", "d");
    graph.add("d", "e");
    graph.add("f", "g");
    graph.add("g", "h");
    graph.add("h", "e");
    graph.add("h", "i");
    graph.add("i", "j");
    graph.add("j", "e");
    graph.add("k", "g");
    graph.add("k", "i");
    graph.add("k", "h");
    for (const line of graph.getLines()) {
      console.log(line);
    }
  });
});
