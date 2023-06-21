import { createSelector, createFeatureSelector } from '@ngrx/store';
import { GameState } from './game.state';

export const selectGameState = createFeatureSelector<GameState>('game');

export const selectMyPaddleState = createSelector(
  selectGameState,
  (state) => state.myPaddle
);

export const selectOpponentPaddleState = createSelector(
  selectGameState,
  (state) => state.opponentPaddle
);

export const selectBallState = createSelector(
  selectGameState,
  (state) => state.ball
);

export const selectScoreState = createSelector(
  selectGameState,
  (state) => state.score
);

