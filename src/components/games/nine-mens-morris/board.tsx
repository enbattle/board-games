"use client";

import { useTheme } from "next-themes";
import { Player } from "./types";
import { checkForMill } from "./game-logic";

interface NineMensMorrisBoardProps {
  board: (Player | null)[];
  selectedPosition: number | null;
  onPositionClick: (position: number) => void;
  highlightMills?: boolean;
  validMoves?: number[];
}

export function NineMensMorrisBoard({
  board,
  selectedPosition,
  onPositionClick,
  highlightMills = false,
  validMoves = [],
}: NineMensMorrisBoardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Scale and offset factors for the board
  const scale = 60;
  const offset = scale / 2; // This creates the offset from the edges
  const boardSize = 8 * scale; // Increased from 7 to 8 to accommodate the offset
  const dotSize = 12;

  // Board positions mapping to coordinates (shifted by offset)
  const positions: [number, number][] = [
    [1, 1],
    [4, 1],
    [7, 1], // Top row (shifted right and down by 1)
    [2, 2],
    [4, 2],
    [6, 2], // Second row
    [3, 3],
    [4, 3],
    [5, 3], // Third row
    [1, 4],
    [2, 4],
    [3, 4], // Left middle row
    [5, 4],
    [6, 4],
    [7, 4], // Right middle row
    [3, 5],
    [4, 5],
    [5, 5], // Fifth row
    [2, 6],
    [4, 6],
    [6, 6], // Sixth row
    [1, 7],
    [4, 7],
    [7, 7], // Bottom row (shifted right and down by 1)
  ];

  // Lines connecting positions (shifted to match new positions)
  const lines = [
    // Outer square
    [
      [1, 1],
      [4, 1],
    ],
    [
      [4, 1],
      [7, 1],
    ], // Top
    [
      [7, 1],
      [7, 4],
    ],
    [
      [7, 4],
      [7, 7],
    ], // Right
    [
      [7, 7],
      [4, 7],
    ],
    [
      [4, 7],
      [1, 7],
    ], // Bottom
    [
      [1, 7],
      [1, 4],
    ],
    [
      [1, 4],
      [1, 1],
    ], // Left

    // Middle square
    [
      [2, 2],
      [4, 2],
    ],
    [
      [4, 2],
      [6, 2],
    ], // Top
    [
      [6, 2],
      [6, 4],
    ],
    [
      [6, 4],
      [6, 6],
    ], // Right
    [
      [6, 6],
      [4, 6],
    ],
    [
      [4, 6],
      [2, 6],
    ], // Bottom
    [
      [2, 6],
      [2, 4],
    ],
    [
      [2, 4],
      [2, 2],
    ], // Left

    // Inner square
    [
      [3, 3],
      [4, 3],
    ],
    [
      [4, 3],
      [5, 3],
    ], // Top
    [
      [5, 3],
      [5, 4],
    ],
    [
      [5, 4],
      [5, 5],
    ], // Right
    [
      [5, 5],
      [4, 5],
    ],
    [
      [4, 5],
      [3, 5],
    ], // Bottom
    [
      [3, 5],
      [3, 4],
    ],
    [
      [3, 4],
      [3, 3],
    ], // Left

    // Connecting lines
    [
      [4, 1],
      [4, 2],
    ],
    [
      [4, 2],
      [4, 3],
    ], // Top vertical
    [
      [7, 4],
      [6, 4],
    ],
    [
      [6, 4],
      [5, 4],
    ], // Right horizontal
    [
      [4, 7],
      [4, 6],
    ],
    [
      [4, 6],
      [4, 5],
    ], // Bottom vertical
    [
      [1, 4],
      [2, 4],
    ],
    [
      [2, 4],
      [3, 4],
    ], // Left horizontal
  ];

  // Board position index mapping remains the same
  const positionIndices = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23,
  ];

  return (
    <div
      className="relative mx-auto"
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
          fill={isDark ? "#2c2c2c" : "#f5e6c8"}
          rx="8"
        />

        {/* Lines */}
        {lines.map((line, index) => {
          const [[x1, y1], [x2, y2]] = line;
          return (
            <line
              key={index}
              x1={x1 * scale}
              y1={y1 * scale}
              x2={x2 * scale}
              y2={y2 * scale}
              stroke={isDark ? "#666" : "#333"}
              strokeWidth="2"
            />
          );
        })}

        {/* Valid move indicators */}
        {validMoves.map((position) => {
          const [x, y] = positions[position];
          return (
            <circle
              key={`valid-${position}`}
              cx={x * scale}
              cy={y * scale}
              r={dotSize / 2}
              fill="none"
              stroke="#4CAF50"
              strokeWidth="2"
              strokeDasharray="4"
            />
          );
        })}
      </svg>

      {/* Position dots and pieces */}
      {positions.map((pos, index) => {
        const [x, y] = pos;
        const position = positionIndices[index];
        const piece = board[position];
        const isSelected = selectedPosition === position;
        const isValidMove = validMoves.includes(position);
        const isInMill =
          piece !== null && highlightMills && checkForMill(board, position);

        return (
          <div
            key={position}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
              isSelected ? "ring-4 ring-blue-500 rounded-full" : ""
            } ${
              isValidMove ? "cursor-pointer" : piece ? "cursor-pointer" : ""
            }`}
            style={{
              left: `${x * scale}px`,
              top: `${y * scale}px`,
            }}
            onClick={() => onPositionClick(position)}
          >
            {piece === null ? (
              <div
                className={`rounded-full bg-gray-800 dark:bg-gray-600 ${
                  isValidMove ? "opacity-50" : "opacity-100"
                }`}
                style={{ width: `${dotSize}px`, height: `${dotSize}px` }}
              />
            ) : (
              <div
                className={`rounded-full shadow-md transition-transform ${
                  piece === Player.WHITE
                    ? "bg-white border border-gray-300"
                    : "bg-gray-900 border border-gray-700"
                } ${isInMill ? "ring-2 ring-yellow-400" : ""}`}
                style={{
                  width: `${dotSize * 2.5}px`,
                  height: `${dotSize * 2.5}px`,
                  transform: isSelected ? "scale(1.1)" : "scale(1)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
