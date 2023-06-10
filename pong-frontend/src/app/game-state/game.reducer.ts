import { Action, createReducer, on } from '@ngrx/store';
import { GameState, initialState } from './game.state';
import { ChangeState, CreateGame, MovePlayer1, MovePlayer2, MoveBall, UpdatePlayer1, UpdatePlayer2, UpdateBall, UpdatePlayer1Score, UpdatePlayer2Score, IncrementPlayer1Score, IncrementPlayer2Score } from './game.actions';

export type vector = { x: number, y: number };

export const gameReducer = createReducer(
  initialState,
  on(CreateGame, state => ({ ...state })
  ),
  on(MovePlayer1,
    (state, { new_velocityY }) => ({ ...state, player1: { velocityY: new_velocityY, score: state.player1.score } })
  ),
  on(MovePlayer2,
    (state, { new_velocityY }) => ({ ...state, player2: { velocityY: new_velocityY, score: state.player2.score } })
  ),
  on(UpdatePlayer1,
    (state, { new_velocityY }) => ({ ...state, player1: { velocityY: new_velocityY, score: state.player1.score } })
  ),
  on(UpdatePlayer2,
    (state, { new_velocityY }) => ({ ...state, player2: { velocityY: new_velocityY, score: state.player2.score } })
  ),
  on(MoveBall, (state, { new_pos, new_velocity, new_speed }) =>
    ({ ...state, ball: { position: new_pos, velocity: new_velocity, speed: new_speed } })
  ),
  on(UpdateBall, (state, { new_pos, new_velocity, new_speed }) =>
    ({ ...state, ball: { position: new_pos, velocity: new_velocity, speed: new_speed } })
  ),
  on(IncrementPlayer1Score, (state) =>
    ({ ...state, player1: { ...state.player1, score: state.player1.score + 1 } })
  ),
  on(IncrementPlayer2Score, (state) =>
    ({ ...state, player2: { ...state.player2, score: state.player2.score + 1 } })
  ),
  on(UpdatePlayer1Score, (state) =>
    ({ ...state, player1: { ...state.player1, score: state.player1.score + 1 } })
  ),
  on(UpdatePlayer2Score, (state) =>
    ({ ...state, player2: { ...state.player2, score: state.player2.score + 1 } })
  ),
  on(ChangeState, (state, { new_state }) =>
    ({ ...state, state: new_state })
  ),

);

export function reducer(state: GameState = initialState, action: Action): GameState {
  return gameReducer(state, action);
}
