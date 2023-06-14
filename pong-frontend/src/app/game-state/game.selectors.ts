import { createSelector } from '@ngrx/store';

export const selectGame = (state: any) => state;

export const selectOpponentPaddleState = createSelector(selectGame, (state) => state.game.opponentPaddle);

export const selectBallState = createSelector(selectGame, (state) => state.game.ball);

export const selectGameState = createSelector(
  selectGame,
  (state) => state.game.state
);

export const selectPlayerScore = createSelector(
  selectGame,
  (state) => state.game.score
);

export const selectPlayerNumber = createSelector(
  selectGame,
  (state) => state.game.playerNumber
);


