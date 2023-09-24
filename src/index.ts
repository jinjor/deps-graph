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
  const row: string[] = [];
  const map = cloneMap(graph.map);
  const inverseMap = cloneMap(graph.inverseMap);

  const findFirstNode = () => {
    return [...map.keys()].find((key) => !inverseMap.has(key));
  };
  const collect = (node: string) => {
    row.push(node);
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
  return row;
};
