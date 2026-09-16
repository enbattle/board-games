# Board Game Hub

A modern web application featuring classic board games, built with Next.js, TypeScript, and Tailwind CSS. Play timeless games like Nine Men's Morris and Gomoku (Five in a Row) in a beautiful, responsive interface.

Live site here: [https://enbattle.github.io/board-games/](https://enbattle.github.io/board-games/)

## 🎮 Available Games

- **Nine Men's Morris**: A strategic board game where players try to form mills (three pieces in a row) while preventing their opponent from doing the same.
- **Gomoku (Five in a Row)**: A classic game where players take turns placing stones on a grid, trying to be the first to get five in a row.

## ✨ Features

- 🎯 Multiple classic board games
- 🌓 Dark/Light theme support
- 📱 Responsive design for all devices
- 🎨 Modern UI with shadcn/ui components
- ⚡ Fast performance with Next.js and Turbopack
- 📖 Game rules and instructions
- 🎮 Interactive game modes

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**:
  - Radix UI
  - shadcn/ui
- **Theme**: next-themes
- **Development**: Turbopack

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd board-games
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 📦 Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting
- `npm run test` - Run the Vitest test suite once
- `npm run deploy` - Build and deploy locally to the `gh-pages` branch (see Deployment below)

## 🏗️ Project Structure

```
src/
├── app/              # Next.js app router pages and layouts
├── components/       # React components
│   ├── ui/          # Basic UI components
│   └── games/       # Game-specific components
└── lib/             # Utility functions and shared logic (AI search helpers, cn())
docs/                 # Board-graph and AI design notes for the two games
```

## 🚢 Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which lints,
type-checks, tests, builds the static export, and publishes it to GitHub
Pages via `actions/deploy-pages`. This is the primary way the live site
gets updated - it doesn't force-push or need local GitHub credentials.

`npm run deploy` (which runs `deploy.js`) is still available as a manual
local fallback that builds and force-pushes the static export to a
`gh-pages` branch directly from your machine, for cases where you can't or
don't want to use GitHub Actions.

## 🧪 Testing & contributing

Pull requests are checked by `.github/workflows/ci.yml`, which runs
`tsc --noEmit`, `next lint`, `npm run test`, and `npm run build`. Please
make sure all four pass locally before opening a PR:

```bash
npx tsc --noEmit
npm run lint
npm run test
npm run build
```

Tests live next to the code they cover as `*.test.ts` (e.g.
`src/components/games/gomoku/game-logic.test.ts`) and currently focus on
the two games' pure rules/AI logic - board-graph and mill validity,
win-detection edge cases, and AI move-color regressions. See `docs/ai.md`
for how the AI difficulty and search-time ceiling work, and
`docs/nine-mens-morris-board.md` for the board index-to-coordinate mapping
before touching `adjacentPositions` or `mills`.

Contributions are welcome - please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
