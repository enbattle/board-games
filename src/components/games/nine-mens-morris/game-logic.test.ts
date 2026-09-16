import { describe, expect, it } from "vitest";
import {
  adjacentPositions,
  checkForMill,
  hasAnyValidMoves,
  makeAIMove,
  mills,
} from "./game-logic";
import { GamePhase, Player, type GameState } from "./types";

function emptyBoard(): (Player | null)[] {
  return Array(24).fill(null);
}

describe("adjacentPositions (the board's move graph)", () => {
  it("is symmetric - every edge is listed from both endpoints", () => {
    adjacentPositions.forEach((neighbors, position) => {
      neighbors.forEach((neighbor) => {
        expect(adjacentPositions[neighbor]).toContain(position);
      });
    });
  });

  it("has no self-loops", () => {
    adjacentPositions.forEach((neighbors, position) => {
      expect(neighbors).not.toContain(position);
    });
  });

  it("has exactly 32 edges (regression: no phantom center-crossing edge)", () => {
    const totalDegree = adjacentPositions.reduce(
      (sum, neighbors) => sum + neighbors.length,
      0
    );
    expect(totalDegree / 2).toBe(32);
  });

  it("does not connect position 7 and 16 - there is no line through the board's center", () => {
    // Positions 7 and 16 are the inner square's top-middle and
    // bottom-middle points. No line is drawn between them (the four
    // spokes stop at the inner square on each side), so a piece may not
    // move directly between them.
    expect(adjacentPositions[7]).not.toContain(16);
    expect(adjacentPositions[16]).not.toContain(7);
  });
});

describe("mills", () => {
  it("has 16 mills, each exactly 3 positions on the board", () => {
    expect(mills).toHaveLength(16);
    mills.forEach((mill) => {
      expect(mill).toHaveLength(3);
      mill.forEach((position) => {
        expect(position).toBeGreaterThanOrEqual(0);
        expect(position).toBeLessThan(24);
      });
    });
  });
});

describe("checkForMill", () => {
  it("is true when all three positions of a mill share the same player", () => {
    const board = emptyBoard();
    board[0] = Player.WHITE;
    board[1] = Player.WHITE;
    board[2] = Player.WHITE;
    expect(checkForMill(board, 0)).toBe(true);
  });

  it("is false when the mill is mixed or incomplete", () => {
    const board = emptyBoard();
    board[0] = Player.WHITE;
    board[1] = Player.BLACK;
    board[2] = Player.WHITE;
    expect(checkForMill(board, 0)).toBe(false);
  });

  it("is false for an empty position", () => {
    expect(checkForMill(emptyBoard(), 0)).toBe(false);
  });
});

describe("hasAnyValidMoves", () => {
  it("is true when flying (<=3 pieces) as long as any cell is empty", () => {
    const board = emptyBoard();
    board[6] = Player.WHITE;
    expect(hasAnyValidMoves(board, Player.WHITE, 3)).toBe(true);
  });

  it("is false when every one of the player's pieces is fully surrounded and can't fly", () => {
    // The four corners of the inner square (6, 8, 15, 17) have exactly
    // two neighbors each: {7, 11}, {7, 12}, {11, 16}, {12, 16}. Filling
    // all four neighbors with the opponent blocks every one of these
    // pieces at once.
    const board = emptyBoard();
    board[6] = Player.WHITE;
    board[8] = Player.WHITE;
    board[15] = Player.WHITE;
    board[17] = Player.WHITE;
    board[7] = Player.BLACK;
    board[11] = Player.BLACK;
    board[12] = Player.BLACK;
    board[16] = Player.BLACK;

    expect(hasAnyValidMoves(board, Player.WHITE, 4)).toBe(false);
  });

  it("is true for the same blocked position once the player can fly", () => {
    const board = emptyBoard();
    board[6] = Player.WHITE;
    board[7] = Player.BLACK;
    board[11] = Player.BLACK;

    expect(hasAnyValidMoves(board, Player.WHITE, 3)).toBe(true);
  });
});

describe("makeAIMove", () => {
  const initialState: GameState = {
    phase: GamePhase.PLACING,
    currentPlayer: Player.BLACK,
    board: emptyBoard(),
    whitePiecesLeft: 9,
    blackPiecesLeft: 9,
    whitePiecesOnBoard: 0,
    blackPiecesOnBoard: 0,
    selectedPosition: null,
    millFormed: false,
    winner: null,
  };

  it("places a Black piece (the AI always plays Black) and never the wrong color", () => {
    const result = makeAIMove(initialState, "easy");
    const placedCount = result.board.filter((p) => p === Player.BLACK).length;
    expect(placedCount).toBe(1);
    expect(result.board.filter((p) => p === Player.WHITE).length).toBe(0);
    expect(result.blackPiecesOnBoard).toBe(1);
    expect(result.blackPiecesLeft).toBe(8);
  });
});
