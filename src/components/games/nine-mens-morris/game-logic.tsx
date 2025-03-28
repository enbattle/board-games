import { GamePhase, Player, type GameState } from "./types";

// Enhanced strategic weights for expert-level play
const WEIGHTS = {
  PIECE_COUNT: 200,
  MILL_COUNT: 400,
  POTENTIAL_MILLS: 150,
  MOBILITY: 120,
  POSITION_VALUE: 80,
  BLOCKED_OPPONENT: 100,
  DOUBLE_MILL_POTENTIAL: 300,
  TRIPLE_MILL_POTENTIAL: 500,
  PHASE_BONUS: 150,
  CONTROL_CENTER: 180,
  PIECE_DEVELOPMENT: 90,
  ENDGAME_TACTICS: 250,
  PIECE_CONNECTIVITY: 100,
  DEFENSIVE_FORMATION: 120,
  TRAPPED_OPPONENT_PIECE: 150,
};

// Enhanced position values for strategic control
const POSITION_VALUES = [
  8,
  3,
  8, // Top row (corners are highly valuable)
  3,
  6,
  3, // Second row (middle positions control multiple lines)
  8,
  3,
  8, // Third row
  3,
  6,
  3,
  6,
  3,
  3, // Middle rows (center positions are crucial)
  8,
  3,
  8, // Fifth row
  3,
  6,
  3, // Sixth row
  8,
  3,
  8, // Bottom row
];

// Strategic combinations of positions that form strong defensive formations
const DEFENSIVE_FORMATIONS = [
  [0, 1, 3, 9], // Top-left corner defense
  [2, 1, 5, 14], // Top-right corner defense
  [21, 22, 18, 9], // Bottom-left corner defense
  [23, 22, 20, 14], // Bottom-right corner defense
  [4, 7, 10, 13], // Center control formation
];

// Position combinations that can lead to triple mills
const TRIPLE_MILL_PATTERNS = [
  [0, 1, 2, 3, 4, 5], // Top two rows
  [18, 19, 20, 21, 22, 23], // Bottom two rows
  [9, 10, 11, 12, 13, 14], // Middle rows
  [0, 9, 21, 3, 10, 18], // Left side
  [2, 14, 23, 5, 13, 20], // Right side
];

export const mills = [
  // Horizontal mills
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11],
  [12, 13, 14],
  [15, 16, 17],
  [18, 19, 20],
  [21, 22, 23],
  // Vertical mills
  [0, 9, 21],
  [3, 10, 18],
  [6, 11, 15],
  [1, 4, 7],
  [16, 19, 22],
  [8, 12, 17],
  [5, 13, 20],
  [2, 14, 23],
];

export const adjacentPositions: number[][] = [
  [1, 9],
  [0, 2, 4],
  [1, 14],
  [4, 10],
  [1, 3, 5, 7],
  [4, 13],
  [7, 11],
  [4, 6, 8, 16],
  [7, 12],
  [0, 10, 21],
  [3, 9, 11, 18],
  [6, 10, 15],
  [8, 13, 17],
  [5, 12, 14, 20],
  [2, 13, 23],
  [11, 16],
  [7, 15, 17, 19],
  [12, 16],
  [10, 19],
  [16, 18, 20, 22],
  [13, 19],
  [9, 22],
  [19, 21, 23],
  [14, 22],
];

// Check for advanced mill patterns
export function checkForAdvancedMill(
  board: (Player | null)[],
  position: number
): boolean {
  const player = board[position];
  if (player === null) return false;

  return mills.some((mill) => {
    if (mill.includes(position)) {
      return mill.every((pos) => board[pos] === player);
    }
    return false;
  });
}

// Export for backward compatibility
export const checkForMill = checkForAdvancedMill;

// Enhanced valid moves calculation with strategic prioritization
export function getValidMoves(
  board: (Player | null)[],
  position: number,
  canFly: boolean
): number[] {
  if (position === null || board[position] === null) return [];

  if (canFly) {
    return board
      .map((value, index) => (value === null ? index : -1))
      .filter((index) => index !== -1);
  }

  return adjacentPositions[position].filter((pos) => board[pos] === null);
}

