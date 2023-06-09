import { createSelector } from '@ngrx/store';
import { GameState } from './game.state';

// Select the game state from the root state
export const selectGame = (state: any) => state;

// Select the player positions
export const selectPlayer1 = createSelector(
  selectGame,
  (state) => state.game.player1
);

export const selectPlayer2 = createSelector(
  selectGame,
  (state) => state.game.player2
);

// Select the ball position
export const selectBall = createSelector(
  selectGame,
  (state) => state.game.ball
);

export const selectPlayer1Velocity = createSelector(
  selectGame,
  (state) => state.game.player1.velocityY
);

export const selectPlayer2Velocity = createSelector(
  selectGame,
  (state) => state.game.player2.velocityY
);

// Select the ball position
export const selectBallPosition = createSelector(
  selectGame,
  (state) => state.game.ball.position
);

export const selectBallVelocity = createSelector(
  selectGame,
  (state) => state.game.ball.velocity
);

export const getGameState = createSelector(
  selectGame,
  (state) => state.game.state
);
