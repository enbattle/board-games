import { Player } from "./types";

// Strategic weights for expert-level play
const WEIGHTS = {
  WIN: 1000000,
  OPEN_FOUR: 50000, // Four in a row with both ends open
  FOUR: 10000, // Four in a row with one end open
  OPEN_THREE: 5000, // Three in a row with both ends open
  THREE: 1000, // Three in a row with one end open
  OPEN_TWO: 100, // Two in a row with both ends open
  TWO: 10, // Two in a row with one end open
  CENTER_CONTROL: 30, // Value of controlling center positions
  POSITION_VALUE: 5, // Base value for strategic positions
};

// Strategic position values (higher in center, lower at edges)
const POSITION_VALUES = Array(15)
  .fill(0)
  .map((_, row) =>
    Array(15)
      .fill(0)
      .map((_, col) => {
        const distToCenter = Math.max(Math.abs(7 - row), Math.abs(7 - col));
        return Math.max(8 - distToCenter, 1);
      })
  );

// Directions for checking patterns
const DIRECTIONS = [
  [1, 0], // Horizontal
  [0, 1], // Vertical
  [1, 1], // Diagonal \
  [1, -1], // Diagonal /
];

// Pattern definitions for threat detection
const PATTERNS = {
  FIVE: "11111", // Win
  OPEN_FOUR: "011110", // One move to win, can't be blocked
  FOUR: ["011112", "211110"], // One move to win, can be blocked
  OPEN_THREE: "01110", // Two moves to win, hard to block
  THREE: ["11100", "00111", "10110", "01101"], // Two moves to win, can be blocked
  OPEN_TWO: "00110", // Three moves to win, building threat
};

// Check if a position is within the board bounds
function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 15 && col >= 0 && col < 15;
}

// Get line of positions in a direction for pattern matching
function getLine(
  board: (Player | null)[][],
  row: number,
  col: number,
  direction: [number, number],
  length: number
): string {
  let line = "";
  const player = board[row][col];
  if (!player) return "";

  const [dr, dc] = direction;
  const playerChar = player === Player.BLACK ? "1" : "2";

  // Look backwards first
  let r = row - dr * 4;
  let c = col - dc * 4;
  for (let i = 0; i < length; i++) {
    if (!isValidPosition(r, c)) {
      line += "2"; // Treat out of bounds as opponent's piece
    } else {
      const cell = board[r][c];
      if (cell === player) line += "1";
      else if (cell === null) line += "0";
      else line += "2";
    }
    r += dr;
    c += dc;
  }
  return line;
}

// Check for winning line
export function checkWinner(
  board: (Player | null)[][],
  row: number,
  col: number,
  player: Player
): { winner: Player | null; winningLine: { row: number; col: number }[] } {
  for (const [dr, dc] of DIRECTIONS) {
    const line = [];

    // Check in both directions
    for (let i = -4; i <= 4; i++) {
      const newRow = row + i * dr;
      const newCol = col + i * dc;

      if (isValidPosition(newRow, newCol) && board[newRow][newCol] === player) {
        line.push({ row: newRow, col: newCol });

        if (line.length === 5) {
          return { winner: player, winningLine: line };
        }
      } else {
        line.length = 0;
      }
    }
  }

  return { winner: null, winningLine: [] };
}

// Evaluate threats in a position
function evaluateThreats(
  board: (Player | null)[][],
  row: number,
  col: number,
  player: Player
): number {
  let score = 0;
  const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;

  for (const [dr, dc] of DIRECTIONS) {
    const line = getLine(board, row, col, [dr, dc], 9);

    // Check for various patterns
    if (line.includes(PATTERNS.FIVE)) {
      score += WEIGHTS.WIN;
    } else if (line.includes(PATTERNS.OPEN_FOUR)) {
      score += WEIGHTS.OPEN_FOUR;
    } else if (PATTERNS.FOUR.some((pattern) => line.includes(pattern))) {
      score += WEIGHTS.FOUR;
    } else if (line.includes(PATTERNS.OPEN_THREE)) {
      score += WEIGHTS.OPEN_THREE;
    } else if (PATTERNS.THREE.some((pattern) => line.includes(pattern))) {
      score += WEIGHTS.THREE;
    } else if (line.includes(PATTERNS.OPEN_TWO)) {
      score += WEIGHTS.OPEN_TWO;
    }

    // Subtract opponent's threats
    const oppLine = line
      .replace(/1/g, "3")
      .replace(/2/g, "1")
      .replace(/3/g, "2");
    if (oppLine.includes(PATTERNS.OPEN_FOUR)) {
      score -= WEIGHTS.OPEN_FOUR * 1.2; // Prioritize blocking opponent's winning moves
    }
  }

  return score;
}