// Check for potential triple mills
function checkPotentialTripleMill(
  board: (Player | null)[],
  position: number,
  player: Player
): boolean {
  return TRIPLE_MILL_PATTERNS.some((pattern) => {
    const playerPositions = pattern.filter((pos) => board[pos] === player);
    const emptyPositions = pattern.filter((pos) => board[pos] === null);
    return playerPositions.length >= 4 && emptyPositions.includes(position);
  });
}

// Evaluate piece connectivity (connected pieces are stronger)
function evaluateConnectivity(
  board: (Player | null)[],
  player: Player
): number {
  let connectivity = 0;
  board.forEach((piece, pos) => {
    if (piece === player) {
      adjacentPositions[pos].forEach((adjPos) => {
        if (board[adjPos] === player) connectivity++;
      });
    }
  });
  return connectivity;
}

// Check if a piece is trapped (has no valid moves)
function isTrappedPiece(
  board: (Player | null)[],
  position: number,
  canFly: boolean
): boolean {
  return getValidMoves(board, position, canFly).length === 0;
}

// Find the best piece to remove when a mill is formed
function findBestPieceToRemove(
  board: (Player | null)[],
  player: Player,
  gameState: GameState
): number {
  const opponent = player === Player.WHITE ? Player.BLACK : Player.WHITE;
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestPosition = -1;

  // First, try to find pieces that are not in mills
  for (let i = 0; i < board.length; i++) {
    if (board[i] === opponent && !checkForAdvancedMill(board, i)) {
      const tempBoard = [...board];
      tempBoard[i] = null;
      const score = evaluatePosition(tempBoard, gameState, player);
      if (score > bestScore) {
        bestScore = score;
        bestPosition = i;
      }
    }
  }

  // If no pieces outside mills are found, remove any opponent piece
  if (bestPosition === -1) {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === opponent) {
        const tempBoard = [...board];
        tempBoard[i] = null;
        const score = evaluatePosition(tempBoard, gameState, player);
        if (score > bestScore) {
          bestScore = score;
          bestPosition = i;
        }
      }
    }
  }

  return bestPosition;
}

