# deps-graph

An algorithm to prettify dependency graph.

## Example

```
  ◊       a
  └◊      b
   ├──◊   c
   ├──┴◊  d
 ◊ │   │  f
◊│ │   │  k
├┴◊│   │  g
├─┴┴◊  │  h
└───├◊ │  i
    │└◊│  j
    └─┴┴◊ e
```

Sub-graph from [c, g]

```
   ◊   c
   └◊  d
◊   │  g
└◊  │  h
 ├◊ │  i
 │└◊│  j
 └─┴┴◊ e
```

Sub-graph to [d, h]

```
  ◊    a
  └◊   b
   ├◊  c
   ├┴◊ d
 ◊ │   f
◊│ │   k
├┴◊│   g
└─┴┴─◊ h
```
