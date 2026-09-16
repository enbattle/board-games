"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { GomokuBoard } from "./board";
import { GameStatus } from "./game-status";
import { Player, type GameState } from "./types";
import { checkWinner, makeAIMove } from "./game-logic";
import { Loader2 } from "lucide-react";
import { isDifficulty, type Difficulty } from "@/lib/ai-search";

const initialGameState: GameState = {
  board: Array(15)
    .fill(null)
    .map(() => Array(15).fill(null)),
  currentPlayer: Player.BLACK, // Black always starts in Gomoku
  winner: null,
  winningLine: [],
  moveHistory: [],
};

export function GomokuGame() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "pvp";
  const difficultyParam = searchParams.get("difficulty");
  const difficulty: Difficulty = isDifficulty(difficultyParam)
    ? difficultyParam
    : "medium";
  const [isAIThinking, setIsAIThinking] = useState(false);

  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const resetGame = useCallback(() => {
    setGameState({
      ...initialGameState,
      currentPlayer: Player.BLACK, // Always start with Black
    });
  }, []);

  // Reset game when mode or difficulty changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetGame();
  }, [mode, difficulty, resetGame]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameState.winner || gameState.board[row][col] !== null) return;
      if (mode === "ai") {
        // In AI mode, player is Black, so only allow moves on Black's turn
        if (gameState.currentPlayer === Player.WHITE) return;
      }
      if (isAIThinking) return;

      const newBoard = gameState.board.map((row) => [...row]);
      newBoard[row][col] = gameState.currentPlayer;

      const newMoveHistory = [
        ...gameState.moveHistory,
        { row, col, player: gameState.currentPlayer },
      ];

      // Check for winner
      const { winner, winningLine } = checkWinner(
        newBoard,
        row,
        col,
        gameState.currentPlayer
      );

      setGameState({
        board: newBoard,
        currentPlayer:
          gameState.currentPlayer === Player.BLACK
            ? Player.WHITE
            : Player.BLACK,
        winner,
        winningLine,
        moveHistory: newMoveHistory,
      });
    },
    [gameState, isAIThinking, mode]
  );

  const undoMove = () => {
    if (gameState.moveHistory.length === 0 || isAIThinking) return;

    const newHistory = [...gameState.moveHistory];
    const lastMove = newHistory.pop();

    if (!lastMove) return;

    const newBoard = gameState.board.map((row) => [...row]);
    newBoard[lastMove.row][lastMove.col] = null;

    // In AI mode, "lastMove" above is the AI's reply, so also undo the
    // human's move before it - otherwise Undo would just hand the turn
    // straight back to the AI to make the same reply again.
    if (mode === "ai" && newHistory.length > 0 && gameState.winner === null) {
      const previousHumanMove = newHistory.pop();
      if (previousHumanMove) {
        newBoard[previousHumanMove.row][previousHumanMove.col] = null;
      }
    }

    setGameState({
      board: newBoard,
      currentPlayer: mode === "ai" ? Player.BLACK : lastMove.player,
      winner: null,
      winningLine: [],
      moveHistory: newHistory,
    });
  };

  // AI move logic
  useEffect(() => {
    if (
      mode === "ai" &&
      gameState.currentPlayer === Player.WHITE &&
      !gameState.winner
    ) {
      // Flags the start of the AI's timed turn below, not a derived value -
      // there's no way to compute it without the effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAIThinking(true);
      const timer = setTimeout(() => {
        const { row, col } = makeAIMove(gameState.board, difficulty);

        const newBoard = gameState.board.map((row) => [...row]);
        newBoard[row][col] = Player.WHITE;

        const newMoveHistory = [
          ...gameState.moveHistory,
          { row, col, player: Player.WHITE },
        ];

        // Check for winner
        const { winner, winningLine } = checkWinner(
          newBoard,
          row,
          col,
          Player.WHITE
        );

        setGameState({
          board: newBoard,
          currentPlayer: Player.BLACK,
          winner,
          winningLine,
          moveHistory: newMoveHistory,
        });
        setIsAIThinking(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [gameState, mode, difficulty]);

  return (
    <div className="flex flex-col items-center lg:flex-row lg:items-start lg:gap-8">
      <div className="mb-8 w-full max-w-md lg:mb-0">
        <GameStatus
          gameState={gameState}
          mode={mode}
          isAIThinking={isAIThinking}
        />
        <div className="mt-4 flex justify-between">
          <Button onClick={resetGame} variant="outline" disabled={isAIThinking}>
            Reset Game
          </Button>
          <Button
            onClick={undoMove}
            variant="outline"
            disabled={gameState.moveHistory.length === 0 || isAIThinking}
          >
            Undo Move
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {isAIThinking && (
          <div className="absolute z-10 bg-background/80 rounded-lg p-4 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        )}
        <GomokuBoard
          board={gameState.board}
          onCellClick={handleCellClick}
          winningLine={gameState.winningLine}
          lastMove={
            gameState.moveHistory.length > 0
              ? gameState.moveHistory[gameState.moveHistory.length - 1]
              : null
          }
        />
      </div>
    </div>
  );
}
