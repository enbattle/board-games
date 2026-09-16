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
  const whiteLabel = mode === "ai" ? "White (You)" : "White (Player 1)";
  const blackLabel = mode === "ai" ? "Black (AI)" : "Black (Player 2)";
  const currentLabel =
    gameState.currentPlayer === Player.WHITE ? whiteLabel : blackLabel;

  const getStatusMessage = () => {
    if (gameState.winner) {
      return `${
        gameState.winner === Player.WHITE ? whiteLabel : blackLabel
      } wins!`;
    }

    if (isAIThinking) {
      return "AI is thinking...";
    }

    if (gameState.millFormed) {
      return `${currentLabel} formed a mill! Remove an opponent's piece.`;
    }

    if (gameState.phase === GamePhase.PLACING) {
      return `${currentLabel}'s turn to place a piece.`;
    }

    if (gameState.selectedPosition !== null) {
      return `Select a position to move your piece.`;
    }

    return `${currentLabel}'s turn to move a piece.`;
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
                <span className="font-medium">{whiteLabel}</span>
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
                <span className="font-medium">{blackLabel}</span>
              </div>
              <div className="text-sm">
                Pieces left: {gameState.blackPiecesLeft}
                <br />
                Pieces on board: {gameState.blackPiecesOnBoard}
              </div>
            </div>
          </div>

          <div
            role="status"
            aria-live="polite"
            className={`rounded-md p-3 text-center font-medium ${
              gameState.winner
                ? "bg-success text-success-foreground animate-win-pulse"
                : gameState.millFormed
                ? "bg-warning text-warning-foreground"
                : isAIThinking
                ? "bg-warning text-warning-foreground"
                : "bg-info text-info-foreground"
            }`}
          >
            {getStatusMessage()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
