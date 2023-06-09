import { Action, createReducer, on } from '@ngrx/store';
import { GameState, initialState } from './game.state';
import { CreateGame, IncrementPlayerScore1, IncrementPlayerScore2, MovePlayer1, MovePlayer2, UpdateBall } from './game.actions';

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
  on(UpdateBall, (state, { new_pos, new_velocity, new_speed }) =>
    ({ ...state, ball: { position: new_pos, velocity: new_velocity, speed: new_speed } })
  ),
  on(IncrementPlayerScore1, (state) =>
    ({ ...state, player1: { ...state.player1, score: state.player1.score + 1 } })
  ),
  on(IncrementPlayerScore2, (state) =>
    ({ ...state, player2: { ...state.player2, score: state.player2.score + 1 } })
  ),
);

export function reducer(state: GameState = initialState, action: Action): GameState {
  return gameReducer(state, action);
}
