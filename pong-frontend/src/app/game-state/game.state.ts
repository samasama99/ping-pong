// export type GameStateType = 'pending' | 'in queue' | 'player1' | 'player2' | 'finished';

export enum GameStateType {
  Created = "Created",
  NotCreated = "NotCreated",
  Waiting = "Waiting",
  Pause = "Pause",
  // OutOfSynch = "",
  Queue = "Queue",
  Playing = "Playing",
  Finished = "Finished"
};
export enum PlayerNumber { PlayerOne = 'PlayerOne', PlayerTwo = 'PlayerTwo', NotSetYet = "NotSetYet", AI = "AI" };
export enum PaddleState { Up = "Up", Down = "Down", Stil = "Stil" };


export interface GameState {
  score: { myScore: number, opponentScore: number };
  myPaddle: PaddleState;
  opponentPaddle: PaddleState;
  ball: BallState;
  state: GameStateType;
  playerNumber: PlayerNumber;
}

export interface PlayerState {
  velocityY: number;
  score: number;
}

export interface BallState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
}

export const initialState: GameState = {
  score: {
    myScore: 0,
    opponentScore: 0
  },

  myPaddle: PaddleState.Stil,

  opponentPaddle: PaddleState.Stil,

  ball: {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
  },

  state: GameStateType.Waiting,

  playerNumber: PlayerNumber.NotSetYet,
};


