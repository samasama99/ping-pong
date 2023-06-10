import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap, filter } from 'rxjs/operators';
import { GameService, GameStateType } from '../game.service';
import { CreateGame, ChangeState, MovePlayer1, MoveBall, MovePlayer2, UpdatePlayer1Score, UpdatePlayer2Score, IncrementPlayer1Score, IncrementPlayer2Score } from './game.actions';
import { getGameState } from './game.selectors';
import { Store } from '@ngrx/store';

@Injectable()
export class GameEffects {
  constructor(
    private actions$: Actions,
    private gameService: GameService,
    private store: Store
  ) { }


  updatePlayer1Velocity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MovePlayer1),
      tap((action) => {
        this.gameService.updatePlayer1Velocity(action.new_velocityY);
      })
    ),
    { dispatch: false }
  );

  updatePlayer2Velocity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MovePlayer2),
      tap((action) => {
        this.gameService.updatePlayer2Velocity(action.new_velocityY);
      })
    ),
    { dispatch: false }
  );

  updateBallState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MoveBall),
      tap((action) => {
        this.gameService.updateBallState(action.new_pos, action.new_velocity);
      })
    ),
    { dispatch: false }
  );

  updatePlayer1Score$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncrementPlayer1Score),
      tap(() => {
        this.gameService.updatePlayer1Score();
      })
    ),
    { dispatch: false }
  );

  updatePlayer2Score$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncrementPlayer2Score),
      tap(() => {
        this.gameService.updatePlayer2Score();
      })
    ),
    { dispatch: false }
  );

  // Other effects...
}