// Enhanced position evaluation with advanced strategic considerations
function evaluatePosition(
  board: (Player | null)[],
  gameState: GameState,
  player: Player
): number {
  let score = 0;
  const opponent = player === Player.WHITE ? Player.BLACK : Player.WHITE;
  const playerPieces = board.filter((p) => p === player).length;
  const opponentPieces = board.filter((p) => p === opponent).length;

  // Basic piece count evaluation
  score += WEIGHTS.PIECE_COUNT * (playerPieces - opponentPieces);

  // Mill evaluation
  let playerMills = 0;
  let opponentMills = 0;
  mills.forEach((mill) => {
    const millPieces = mill.map((pos) => board[pos]);
    if (millPieces.every((p) => p === player)) playerMills++;
    if (millPieces.every((p) => p === opponent)) opponentMills++;
  });
  score += WEIGHTS.MILL_COUNT * (playerMills - opponentMills);

  // Advanced pattern recognition
  TRIPLE_MILL_PATTERNS.forEach((pattern) => {
    const playerCount = pattern.filter((pos) => board[pos] === player).length;
    const opponentCount = pattern.filter(
      (pos) => board[pos] === opponent
    ).length;
    if (playerCount >= 4) score += WEIGHTS.TRIPLE_MILL_POTENTIAL;
    if (opponentCount >= 4) score -= WEIGHTS.TRIPLE_MILL_POTENTIAL;
  });

  // Defensive formation evaluation
  DEFENSIVE_FORMATIONS.forEach((formation) => {
    const playerPositions = formation.filter(
      (pos) => board[pos] === player
    ).length;
    const opponentPositions = formation.filter(
      (pos) => board[pos] === opponent
    ).length;
    score +=
      WEIGHTS.DEFENSIVE_FORMATION * (playerPositions - opponentPositions);
  });

  // Piece connectivity
  const playerConnectivity = evaluateConnectivity(board, player);
  const opponentConnectivity = evaluateConnectivity(board, opponent);
  score +=
    WEIGHTS.PIECE_CONNECTIVITY * (playerConnectivity - opponentConnectivity);

  // Trapped pieces evaluation
  board.forEach((piece, pos) => {
    if (piece === opponent && isTrappedPiece(board, pos, opponentPieces <= 3)) {
      score += WEIGHTS.TRAPPED_OPPONENT_PIECE;
    }
  });

  // Phase-specific evaluation
  if (gameState.phase === GamePhase.PLACING) {
    // Development and center control in placing phase
    const centerPositions = [4, 10, 13, 19];
    const playerCenterControl = centerPositions.filter(
      (pos) => board[pos] === player
    ).length;
    const opponentCenterControl = centerPositions.filter(
      (pos) => board[pos] === opponent
    ).length;
    score +=
      WEIGHTS.CONTROL_CENTER * (playerCenterControl - opponentCenterControl);

    // Piece development evaluation
    score +=
      WEIGHTS.PIECE_DEVELOPMENT *
      board.reduce((total, piece, pos) => {
        if (piece === player) return total + POSITION_VALUES[pos];
        if (piece === opponent) return total - POSITION_VALUES[pos];
        return total;
      }, 0);
  } else {
    // Endgame tactics
    if (playerPieces <= 4) {
      // Aggressive tactics when having few pieces
      score +=
        WEIGHTS.ENDGAME_TACTICS *
        board.reduce((total, piece, pos) => {
          if (piece === player) {
            const moves = getValidMoves(board, pos, true);
            return total + moves.length * 2; // Prioritize mobility in endgame
          }
          return total;
        }, 0);
    }

    // Mobility evaluation with increased importance
    const playerMobility = board.reduce((total, piece, pos) => {
      if (piece === player) {
        return total + getValidMoves(board, pos, playerPieces <= 3).length;
      }
      return total;
    }, 0);
    const opponentMobility = board.reduce((total, piece, pos) => {
      if (piece === opponent) {
        return total + getValidMoves(board, pos, opponentPieces <= 3).length;
      }
      return total;
    }, 0);
    score += WEIGHTS.MOBILITY * (playerMobility - opponentMobility);
  }

  return score;
}

// Get all possible moves with advanced prioritization
function getAllPossibleMoves(
  gameState: GameState,
  player: Player
): { from: number; to: number; priority: number }[] {
  const moves: { from: number; to: number; priority: number }[] = [];
  const board = gameState.board;
  const playerPieces =
    player === Player.WHITE
      ? gameState.whitePiecesOnBoard
      : gameState.blackPiecesOnBoard;

  if (gameState.phase === GamePhase.PLACING) {
    board.forEach((piece, pos) => {
      if (piece === null) {
        // Calculate move priority based on position value and mill potential
        let priority = POSITION_VALUES[pos];
        if (checkPotentialTripleMill(board, pos, player)) priority += 1000;
        moves.push({ from: -1, to: pos, priority });
      }
    });
  } else {
    board.forEach((piece, pos) => {
      if (piece === player) {
        const validMoves = getValidMoves(board, pos, playerPieces <= 3);
        validMoves.forEach((to) => {
          let priority = POSITION_VALUES[to];
          // Increase priority for moves that form mills
          const tempBoard = [...board];
          tempBoard[pos] = null;
          tempBoard[to] = player;
          if (checkForAdvancedMill(tempBoard, to)) priority += 500;
          if (checkPotentialTripleMill(tempBoard, to, player)) priority += 800;
          moves.push({ from: pos, to, priority });
        });
      }
    });
  }

  // Sort moves by priority
  return moves.sort((a, b) => b.priority - a.priority);
}

