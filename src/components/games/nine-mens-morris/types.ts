export enum Player {
  WHITE = "white",
  BLACK = "black",
}

export enum GamePhase {
  PLACING = "placing",
  MOVING = "moving",
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  phase: GamePhase;
  currentPlayer: Player;
  board: (Player | null)[];
  whitePiecesLeft: number;
  blackPiecesLeft: number;
  whitePiecesOnBoard: number;
  blackPiecesOnBoard: number;
  selectedPosition: number | null;
  millFormed: boolean;
  winner: Player | null;
}
