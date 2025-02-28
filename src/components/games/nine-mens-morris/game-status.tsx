import { GamePhase, type GameState, Player } from "./types";
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
      return `${
        gameState.winner === Player.WHITE ? "White (You)" : "Black (AI)"
      } wins!`;
    }

    if (isAIThinking) {
      return "AI is thinking...";
    }

    if (gameState.millFormed) {
      return `${
        gameState.currentPlayer === Player.WHITE ? "White (You)" : "Black (AI)"
      } formed a mill! Remove an opponent's piece.`;
    }

    if (gameState.phase === GamePhase.PLACING) {
      return `${
        gameState.currentPlayer === Player.WHITE ? "White (You)" : "Black (AI)"
      }'s turn to place a piece.`;
    }

    if (gameState.selectedPosition !== null) {
      return `Select a position to move your piece.`;
    }

    return `${
      gameState.currentPlayer === Player.WHITE ? "White (You)" : "Black (AI)"
    }'s turn to move a piece.`;
  };

  const getPhaseDescription = () => {
    if (gameState.phase === GamePhase.PLACING) {
      return "Place your pieces on the board.";
    } else {
      return "Move your pieces to adjacent positions.";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Status</CardTitle>
        <CardDescription>{getPhaseDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-white border border-gray-300"></div>
                <span className="font-medium">White (You)</span>
              </div>
              <div className="text-sm">
                Pieces left: {gameState.whitePiecesLeft}
                <br />
                Pieces on board: {gameState.whitePiecesOnBoard}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-gray-900 border border-gray-700"></div>
                <span className="font-medium">Black (AI)</span>
              </div>
              <div className="text-sm">
                Pieces left: {gameState.blackPiecesLeft}
                <br />
                Pieces on board: {gameState.blackPiecesOnBoard}
              </div>
            </div>
          </div>

          <div
            className={`rounded-md p-3 text-center font-medium ${
              gameState.winner
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : gameState.millFormed
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
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
