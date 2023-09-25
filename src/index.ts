type DepsMap = Map<string, string[]>;
type Graph = {
  map: DepsMap;
  inverseMap: DepsMap;
  relations: Set<string>;
};

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

export const newGraph = (): Graph => {
  return {
    map: new Map<string, string[]>(),
    inverseMap: new Map<string, string[]>(),
    relations: new Set<string>(),
  };
};

export const add = (graph: Graph, from: string, to: string): boolean => {
  const relation = `${from} ${to}`;
  if (graph.relations.has(relation)) {
    return false;
  }
  appendToMap(graph.map, from, to);
  appendToMap(graph.inverseMap, to, from);
  graph.relations.add(relation);
  return true;
};

export const getRows = (graph: Graph): string[] => {
  const rows: string[] = [];
  const map = cloneMap(graph.map);
  const inverseMap = cloneMap(graph.inverseMap);

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
};

export const getCols = (graph: Graph): string[][] => {
  const cols: string[][] = [];
  const { map } = graph;
  const inverseMap = cloneMap(graph.inverseMap);
  const visited = new Set<string>();

  const collect = (node: string, index = 0, prev?: string) => {
    if (visited.has(node)) {
      return;
    }
    const existing = cols[index];
    if (existing) {
      if (prev && existing.some((item) => map.get(item)?.includes(prev))) {
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
};

export function* getLines(
  graph: Graph,
  rows: string[],
  cols: string[][]
): Generator<string> {
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
          for (const toBeFound of graph.map.get(row) ?? []) {
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
