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

export class Graph {
  private map: DepsMap = new Map();
  private inverseMap: DepsMap = new Map();
  private relations: Set<string> = new Set();
  has(from: string, to: string): boolean {
    return this.relations.has(`${from} ${to}`);
  }
  add(from: string, to: string): boolean {
    if (this.has(from, to)) {
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
        if (prev && existing.some((item) => this.has(item, prev))) {
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
  *getLines(): Generator<string> {
    const rows = this.getRows();
    const cols = this.getCols();
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
