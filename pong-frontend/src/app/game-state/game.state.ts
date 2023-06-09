import { GameStateType } from "../game.service";

export interface GameState {
  player1: PlayerState;
  player2: PlayerState;
  ball: BallState;
  state: GameStateType;
}

export interface PlayerState {
  velocityY: number;
  score: number;
}

export interface BallState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  speed: number;
}

export const initialState: GameState = {
  player1: {
    velocityY: 0,
    score: 0,
  },
  player2: {
    velocityY: 0,
    score: 0,
  },
  ball: {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    speed: 0,
  },
  state: 'pending',
};