// Enhanced position evaluation
function evaluatePosition(board: (Player | null)[][], player: Player): number {
  let score = 0;
  const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;

  // Evaluate each position on the board
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      if (board[row][col] === player) {
        score += evaluateThreats(board, row, col, player);
        score += WEIGHTS.POSITION_VALUE * POSITION_VALUES[row][col];
      } else if (board[row][col] === opponent) {
        score -= evaluateThreats(board, row, col, opponent);
        score -= WEIGHTS.POSITION_VALUE * POSITION_VALUES[row][col];
      }
    }
  }

  return score;
}

// Get valid moves with intelligent pruning
function getValidMoves(
  board: (Player | null)[][]
): { row: number; col: number }[] {
  const moves: { row: number; col: number }[] = [];
  const visited = new Set<string>();

  // Only consider moves adjacent to existing pieces
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      if (board[row][col] !== null) {
        // Check adjacent positions
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const newRow = row + dr;
            const newCol = col + dc;
            const key = `${newRow},${newCol}`;

            if (
              isValidPosition(newRow, newCol) &&
              board[newRow][newCol] === null &&
              !visited.has(key)
            ) {
              moves.push({ row: newRow, col: newCol });
              visited.add(key);
            }
          }
        }
      }
    }
  }

  // If no moves found (empty board), start in center area
  if (moves.length === 0) {
    const center = Math.floor(15 / 2);
    moves.push({ row: center, col: center });
  }

  return moves;
}

// Enhanced minimax algorithm with alpha-beta pruning
function minimax(
  board: (Player | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  lastMove: { row: number; col: number } | null
): { score: number; move?: { row: number; col: number } } {
  // Check for terminal conditions
  if (lastMove) {
    const { winner } = checkWinner(
      board,
      lastMove.row,
      lastMove.col,
      maximizingPlayer ? Player.WHITE : Player.BLACK
    );
    if (winner) {
      return {
        score:
          winner === Player.BLACK
            ? Number.POSITIVE_INFINITY
            : Number.NEGATIVE_INFINITY,
      };
    }
  }

  if (depth === 0) {
    return { score: evaluatePosition(board, Player.BLACK) };
  }

  const moves = getValidMoves(board);
  if (moves.length === 0) {
    return { score: 0 };
  }

  // Sort moves by preliminary evaluation for better pruning
  const movesWithScores = moves.map((move) => {
    const { row, col } = move;
    board[row][col] = maximizingPlayer ? Player.BLACK : Player.WHITE;
    const score = evaluatePosition(
      board,
      maximizingPlayer ? Player.BLACK : Player.WHITE
    );
    board[row][col] = null;
    return { ...move, score };
  });

  movesWithScores.sort((a, b) =>
    maximizingPlayer ? b.score - a.score : a.score - b.score
  );

  let bestMove: { row: number; col: number } | undefined;
  let bestScore = maximizingPlayer
    ? Number.NEGATIVE_INFINITY
    : Number.POSITIVE_INFINITY;

  for (const { row, col } of movesWithScores) {
    board[row][col] = maximizingPlayer ? Player.BLACK : Player.WHITE;
    const score = minimax(board, depth - 1, alpha, beta, !maximizingPlayer, {
      row,
      col,
    }).score;
    board[row][col] = null;

    if (maximizingPlayer) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = { row, col };
      }
      alpha = Math.max(alpha, score);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = { row, col };
      }
      beta = Math.min(beta, score);
    }

    if (beta <= alpha) break;
  }

  return { score: bestScore, move: bestMove };
}

export function makeAIMove(board: (Player | null)[][]): {
  row: number;
  col: number;
} {
  const depth = 4; // Adjust based on performance requirements
  const { move } = minimax(
    board,
    depth,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    true,
    null
  );
  return move || getValidMoves(board)[0];
}
