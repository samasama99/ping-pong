// export type GameStateType = 'pending' | 'in queue' | 'player1' | 'player2' | 'finished';

export enum GameStateType {
  Created = "Created",
  Queue = "Queue",
  // Preparing = "Preparing",
  Playing = "Playing",
  Finished = "Finished"
};

export enum Player { NotSetYet = 0, One = 1, Two = 2 };
export type Position = { x: number, y: number };
export enum Color { White = 'White', Blue = 'Blue', Green = 'Green' };


export interface GameState {
  score: { player1: number, player2: number };
  myPaddle: Position;
  opponentPaddle: Position;
  ball: Position;
  state: GameStateType;
  playerNumber: Player;
  color: Color;
}

export const initialState: GameState = {
  score: { player1: 0, player2: 0 },
  myPaddle: { x: 0, y: 0 },
  opponentPaddle: { x: 0, y: 0 },
  ball: { x: 0, y: 0 },
  state: GameStateType.Created,
  playerNumber: Player.NotSetYet,
  color: Color.White,
};


