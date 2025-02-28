"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { NineMensMorrisBoard } from "./board";
import { GameStatus } from "./game-status";
import { GamePhase, Player, type GameState } from "./types";
import { checkForMill, getValidMoves, makeAIMove } from "./game-logic";
import { Loader2 } from "lucide-react";

const initialGameState: GameState = {
  phase: GamePhase.PLACING,
  currentPlayer: Player.WHITE, // User always starts as White
  board: Array(24).fill(null),
  whitePiecesLeft: 9,
  blackPiecesLeft: 9,
  whitePiecesOnBoard: 0,
  blackPiecesOnBoard: 0,
  selectedPosition: null,
  millFormed: false,
  winner: null,
};

export function NineMensMorrisGame() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "pvp";
  const [isAIThinking, setIsAIThinking] = useState(false);

  const [gameState, setGameState] = useState<GameState>(initialGameState);

  // Reset game when mode changes
  useEffect(() => {
    setGameState(initialGameState);
  }, [searchParams]);

  const resetGame = () => {
    setGameState(initialGameState);
  };

  const handlePositionClick = (position: number) => {
    // Prevent moves if it's AI's turn or AI is thinking
    if (mode === "ai" && gameState.currentPlayer === Player.BLACK) return;
    if (gameState.winner || isAIThinking) return;

    // If a mill was formed, player must remove an opponent's piece
    if (gameState.millFormed) {
      const opponentPlayer =
        gameState.currentPlayer === Player.WHITE ? Player.BLACK : Player.WHITE;

      // Can only remove opponent's pieces that are not part of a mill
      if (
        gameState.board[position] === opponentPlayer &&
        !checkForMill(gameState.board, position)
      ) {
        const newBoard = [...gameState.board];
        newBoard[position] = null;

        const newState = {
          ...gameState,
          board: newBoard,
          millFormed: false,
          currentPlayer:
            gameState.currentPlayer === Player.WHITE
              ? Player.BLACK
              : Player.WHITE,
          whitePiecesOnBoard:
            opponentPlayer === Player.WHITE
              ? gameState.whitePiecesOnBoard - 1
              : gameState.whitePiecesOnBoard,
          blackPiecesOnBoard:
            opponentPlayer === Player.BLACK
              ? gameState.blackPiecesOnBoard - 1
              : gameState.blackPiecesOnBoard,
        };

        // Check if opponent has less than 3 pieces in moving phase (game over)
        if (gameState.phase === GamePhase.MOVING) {
          if (
            opponentPlayer === Player.WHITE &&
            newState.whitePiecesOnBoard < 3
          ) {
            newState.winner = Player.BLACK;
          } else if (
            opponentPlayer === Player.BLACK &&
            newState.blackPiecesOnBoard < 3
          ) {
            newState.winner = Player.WHITE;
          }
        }

        setGameState(newState);
      }
      return;
    }

    // Placing phase
    if (gameState.phase === GamePhase.PLACING) {
      if (gameState.board[position] === null) {
        const newBoard = [...gameState.board];
        newBoard[position] = gameState.currentPlayer;

        const millFormed = checkForMill(newBoard, position);

        const newState = {
          ...gameState,
          board: newBoard,
          whitePiecesLeft:
            gameState.currentPlayer === Player.WHITE
              ? gameState.whitePiecesLeft - 1
              : gameState.whitePiecesLeft,
          blackPiecesLeft:
            gameState.currentPlayer === Player.BLACK
              ? gameState.blackPiecesLeft - 1
              : gameState.blackPiecesLeft,
          whitePiecesOnBoard:
            gameState.currentPlayer === Player.WHITE
              ? gameState.whitePiecesOnBoard + 1
              : gameState.whitePiecesOnBoard,
          blackPiecesOnBoard:
            gameState.currentPlayer === Player.BLACK
              ? gameState.blackPiecesOnBoard + 1
              : gameState.blackPiecesOnBoard,
          millFormed,
        };

        // If no mill was formed, switch players
        if (!millFormed) {
          newState.currentPlayer =
            gameState.currentPlayer === Player.WHITE
              ? Player.BLACK
              : Player.WHITE;
        }

        // Check if placing phase is over
        if (newState.whitePiecesLeft === 0 && newState.blackPiecesLeft === 0) {
          newState.phase = GamePhase.MOVING;
        }

        setGameState(newState);
      }
    }
    // Moving phase
    else if (gameState.phase === GamePhase.MOVING) {
      // If no piece is selected and the clicked position has the current player's piece
      if (
        gameState.selectedPosition === null &&
        gameState.board[position] === gameState.currentPlayer
      ) {
        setGameState({
          ...gameState,
          selectedPosition: position,
        });
      }
      // If a piece is already selected
      else if (gameState.selectedPosition !== null) {
        // If clicking on another of the player's pieces, select that one instead
        if (gameState.board[position] === gameState.currentPlayer) {
          setGameState({
            ...gameState,
            selectedPosition: position,
          });
        }
        // If clicking on an empty position, try to move there
        else if (gameState.board[position] === null) {
          const validMoves = getValidMoves(
            gameState.board,
            gameState.selectedPosition,
            (gameState.currentPlayer === Player.WHITE
              ? gameState.whitePiecesOnBoard
              : gameState.blackPiecesOnBoard) <= 3
          );

          if (validMoves.includes(position)) {
            const newBoard = [...gameState.board];
            newBoard[gameState.selectedPosition] = null;
            newBoard[position] = gameState.currentPlayer;

            const millFormed = checkForMill(newBoard, position);

            const newState = {
              ...gameState,
              board: newBoard,
              selectedPosition: null,
              millFormed,
            };

            // If no mill was formed, switch players
            if (!millFormed) {
              newState.currentPlayer =
                gameState.currentPlayer === Player.WHITE
                  ? Player.BLACK
                  : Player.WHITE;
            }

            // Check if opponent has no valid moves (game over)
            const opponentPlayer =
              gameState.currentPlayer === Player.WHITE
                ? Player.BLACK
                : Player.WHITE;
            let opponentHasValidMoves = false;

            for (let i = 0; i < 24; i++) {
              if (newBoard[i] === opponentPlayer) {
                const opponentMoves = getValidMoves(
                  newBoard,
                  i,
                  (opponentPlayer === Player.WHITE
                    ? newState.whitePiecesOnBoard
                    : newState.blackPiecesOnBoard) <= 3
                );
                if (opponentMoves.length > 0) {
                  opponentHasValidMoves = true;
                  break;
                }
              }
            }

            if (!opponentHasValidMoves && !millFormed) {
              newState.winner = gameState.currentPlayer;
            }

            setGameState(newState);
          }
        }
      }
    }
  };

  // AI move logic
  useEffect(() => {
    if (
      mode === "ai" &&
      gameState.currentPlayer === Player.BLACK &&
      !gameState.millFormed &&
      !gameState.winner
    ) {
      setIsAIThinking(true);
      const timer = setTimeout(() => {
        const newState = makeAIMove(gameState);
        setGameState(newState);
        setIsAIThinking(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [gameState, mode]);

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
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {isAIThinking && (
          <div className="absolute z-10 bg-background/80 rounded-lg p-4 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        )}
        <NineMensMorrisBoard
          board={gameState.board}
          selectedPosition={gameState.selectedPosition}
          onPositionClick={handlePositionClick}
          highlightMills={true}
          validMoves={
            gameState.selectedPosition !== null
              ? getValidMoves(
                  gameState.board,
                  gameState.selectedPosition,
                  (gameState.currentPlayer === Player.WHITE
                    ? gameState.whitePiecesOnBoard
                    : gameState.blackPiecesOnBoard) <= 3
                )
              : []
          }
        />
      </div>
    </div>
  );
}
