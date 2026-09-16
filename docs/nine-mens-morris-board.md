# Nine Men's Morris board index

The board state is stored as a flat array of 24 cells (`(Player | null)[24]`),
indexed 0-23. `board.tsx` renders those same indices at fixed `[x, y]`
coordinates, and `game-logic.tsx`'s `mills` and `adjacentPositions` tables
are defined purely in terms of these indices. This file is the missing
link between the two: the diagram below is the *only* place in the repo
that shows what the graph actually looks like.

```
 0 ─────────── 1 ─────────── 2
 │             │             │
 │   3 ─────── 4 ─────── 5   │
 │   │         │         │   │
 │   │   6 ─── 7 ─── 8   │   │
 │   │   │           │   │   │
 9 ─10───11         12───13──14
 │   │   │           │   │   │
 │   │   15 ── 16 ── 17  │   │
 │   │         │         │   │
 │   18 ────── 19 ────── 20  │
 │             │             │
 21 ─────────── 22 ─────────── 23
```

Three concentric squares (outer: 0,1,2,14,23,22,21,9 / middle: 3,4,5,13,20,19,18,10
/ inner: 6,7,8,12,17,16,15,11), joined by four spokes at the top, right,
bottom, and left midpoints. **There is no center point and no line
connecting opposite sides of the inner square** - e.g. position 7 (inner
top-middle) and position 16 (inner bottom-middle) are on the same vertical
spoke line in a naive "column" reading, but the spoke stops at the inner
square on each side; nothing connects straight through the middle. A piece
at 7 can move to 4, 6, or 8, but never directly to 16 (and vice versa).

This exact mistake shipped once already: `adjacentPositions[7]` used to
list `16` as a neighbor (and `adjacentPositions[16]` listed `7` back), which
let a piece "teleport" between the two halves of the board during the
moving phase. `game-logic.test.ts` now asserts adjacency-list symmetry and
a fixed edge count (32) specifically to catch a regression of this shape -
see the `adjacentPositions` describe block.

## Mills

A mill is three same-color pieces in one of the 16 straight lines drawn
above - the 8 "rows" (e.g. `[0,1,2]`, `[6,7,8]`) and 8 "columns" (e.g.
`[1,4,7]`, the top spoke). Diagonals are never mills, which is why the four
corners of each square only ever appear in exactly two mills each (one row,
one column), while the four edge-midpoints of each square are the ones with
degree 3-4 in the adjacency graph above.
