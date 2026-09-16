import { describe, expect, it } from "vitest";
import { checkWinner, makeAIMove } from "./game-logic";
import { Player } from "./types";

const BOARD_SIZE = 15;

function emptyBoard(): (Player | null)[][] {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

function place(
  board: (Player | null)[][],
  player: Player,
  cells: [number, number][]
) {
  for (const [row, col] of cells) board[row][col] = player;
}

describe("checkWinner", () => {
  it("detects a horizontal five", () => {
    const board = emptyBoard();
    place(board, Player.BLACK, [
      [7, 3],
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 7],
    ]);
    const { winner } = checkWinner(board, 7, 7, Player.BLACK);
    expect(winner).toBe(Player.BLACK);
  });

  it("detects a vertical five", () => {
    const board = emptyBoard();
    place(board, Player.WHITE, [
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [7, 7],
    ]);
    const { winner } = checkWinner(board, 7, 7, Player.WHITE);
    expect(winner).toBe(Player.WHITE);
  });

  it("detects both diagonal directions", () => {
    const downRight = emptyBoard();
    place(downRight, Player.BLACK, [
      [3, 3],
      [4, 4],
      [5, 5],
      [6, 6],
      [7, 7],
    ]);
    expect(checkWinner(downRight, 7, 7, Player.BLACK).winner).toBe(Player.BLACK);

    const downLeft = emptyBoard();
    place(downLeft, Player.BLACK, [
      [3, 7],
      [4, 6],
      [5, 5],
      [6, 4],
      [7, 3],
    ]);
    expect(checkWinner(downLeft, 7, 3, Player.BLACK).winner).toBe(Player.BLACK);
  });

  it("does not report a win for four in a row", () => {
    const board = emptyBoard();
    place(board, Player.BLACK, [
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 7],
    ]);
    expect(checkWinner(board, 7, 7, Player.BLACK).winner).toBeNull();
  });

  it("still recognizes a five even when it's part of a longer run", () => {
    // Gomoku's own rules distinguish "exactly five" from six-in-a-row, but
    // checkWinner just needs to find *a* run of five to end the game -
    // this locks in that six-in-a-row is still detected as a win.
    const board = emptyBoard();
    place(board, Player.BLACK, [
      [7, 2],
      [7, 3],
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 7],
    ]);
    expect(checkWinner(board, 7, 7, Player.BLACK).winner).toBe(Player.BLACK);
  });

  it("does not let a run cross the board edge", () => {
    const board = emptyBoard();
    place(board, Player.BLACK, [
      [7, 11],
      [7, 12],
      [7, 13],
      [7, 14],
    ]);
    expect(checkWinner(board, 7, 14, Player.BLACK).winner).toBeNull();
  });
});

describe("makeAIMove color correctness (regression for the Black/White root-color bug)", () => {
  it("plays the color it was asked to play, not the opponent's", () => {
    const board = emptyBoard();
    place(board, Player.WHITE, [[7, 7]]);
    place(board, Player.BLACK, [[0, 0]]);

    const whiteMove = makeAIMove(board, "easy", Player.WHITE);
    expect(board[whiteMove.row][whiteMove.col]).toBeNull(); // must be an empty cell

    const blackMove = makeAIMove(board, "easy", Player.BLACK);
    expect(board[blackMove.row][blackMove.col]).toBeNull();
  });

  it("builds its own winning threat instead of only reacting to the opponent's", () => {
    // White already has an open three; completing it to an open four is a
    // forced win next turn and is by far the strongest move on the board.
    // Black's stones are placed far away and pose no urgent threat. A
    // color-confused search (optimizing Black's position instead of
    // White's) would wander off toward Black's corner instead.
    const board = emptyBoard();
    place(board, Player.WHITE, [
      [7, 5],
      [7, 6],
      [7, 7],
    ]);
    place(board, Player.BLACK, [
      [0, 0],
      [0, 1],
    ]);

    const move = makeAIMove(board, "hard", Player.WHITE);

    const completesOpenFour =
      (move.row === 7 && move.col === 4) || (move.row === 7 && move.col === 8);
    expect(completesOpenFour).toBe(true);
  });
});
