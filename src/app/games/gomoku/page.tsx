import { Suspense } from "react";
import { GameModeSelector } from "@/components/game-mode-selector";
import { GomokuGame } from "@/components/games/gomoku/game";
import { Button } from "@/components/ui/button";
import { GameRules } from "@/components/game-rules";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const gomokuRules = [
  {
    title: "Overview",
    content: (
      <div className="space-y-2">
        <p>
          Gomoku, also known as Five in a Row, is a classic strategy board game
          traditionally played on a Go board. The game originated in Japan and
          has become popular worldwide.
        </p>
        <p>
          Players take turns placing stones on the intersections of a 15×15
          grid, with the goal of forming an unbroken line of five stones
          horizontally, vertically, or diagonally.
        </p>
      </div>
    ),
  },
  {
    title: "Basic Rules",
    content: (
      <div className="space-y-2">
        <ul className="list-disc list-inside space-y-2">
          <li>Black plays first</li>
          <li>Players alternate turns placing one stone of their color</li>
          <li>Stones can only be placed on empty intersections</li>
          <li>Once placed, stones cannot be moved or removed</li>
          <li>The game continues until one player wins or the board is full</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Winning Conditions",
    content: (
      <div className="space-y-2">
        <p>
          A player wins by forming an unbroken line of exactly five stones of
          their color in any direction:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Horizontally (─)</li>
          <li>Vertically (│)</li>
          <li>Diagonally (╱ or ╲)</li>
        </ul>
        <p className="mt-2">
          Note: A line of six or more stones does not count as a win. It must be
          exactly five stones.
        </p>
      </div>
    ),
  },
  {
    title: "Game Variations",
    content: (
      <div className="space-y-2">
        <p>There are several popular variations of Gomoku:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Standard (Free-style) - No additional rules</li>
          <li>Pro - Black's first move must be in the center</li>
          <li>
            Swap - After Black's first move, White can choose to swap colors
          </li>
          <li>Renju - Complex rules to balance the game for tournament play</li>
        </ul>
        <p className="mt-2">
          This implementation uses the standard free-style rules.
        </p>
      </div>
    ),
  },
  {
    title: "Strategy Tips",
    content: (
      <div className="space-y-2">
        <ul className="list-disc list-inside space-y-2">
          <li>
            Look for opportunities to create multiple threats simultaneously
          </li>
          <li>Block your opponent's attempts to create open-ended sequences</li>
          <li>Control the center area of the board when possible</li>
          <li>Pay attention to diagonal lines, which are often overlooked</li>
          <li>
            Think several moves ahead and anticipate your opponent's plans
          </li>
        </ul>
      </div>
    ),
  },
];

export default function GomokuPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gomoku</h1>
          <p className="text-muted-foreground">
            Also known as Five in a Row, a classic strategy game played on a Go
            board
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">Back to Games</Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        <div className="space-y-8">
          <Suspense
            fallback={
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading game
                modes...
              </div>
            }
          >
            <GameModeSelector
              gameName="gomoku"
              modes={[
                { id: "pvp", name: "Player vs Player" },
                { id: "ai", name: "Player vs AI" },
              ]}
            />
          </Suspense>

          <div className="flex items-center justify-center">
            <Suspense
              fallback={
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading game...
                </div>
              }
            >
              <GomokuGame />
            </Suspense>
          </div>
        </div>

        <div>
          <GameRules sections={gomokuRules} />
        </div>
      </div>
    </div>
  );
}
