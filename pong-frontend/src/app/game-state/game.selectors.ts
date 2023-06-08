import { createSelector } from '@ngrx/store';
import { GameState } from './game.state';

// Select the game state from the root state
export const selectGame = (state: GameState) => state;

// Select the player positions
export const selectPlayer1 = createSelector(
  selectGame,
  (game: GameState) => game.player1
);

export const selectPlayer2 = createSelector(
  selectGame,
  (game) => game.player2
);

// Select the ball position
export const selectBall = createSelector(
  selectGame,
  (game) => game.ball
);

export const selectPlayer1Position = createSelector(
  selectGame,
  (game: GameState) => game.player1.position
);

export const selectPlayer2Position = createSelector(
  selectGame,
  (game: GameState) => game.player2.position
);

// Select the ball position
export const selectBallPosition = createSelector(
  selectGame,
  (game) => game.ball.position
);

export const selectBallVelocity = createSelector(
  selectGame,
  (game) => game.ball.velocity
);
