import { type GameState, Player } from "./types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GameStatusProps {
  gameState: GameState;
  mode: string;
  isAIThinking: boolean;
}

export function GameStatus({ gameState, mode, isAIThinking }: GameStatusProps) {
  const getStatusMessage = () => {
    if (gameState.winner) {
      if (mode === "ai") {
        return `${
          gameState.winner === Player.BLACK ? "Black (You)" : "White (AI)"
        } wins!`;
      }
      return `${gameState.winner === Player.BLACK ? "Black" : "White"} wins!`;
    }

    if (isAIThinking) {
      return "AI is thinking...";
    }

    if (mode === "ai") {
      return `${
        gameState.currentPlayer === Player.BLACK ? "Black (You)" : "White (AI)"
      }'s turn to play.`;
    }
    return `${
      gameState.currentPlayer === Player.BLACK ? "Black" : "White"
    }'s turn to play.`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Status</CardTitle>
        <CardDescription>Connect five stones in a row to win</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-gray-900 border border-gray-700"></div>
                <span className="font-medium">
                  Black {mode === "ai" ? "(You)" : "(Player 1)"}
                </span>
              </div>
              <div className="text-sm">
                Moves:{" "}
                {
                  gameState.moveHistory.filter(
                    (move) => move.player === Player.BLACK
                  ).length
                }
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-white border border-gray-300"></div>
                <span className="font-medium">
                  White {mode === "ai" ? "(AI)" : "(Player 2)"}
                </span>
              </div>
              <div className="text-sm">
                Moves:{" "}
                {
                  gameState.moveHistory.filter(
                    (move) => move.player === Player.WHITE
                  ).length
                }
              </div>
            </div>
          </div>

          <div
            className={`rounded-md p-3 text-center font-medium ${
              gameState.winner
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : isAIThinking
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
            }`}
          >
            {getStatusMessage()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
