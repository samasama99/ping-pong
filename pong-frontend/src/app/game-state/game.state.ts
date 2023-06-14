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


export interface GameState {
  score: { player1: number, player2: number };
  myPaddle: { x: number, y: number };
  opponentPaddle: { x: number, y: number };
  ball: { x: number, y: number };
  state: GameStateType;
  playerNumber: PlayerNumber;
}

export const initialState: GameState = {
  score: {
    player1: 0,
    player2: 0
  },

  myPaddle: { x: 0, y: 0 },

  opponentPaddle: { x: 0, y: 0 },

  ball: { x: 0, y: 0 },

  state: GameStateType.Waiting,

  playerNumber: PlayerNumber.NotSetYet,
};


