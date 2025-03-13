import { Suspense } from "react";
import { GameModeSelector } from "@/components/game-mode-selector";
import { NineMensMorrisGame } from "@/components/games/nine-mens-morris/game";
import { Button } from "@/components/ui/button";
import { GameRules } from "@/components/game-rules";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const nineMensMorrisRules = [
  {
    title: "Overview",
    content: (
      <div className="space-y-2">
        <p>
          {`Nine Men's Morris is a strategy board game that has been played for
          centuries, dating back to the Roman Empire. The game is played on a
          board consisting of three concentric squares connected by lines at
          their midpoints.`}
        </p>
        <p>
          {`Each player starts with nine pieces ("men") and the goal is to form
          "mills" - three of your pieces in a row horizontally or vertically -
          and remove your opponent's pieces until they are left with fewer than
          three pieces.`}
        </p>
      </div>
    ),
  },
  {
    title: "Game Phases",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">1. Placing Phase</h4>
          <p>
            {`Players take turns placing their nine pieces on empty intersections
            of the board. During this phase, if a player forms a mill, they can
            remove one of their opponent's pieces that is not part of a mill.`}
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-2">2. Moving Phase</h4>
          <p>
            {` After all pieces are placed, players take turns moving one piece
            along the lines to an adjacent empty intersection. Players can still
            remove opponent's pieces by forming mills.`}
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-2">3. Flying Phase</h4>
          <p>
            {`When a player is reduced to three pieces, their pieces can "fly" to
            any empty intersection on the board, not just adjacent ones.`}
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Mills",
    content: (
      <div className="space-y-2">
        <p>
          A mill is formed when three pieces of the same color are placed in a
          straight line (horizontally or vertically). Diagonal lines do not
          count as mills.
        </p>
        <p>
          {`When a player forms a mill, they can remove one of their opponent's
          pieces from the board, with two restrictions:`}
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            You cannot remove a piece that is part of a mill unless no other
            pieces are available
          </li>
          <li>You must remove a piece if possible</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Winning the Game",
    content: (
      <div className="space-y-2">
        <p>The game can be won in two ways:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Reducing your opponent to two pieces (they can no longer form a
            mill)
          </li>
          <li>
            {`            Blocking all of your opponent's pieces so they cannot make a legal
            move`}
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Strategy Tips",
    content: (
      <div className="space-y-2">
        <ul className="list-disc list-inside space-y-2">
          <li>
            Try to control the center point and corner positions of the inner
            square
          </li>
          <li>
            {`Look for opportunities to create "double mills" - where moving one
            piece back and forth creates a mill each time`}
          </li>
          <li>
            Block your opponent from forming mills by placing your pieces
            strategically
          </li>
          <li>
            In the early game, focus on controlling key positions rather than
            forming mills immediately
          </li>
          <li>
            When removing pieces, prioritize those that could be part of
            potential mills
          </li>
        </ul>
      </div>
    ),
  },
];

export default function NineMensMorrisPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {`            Nine Men's Morris`}
          </h1>
          <p className="text-muted-foreground">
            A strategic board game for two players dating back to the Roman
            Empire
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
              gameName="nine-mens-morris"
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
              <NineMensMorrisGame />
            </Suspense>
          </div>
        </div>

        <div>
          <GameRules sections={nineMensMorrisRules} />
        </div>
      </div>
    </div>
  );
}