// Enhanced minimax algorithm with deeper search and advanced pruning
function minimax(
  gameState: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  isMillMove = false
): {
  score: number;
  move?: { from: number; to: number; removePosition?: number };
} {
  const player = maximizingPlayer ? Player.BLACK : Player.WHITE;

  // Enhanced terminal conditions
  if (depth === 0 || gameState.winner) {
    return {
      score: evaluatePosition(gameState.board, gameState, Player.BLACK),
    };
  }

  const moves = getAllPossibleMoves(gameState, player);
  if (moves.length === 0) {
    return {
      score: maximizingPlayer
        ? Number.NEGATIVE_INFINITY
        : Number.POSITIVE_INFINITY,
    };
  }

  let bestMove:
    | { from: number; to: number; removePosition?: number }
    | undefined;
  let bestScore = maximizingPlayer
    ? Number.NEGATIVE_INFINITY
    : Number.POSITIVE_INFINITY;

  // Iterate through prioritized moves
  for (const moveData of moves) {
    const { from, to } = moveData;
    const newState = { ...gameState };
    const newBoard = [...gameState.board];

    // Apply move
    if (from === -1) {
      newBoard[to] = player;
      if (player === Player.WHITE) {
        newState.whitePiecesLeft--;
        newState.whitePiecesOnBoard++;
      } else {
        newState.blackPiecesLeft--;
        newState.blackPiecesOnBoard++;
      }
    } else {
      newBoard[from] = null;
      newBoard[to] = player;
    }
    newState.board = newBoard;

    // Handle mill formation with advanced tactics
    const millFormed = checkForAdvancedMill(newBoard, to);
    let removePosition: number | undefined;

    if (millFormed && !isMillMove) {
      removePosition = findBestPieceToRemove(newBoard, player, newState);
      if (removePosition !== -1) {
        newBoard[removePosition] = null;
        if (player === Player.WHITE) {
          newState.blackPiecesOnBoard--;
        } else {
          newState.whitePiecesOnBoard--;
        }
      }
    }

    const score = minimax(
      newState,
      depth - 1,
      alpha,
      beta,
      !maximizingPlayer,
      millFormed
    ).score;

    if (maximizingPlayer) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = { from, to, removePosition };
      }
      alpha = Math.max(alpha, score);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = { from, to, removePosition };
      }
      beta = Math.min(beta, score);
    }

    if (beta <= alpha) break;
  }

  return { score: bestScore, move: bestMove };
}

export function makeAIMove(gameState: GameState): GameState {
  // Increased depth for stronger play
  const depth = gameState.phase === GamePhase.PLACING ? 5 : 6;
  const { move } = minimax(
    gameState,
    depth,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    true
  );

  if (!move) return gameState;

  const newState = { ...gameState };
  const newBoard = [...gameState.board];

  // Apply the move
  if (move.from === -1) {
    newBoard[move.to] = Player.BLACK;
    newState.blackPiecesLeft--;
    newState.blackPiecesOnBoard++;
  } else {
    newBoard[move.from] = null;
    newBoard[move.to] = Player.BLACK;
  }

  // Handle mill formation and piece removal
  const millFormed = checkForAdvancedMill(newBoard, move.to);
  if (millFormed && move.removePosition !== undefined) {
    // Remove the opponent's piece if a mill was formed
    newBoard[move.removePosition] = null;
    newState.whitePiecesOnBoard--;
    newState.currentPlayer = Player.WHITE;
  } else if (millFormed) {
    // If mill is formed but no piece removed yet, keep the turn
    newState.millFormed = true;
  } else {
    // No mill formed, switch to other player
    newState.currentPlayer = Player.WHITE;
  }

  newState.board = newBoard;

  // Check if placing phase is over
  if (
    newState.phase === GamePhase.PLACING &&
    newState.whitePiecesLeft === 0 &&
    newState.blackPiecesLeft === 0
  ) {
    newState.phase = GamePhase.MOVING;
  }

  // Check for winner
  if (newState.phase === GamePhase.MOVING) {
    // Win if opponent has less than 3 pieces
    if (newState.whitePiecesOnBoard < 3) {
      newState.winner = Player.BLACK;
    } else {
      // Check if opponent has any legal moves
      let opponentHasValidMoves = false;
      for (let i = 0; i < 24; i++) {
        if (newBoard[i] === Player.WHITE) {
          const moves = getValidMoves(
            newBoard,
            i,
            newState.whitePiecesOnBoard <= 3
          );
          if (moves.length > 0) {
            opponentHasValidMoves = true;
            break;
          }
        }
      }
      if (!opponentHasValidMoves && !millFormed) {
        newState.winner = Player.BLACK;
      }
    }
  }

  return newState;
}
