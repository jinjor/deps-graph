import assert from "node:assert";
import test from "node:test";
import { foo } from "../dist";

test("foo", () => {
  assert.strictEqual(foo, 42);
});
