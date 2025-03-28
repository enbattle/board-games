export enum Player {
  BLACK = "black",
  WHITE = "white",
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: (Player | null)[][];
  currentPlayer: Player;
  winner: Player | null;
  winningLine: Position[];
  moveHistory: (Position & { player: Player })[];
}
