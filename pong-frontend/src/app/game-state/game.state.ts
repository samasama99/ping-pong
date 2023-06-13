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
  score: { myScore: number, opponentScore: number };
  myPaddle: number;
  opponentPaddle: number;
  ball: { x: number, y: number };
  state: GameStateType;
  playerNumber: PlayerNumber;
}

export const initialState: GameState = {
  score: {
    myScore: 0,
    opponentScore: 0
  },

  myPaddle: 0,

  opponentPaddle: 0,

  ball: {
    x: 0, y: 0
  },

  state: GameStateType.Waiting,

  playerNumber: PlayerNumber.NotSetYet,
};


