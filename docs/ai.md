# AI opponent design

Both games' "Player vs AI" mode is a hand-written minimax search with
alpha-beta pruning - there's no shared engine (see "Two AI implementations"
below), but both follow the same shape:

1. Generate candidate moves (with some pruning - see each game's section).
2. Statically score a position with a hand-tuned weighted-feature
   evaluation function (open threats, mill potential, mobility, center
   control, etc. - the exact weights are the `WEIGHTS` constant at the top
   of each `game-logic.tsx`).
3. Search a fixed number of plies ahead with alpha-beta pruning,
   maximizing the AI's own score and minimizing the opponent's.

## Difficulty and the search time ceiling

Both AIs share `src/lib/ai-search.ts`, which is the only code shared
between the two engines. It provides:

- **`SEARCH_TIME_LIMIT_MS`** - a wall-clock budget per difficulty (300ms
  easy / 700ms medium / 1500ms hard). `makeAIMove` in each game runs
  **iterative deepening**: search depth 1, then 2, then 3, ... up to that
  difficulty's max depth, and if a deeper pass exceeds its deadline
  mid-search, a `SearchTimeout` unwinds it and the caller falls back to
  the best move found at the last depth that *did* finish in time. This is
  what caps worst-case move latency - a slow position no longer means an
  unbounded search, it means the AI settles for a shallower-but-complete
  answer.
- **Per-difficulty max depth** (set independently in each game's
  `game-logic.tsx`, since the two games have very different branching
  factors): Gomoku is 2/3/4 plies for easy/medium/hard; Nine Men's Morris
  is deeper because its branching factor is much smaller (at most ~9x4
  candidate moves vs. Gomoku's much larger 15x15 candidate set) - 2-3
  plies placing/moving for easy, 4 for medium, 5-6 for hard (5-6 is what
  this AI originally shipped with as its only difficulty).
- **Weaker play at low difficulty isn't just shallower search** - easy and
  medium also pick randomly among the top few root moves (`RANDOM_TOP_N_BY_DIFFICULTY`)
  instead of always the single best. Without this, a shallow search still
  reliably crushes threats one or two moves out and doesn't actually feel
  "easy," and it plays identically every game. Hard always picks the
  single best move.

**Known limitation:** the search still runs synchronously on the main
thread inside a `setTimeout` in each game's `game.tsx` (the timeout is just
to simulate "thinking" - it's not what bounds search time). At "hard," a
near-1500ms search can make the tab feel briefly unresponsive. Moving the
search into a Web Worker would fix this but hasn't been done - see
`CODE_AUDIT.md` §2.3.

## Two AI implementations, not one

`gomoku/game-logic.tsx` and `nine-mens-morris/game-logic.tsx` each have
their own `minimax`, `getValidMoves`/`getAllPossibleMoves`, and
`evaluatePosition`, copy-pasted in shape. This is a maintenance risk
(`CODE_AUDIT.md` §2.1) - the two engines can drift and any fix has to be
applied twice. The one thing that *is* shared is the iterative-deepening
harness in `src/lib/ai-search.ts`; unifying the rest into a generic
`alphaBetaSearch<TState, TMove>` is a follow-up, not done here, because the
two games' state shapes differ enough (Gomoku is a plain 2D grid;
Nine Men's Morris has phase/piece-count bookkeeping and mill-removal side
effects baked into every move) that a hasty unification risked introducing
new bugs for a low-stakes hobby project.

## The color-parameterization bug (fixed)

Gomoku's AI always plays White (see `gomoku/game.tsx`), but its `minimax`
used to hardcode the search root as Black regardless - it was computing
the best move *for Black* and then the game planted that move on the board
as a White stone. `makeAIMove`/`minimax`/`getRankedRootMoves` now take an
explicit `aiPlayer: Player` parameter (defaulting to `Player.WHITE`,
matching how it's actually called) instead of assuming a fixed color. See
`CODE_AUDIT.md` §1.2 and the regression test in `game-logic.test.ts`
("builds its own winning threat instead of only reacting to the
opponent's") for what this looked like in practice.

Nine Men's Morris never had this bug - its AI always plays Black, and its
`minimax` already assumed that consistently.
