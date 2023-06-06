export interface GameState {
  player1: PlayerState;
  player2: PlayerState;
  ball: BallState;
}

export interface PlayerState {
  position: { x: number; y: number };
  score: number;
}

export interface BallState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  speed: number;
}
