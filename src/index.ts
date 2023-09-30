import { firstKey, nextKey } from "./key";

type DepsMap = Map<string, string[]>;
const appendToMap = (map: DepsMap, key: string, value: string) => {
  const values = map.get(key);
  if (values) {
    values.push(value);
  } else {
    map.set(key, [value]);
  }
};
const cloneMap = (map: DepsMap): DepsMap => {
  const newMap = new Map<string, string[]>();
  for (const [key, value] of map) {
    newMap.set(key, [...value]);
  }
  return newMap;
};

type List<T> = Cons<T> | null;
type Cons<T> = {
  value: T;
  next: List<T>;
};
type SortingItem = {
  values: string[];
  key: string;
  waiting: Set<string>;
};
const toArray = <T>(list: List<T>): T[] => {
  const result: T[] = [];
  while (list) {
    result.push(list.value);
    list = list.next;
  }
  return result;
};

export class Graph {
  private map: DepsMap = new Map();
  private inverseMap: DepsMap = new Map();
  private relations: Set<string> = new Set();
  hasRelation(from: string, to: string): boolean {
    return this.relations.has(`${from} ${to}`);
  }
  hasNode(node: string): boolean {
    return this.map.has(node) || this.inverseMap.has(node);
  }
  add(from: string, to: string): boolean {
    if (this.hasRelation(from, to)) {
      return false;
    }
    appendToMap(this.map, from, to);
    appendToMap(this.inverseMap, to, from);
    this.relations.add(`${from} ${to}`);
    return true;
  }
  from(...from: string[]): Graph {
    const newGraph = new Graph();
    const collect = (node: string) => {
      const nextNodes = this.map.get(node);
      if (!nextNodes) {
        return;
      }
      for (const nextNode of nextNodes) {
        const added = newGraph.add(node, nextNode);
        if (!added) {
          continue;
        }
        collect(nextNode);
      }
    };
    from.forEach(collect);
    return newGraph;
  }
  to(...to: string[]): Graph {
    const newGraph = new Graph();
    const collect = (node: string) => {
      const prevNodes = this.inverseMap.get(node);
      if (!prevNodes) {
        return;
      }
      for (const prevNode of prevNodes) {
        const added = newGraph.add(prevNode, node);
        if (!added) {
          continue;
        }
        collect(prevNode);
      }
    };
    to.forEach(collect);
    return newGraph;
  }
  isReachable(from: string, to: string, visited = new Set<string>()): boolean {
    if (visited.has(from)) {
      return false;
    }
    visited.add(from);
    const nextNodes = this.map.get(from);
    if (!nextNodes) {
      return false;
    }
    for (const nextNode of nextNodes) {
      if (nextNode === to) {
        return true;
      }
      if (this.isReachable(nextNode, to, visited)) {
        return true;
      }
    }
    return false;
  }
  getRows(): string[] {
    const rows: string[] = [];
    const map = cloneMap(this.map);
    const inverseMap = cloneMap(this.inverseMap);

    const findFirstNode = () => {
      return [...map.keys()].find((key) => !inverseMap.has(key));
    };
    const collect = (node: string) => {
      rows.push(node);
      const nextNodes = map.get(node);
      if (!nextNodes) {
        return;
      }
      for (const nextNode of nextNodes) {
        const inverseValues = inverseMap.get(nextNode)!;
        inverseValues.splice(inverseValues.indexOf(node), 1);
        if (inverseValues.length === 0) {
          inverseMap.delete(nextNode);
          collect(nextNode);
        }
      }
      map.delete(node);
    };
    while (true) {
      const node = findFirstNode();
      if (!node) {
        break;
      }
      collect(node);
    }
    if (map.size > 0 || inverseMap.size > 0) {
      throw new Error("Circular dependency detected");
    }
    return rows;
  }
  getCols(): string[][] {
    const cols: string[][] = [];
    const { map } = this;
    const inverseMap = cloneMap(this.inverseMap);
    const visited = new Set<string>();

    const collect = (node: string, index = 0, prev?: string) => {
      if (visited.has(node)) {
        return;
      }
      const existing = cols[index];
      if (existing) {
        if (
          prev &&
          (existing.some((item) => this.hasRelation(item, prev)) ||
            existing.some((item) => this.isReachable(item, prev)))
        ) {
          cols.splice(index, 0, [node]);
        } else {
          existing.push(node);
        }
      } else {
        cols.push([node]);
      }
      visited.add(node);

      const nextNodes = inverseMap.get(node);
      if (!nextNodes) {
        return;
      }
      nextNodes.reverse();
      for (const nextNode of nextNodes) {
        collect(nextNode, index + 1, node);
      }
    };

    const firstNodes = [...inverseMap.keys()].filter((key) => !map.has(key));
    firstNodes.reverse();
    for (const node of firstNodes) {
      collect(node);
    }
    cols.reverse();
    return cols;
  }
  getCols2(rows: string[]): string[][] {
    const lastWaiters = new Map<string, Cons<SortingItem>>();
    let items: Cons<SortingItem> = {
      value: {
        values: [],
        key: firstKey,
        waiting: new Set<string>(),
      },
      next: null,
    };
    const add = (node: string) => {
      let lastWaiter = lastWaiters.get(node);
      lastWaiters.delete(node);
      if (lastWaiter) {
        lastWaiter.value.waiting.delete(node);
      }

      let target: Cons<SortingItem>;
      if (lastWaiter == null) {
        items = {
          value: {
            values: [],
            key: nextKey(null, items.value.key),
            waiting: new Set<string>(),
          },
          next: items,
        };
        target = items;
      } else {
        if (lastWaiter.next == null) {
          lastWaiter.next = {
            value: {
              values: [],
              key: nextKey(lastWaiter.value.key, null),
              waiting: new Set<string>(),
            },
            next: null,
          };
        }
        if (lastWaiter.next.value.waiting.size > 0) {
          lastWaiter.next = {
            value: {
              values: [],
              key: nextKey(lastWaiter.value.key, lastWaiter.next.value.key),
              waiting: new Set<string>(),
            },
            next: lastWaiter.next,
          };
        }
        target = lastWaiter.next;
      }
      target.value.values.push(node);
      const nextNodes = this.map.get(node) ?? [];
      for (const nextNode of nextNodes) {
        if (
          !lastWaiters.has(nextNode) ||
          lastWaiters.get(nextNode)!.value.key < target.value.key
        ) {
          target.value.waiting.add(nextNode);
          lastWaiters.set(nextNode, target);
        }
      }
    };
    for (const row of rows) {
      add(row);
    }
    return toArray(items).map((item) => item.values);
  }

  *getLines(): Generator<string> {
    const rows = this.getRows();
    // const cols = this.getCols();
    const cols = this.getCols2(rows);
    const rowContext = Array.from({ length: cols.length }).map(
      () => new Set<string>()
    );
    for (const row of rows) {
      let line = "";
      let hit = false;
      for (let i = 0; i < cols.length; i++) {
        if (rowContext[i].has(row)) {
          rowContext[i].delete(row);
          if (rowContext[i].size === 0) {
            line += hit ? "┴" : "└";
          } else {
            line += "├";
          }
          hit = true;
        } else {
          if (cols[i].includes(row)) {
            if (process.env.MODE === "test" && rowContext[i].size > 0) {
              throw new Error("Unexpected pattern");
            }
            line += "◊";
            hit = false;
            for (const toBeFound of this.map.get(row) ?? []) {
              rowContext[i].add(toBeFound);
            }
          } else {
            if (rowContext[i].size > 0) {
              line += "│";
            } else {
              line += hit ? "─" : " ";
            }
          }
        }
      }
      line += " " + row;
      yield line;
    }
  }
}
