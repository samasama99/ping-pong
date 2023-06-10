import { createAction, props } from '@ngrx/store';
import { GameStateType, PaddleState, PlayerNumber } from './game.state';

export const CreateGame = createAction('[Game] Create Game');

export const StartGame = createAction('[Game] Start Game');

export const SendMyPaddleState = createAction(
  '[Game] Update My Paddle',
  props<{ paddleState: PaddleState }>()
);

export const UpdateOpponentPaddle = createAction(
  '[Game] Update Opponent Paddle',
  props<{ paddleState: PaddleState }>()
);

export const UpdateBall = createAction(
  '[Game] Update Ball',
  props<{
    position: { x: number, y: number },
    velocity: { x: number, y: number },
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

export const SendBallState = createAction(
  '[Game] Send Ball Position',
  props<{
    position: { x: number, y: number }
    velocity: { x: number, y: number }
  }>()
)
