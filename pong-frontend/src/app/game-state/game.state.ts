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

export const initialState: GameState = {
  player1: {
    position: { x: 0, y: 0 },
    score: 0,
  },
  player2: {
    position: { x: 0, y: 0 },
    score: 0,
  },
  ball: {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    speed: 0,
  },
};


