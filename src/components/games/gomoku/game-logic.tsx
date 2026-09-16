import { Player } from "./types";
import {
  type Difficulty,
  SEARCH_TIME_LIMIT_MS,
  SearchTimeout,
  nowMs,
  runIterativeDeepening,
} from "@/lib/ai-search";

// Max search depth and root-move randomization per difficulty. Easy/Medium
// intentionally search shallower AND pick randomly among the top few root
// moves instead of always the single best, so the AI is beatable and varies
// from game to game rather than playing identically every time.
const DEPTH_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};
const RANDOM_TOP_N_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 3,
  medium: 1,
  hard: 1,
};

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

// The board is always 15x15 (see GomokuGame's initialGameState) - kept as
// one constant so every bounds/center calculation below stays in lockstep.
const BOARD_SIZE = 15;
const CENTER = Math.floor(BOARD_SIZE / 2);

// Strategic position values (higher in center, lower at edges)
const POSITION_VALUES = Array(BOARD_SIZE)
  .fill(0)
  .map((_, row) =>
    Array(BOARD_SIZE)
      .fill(0)
      .map((_, col) => {
        const distToCenter = Math.max(
          Math.abs(CENTER - row),
          Math.abs(CENTER - col)
        );
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
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
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
  col: number
): number {
  let score = 0;

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
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === player) {
        score += evaluateThreats(board, row, col);
        score += WEIGHTS.POSITION_VALUE * POSITION_VALUES[row][col];
      } else if (board[row][col] === opponent) {
        score -= evaluateThreats(board, row, col);
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
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
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
    moves.push({ row: CENTER, col: CENTER });
  }

  return moves;
}

// Enhanced minimax algorithm with alpha-beta pruning.
// `maximizingPlayer` means "it's aiPlayer's turn to move at this node" -
// the search always maximizes aiPlayer's score, whichever color that is,
// rather than assuming a fixed color.
function minimax(
  board: (Player | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  lastMove: { row: number; col: number } | null,
  aiPlayer: Player,
  opponent: Player,
  deadline: number
): { score: number; move?: { row: number; col: number } } {
  if (nowMs() > deadline) throw new SearchTimeout();

  // Check for terminal conditions
  if (lastMove) {
    const { winner } = checkWinner(
      board,
      lastMove.row,
      lastMove.col,
      maximizingPlayer ? opponent : aiPlayer
    );
    if (winner) {
      return {
        score:
          winner === aiPlayer
            ? Number.POSITIVE_INFINITY
            : Number.NEGATIVE_INFINITY,
      };
    }
  }

  if (depth === 0) {
    return { score: evaluatePosition(board, aiPlayer) };
  }

  const moves = getValidMoves(board);
  if (moves.length === 0) {
    return { score: 0 };
  }

  // Sort moves by preliminary evaluation for better pruning
  const movesWithScores = moves.map((move) => {
    const { row, col } = move;
    const mover = maximizingPlayer ? aiPlayer : opponent;
    board[row][col] = mover;
    const score = evaluatePosition(board, mover);
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
    board[row][col] = maximizingPlayer ? aiPlayer : opponent;
    let score: number;
    try {
      score = minimax(
        board,
        depth - 1,
        alpha,
        beta,
        !maximizingPlayer,
        { row, col },
        aiPlayer,
        opponent,
        deadline
      ).score;
    } finally {
      // Always undo the trial move, even if the search above timed out,
      // so a thrown SearchTimeout can never leave a phantom stone on the
      // live board (this board is the same array reference as game state).
      board[row][col] = null;
    }

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

interface RankedMove {
  row: number;
  col: number;
  score: number;
}

// Evaluate every candidate root move to `depth` and return them ranked
// best-first for aiPlayer. Used both to pick the final move and, on lower
// difficulties, as the pool to randomize among.
function getRankedRootMoves(
  board: (Player | null)[][],
  depth: number,
  aiPlayer: Player,
  opponent: Player,
  deadline: number
): RankedMove[] {
  const moves = getValidMoves(board);
  const ranked: RankedMove[] = [];

  for (const { row, col } of moves) {
    board[row][col] = aiPlayer;
    let score: number;
    try {
      score = minimax(
        board,
        depth - 1,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        false,
        { row, col },
        aiPlayer,
        opponent,
        deadline
      ).score;
    } finally {
      board[row][col] = null;
    }
    ranked.push({ row, col, score });
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}

export function makeAIMove(
  board: (Player | null)[][],
  difficulty: Difficulty = "medium",
  aiPlayer: Player = Player.WHITE
): { row: number; col: number } {
  const opponent = aiPlayer === Player.BLACK ? Player.WHITE : Player.BLACK;
  const maxDepth = DEPTH_BY_DIFFICULTY[difficulty];
  const randomTopN = RANDOM_TOP_N_BY_DIFFICULTY[difficulty];
  const deadline = nowMs() + SEARCH_TIME_LIMIT_MS[difficulty];

  const bestRanked = runIterativeDeepening(maxDepth, deadline, (depth) =>
    getRankedRootMoves(board, depth, aiPlayer, opponent, deadline)
  );

  if (bestRanked.length === 0) return getValidMoves(board)[0];

  const pool = bestRanked.slice(0, Math.max(1, randomTopN));
  const choice = pool[Math.floor(Math.random() * pool.length)];
  return { row: choice.row, col: choice.col };
}
