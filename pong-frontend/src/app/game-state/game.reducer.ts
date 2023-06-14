import { Action, createReducer, on } from '@ngrx/store';
import { GameState, initialState } from './game.state';
import { UpdateGameState, CreateGame, SendMyPaddlePosition, UpdateBall, UpdateScore, UpdateOpponentPosition, SetPlayerNumber, } from './game.actions';

export type vector = { x: number, y: number };

export const gameReducer = createReducer(
  initialState,
  on(CreateGame, state => ({ ...state })),
  on(SendMyPaddlePosition, (state, { position }) => ({
    ...state,
    myPaddle: { x: position.x, y: position.y }
  })),
  on(UpdateOpponentPosition, (state, { position }) => ({
    ...state,
    opponentPaddle: { x: position.x, y: position.y }
  })),
  on(UpdateBall, (state, { ball }) =>
    ({ ...state, ball: ball })
  ),
  on(UpdateScore, (state, { myScore, opponentScore }) =>
    ({ ...state, score: { myScore, opponentScore } })
  ),
  on(UpdateGameState, (state, { newState }) =>
    ({ ...state, state: newState })
  ),
  on(SetPlayerNumber, (state, { playerNumber }) =>
    ({ ...state, playerNumber })
  ),

);

export function reducer(state: GameState = initialState, action: Action): GameState {
  return gameReducer(state, action);
}
