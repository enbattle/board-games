"use client";

import { useTheme } from "next-themes";
import { Player } from "./types";

interface GomokuBoardProps {
  board: (Player | null)[][];
  onCellClick: (row: number, col: number) => void;
  winningLine: { row: number; col: number }[];
  lastMove: { row: number; col: number; player: Player } | null;
}

export function GomokuBoard({
  board,
  onCellClick,
  winningLine,
  lastMove,
}: GomokuBoardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const size = board.length;
  const cellSize = 30;
  const boardSize = (size + 1) * cellSize;

  // Convert board position to coordinates
  const getCoordinates = (row: number, col: number) => {
    return {
      x: (col + 1) * cellSize,
      y: (row + 1) * cellSize,
    };
  };

  // Check if a position is in the winning line
  const isWinningPosition = (row: number, col: number) => {
    return winningLine.some((pos) => pos.row === row && pos.col === col);
  };

  // Check if this is the last move
  const isLastMove = (row: number, col: number) => {
    return lastMove && lastMove.row === row && lastMove.col === col;
  };

  return (
    <div
      className="relative"
      style={{ width: `${boardSize}px`, height: `${boardSize}px` }}
    >
      <svg
        width={boardSize}
        height={boardSize}
        viewBox={`0 0 ${boardSize} ${boardSize}`}
        className="absolute inset-0"
      >
        {/* Board background */}
        <rect
          x="0"
          y="0"
          width={boardSize}
          height={boardSize}
          fill={isDark ? "#2c2c2c" : "#e6c88f"}
          rx="8"
        />

        {/* Grid lines */}
        {Array.from({ length: size }).map((_, i) => {
          const { y } = getCoordinates(i, 0);
          return (
            <line
              key={`h-${i}`}
              x1={cellSize}
              y1={y}
              x2={boardSize - cellSize}
              y2={y}
              stroke={isDark ? "#666" : "#333"}
              strokeWidth="1"
            />
          );
        })}

        {Array.from({ length: size }).map((_, i) => {
          const { x } = getCoordinates(0, i);
          return (
            <line
              key={`v-${i}`}
              x1={x}
              y1={cellSize}
              x2={x}
              y2={boardSize - cellSize}
              stroke={isDark ? "#666" : "#333"}
              strokeWidth="1"
            />
          );
        })}

        {/* Star points (for traditional Go board look) */}
        {[3, 7, 11].map((row) =>
          [3, 7, 11].map((col) => {
            const { x, y } = getCoordinates(row, col);
            return (
              <circle
                key={`star-${row}-${col}`}
                cx={x}
                cy={y}
                r="3"
                fill={isDark ? "#666" : "#333"}
              />
            );
          })
        )}
      </svg>

      {/* Stones */}
      <div className="absolute inset-0">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (cell === null) return null;

            const { x, y } = getCoordinates(rowIndex, colIndex);
            const isWinning = isWinningPosition(rowIndex, colIndex);
            const isLast = isLastMove(rowIndex, colIndex);

            return (
              <div
                key={`stone-${rowIndex}-${colIndex}`}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md transition-all ${
                  cell === Player.BLACK
                    ? "bg-gray-900 border border-gray-700"
                    : "bg-white border border-gray-300"
                } ${isWinning ? "ring-2 ring-red-500" : ""} ${
                  isLast ? "ring-2 ring-blue-500" : ""
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${cellSize * 0.9}px`,
                  height: `${cellSize * 0.9}px`,
                }}
              />
            );
          })
        )}
      </div>

      {/* Clickable areas */}
      <div className="absolute inset-0">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const { x, y } = getCoordinates(rowIndex, colIndex);

            return (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                }}
                onClick={() => onCellClick(rowIndex, colIndex)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
