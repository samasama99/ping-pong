import { createAction, props } from '@ngrx/store';
import { GameStateType, PlayerNumber } from './game.state';

export const CreateGame = createAction('[Game] Create Game');

export const StartGame = createAction('[Game] Start Game');

export const SendMyPaddlePosition = createAction(
  '[Game] Update My Paddle',
  props<{ position: { x: number, y: number } }>()
);

export const UpdateOpponentPosition = createAction(
  '[Game] Update Opponent Paddle',
  props<{ position: { x: number, y: number } }>()
);

export const UpdateBall = createAction(
  '[Game] Update Ball',
  props<{
    ball: { x: number, y: number },
  }>()
)

export const UpdateScore = createAction(
  '[Game] Update Players Score',
  props<{ myScore: number, opponentScore: number }>()
)

export const UpdateGameState = createAction(
  '[Game] Change State',
  props<{
    newState: GameStateType
  }>()
)

export const SetPlayerNumber = createAction(
  '[Game] Set Player Number',
  props<{
    playerNumber: PlayerNumber
  }>()
)

