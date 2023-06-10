import { Action, createReducer, on } from '@ngrx/store';
import { GameState, PaddleState, initialState } from './game.state';
import { UpdateGameState, CreateGame, SendMyPaddleState, UpdateBall, UpdateScore, UpdateOpponentPaddle, SetPlayerNumber, } from './game.actions';

export type vector = { x: number, y: number };

export const gameReducer = createReducer(
  initialState,
  on(CreateGame, state => ({ ...state })),
  on(SendMyPaddleState,
    (state, { paddleState }) => ({ ...state, myPaddle: paddleState })
  ),
  on(UpdateOpponentPaddle,
    (state, { paddleState }) => ({ ...state, opponentPaddle: paddleState })
  ),
  on(UpdateBall, (state, { position: newPosition, velocity: newVelocity }) =>
    ({ ...state, ball: { position: newPosition, velocity: newVelocity } })
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
