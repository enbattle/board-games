# CLAUDE.md

Guidance for working in this repository.

## What this is

`board-games` is a Next.js (App Router, static export) site hosting two
browser board games - Nine Men's Morris and Gomoku - each playable
player-vs-player or against a minimax AI opponent. No backend; deployed
as a static site to GitHub Pages via `.github/workflows/deploy.yml`.

## Where things live

- `src/components/games/<game>/` - one folder per game: `board.tsx`
  (rendering + input), `game.tsx` (state + the public `<GomokuGame />`/
  `<NineMensMorrisGame />` component), `game-logic.tsx` (rules, win
  detection, and that game's minimax move generation/evaluation),
  `game-status.tsx`, and a colocated `types.ts`. Keep new game-specific
  types in that game's `types.ts` rather than a shared types file - there
  isn't one, and these games don't share state shapes.
- `src/lib/ai-search.ts` - the one piece of code shared between both
  games' AI: iterative-deepening/time-boxing (`SEARCH_TIME_LIMIT_MS` per
  difficulty) and the `Difficulty` type. Each game's own minimax/alpha-beta
  and position evaluation stays in that game's `game-logic.tsx` - see
  [docs/ai.md](docs/ai.md) for the full design rationale and why the
  engines aren't more shared than this.
- [docs/nine-mens-morris-board.md](docs/nine-mens-morris-board.md) - the
  board index-to-coordinate mapping. Read this before touching
  `adjacentPositions` or `mills` in that game's `game-logic.tsx`.
- `src/components/ui/` - shadcn-style primitives (CLI-copied source, not
  an installed package - don't add a `shadcn` npm dependency). Colors are
  semantic tokens defined in `src/app/globals.css`'s `@theme`/`:root`/
  `.dark` blocks (`bg-card`, `text-success`, etc.) - don't hardcode raw
  Tailwind palette classes like `bg-green-100` in game components; add a
  new token if an existing one doesn't fit.
- `<GomokuGame />`/`<NineMensMorrisGame />` are thin wrappers that read
  `mode`/`difficulty` from the URL and remount their actual game-state
  component via `key` when either changes - this is deliberate (a fresh
  mount beats resetting state in an effect) - see the wrapper vs.
  `*GameBoard` split at the top of each `game.tsx`.

## Verifying a change

```bash
npx tsc --noEmit
npm run lint
npm run test
npm run build
```

`npm run dev` for manual checks: play both games in both modes (PvP and
vs. AI, all three difficulties), confirm a full keyboard-only playthrough
works (tab to a cell, Enter/Space to play), and check both light and dark
theme.

## Deployment

See the README's Deployment section - pushing to `main` runs
`.github/workflows/deploy.yml` (Actions-based, primary); `npm run deploy`
(`deploy.js`) is a manual local fallback.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
