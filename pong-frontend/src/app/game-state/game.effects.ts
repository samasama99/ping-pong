import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap, filter } from 'rxjs/operators';
import { GameService, GameStateType } from '../game.service';
import { CreateGame, ChangeState, MovePlayer1, UpdateBall } from './game.actions';
import { getGameState } from './game.selectors';
import { Store } from '@ngrx/store';

@Injectable()
export class GameEffects {
  constructor(
    private actions$: Actions,
    private gameService: GameService,
    private store: Store
  ) { }

  // createGame$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(CreateGame),
  //     tap(() => {
  //       this.gameService.createGame().subscribe(state => {
  //         const new_state: GameStateType = state as GameStateType;
  //         console.log('get state', state);
  //         this.store.select(getGameState).pipe(
  //           filter(currentState => currentState !== new_state),
  //           tap(() => {
  //             this.store.dispatch(ChangeState({ new_state }));
  //           })
  //         ).subscribe();
  //       });
  //     })
  //   ),
  //   { dispatch: false }
  // );
  //
  updatePlayerVelocity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MovePlayer1),
      tap((action) => {
        this.gameService.updatePlayerVelocity(action.new_velocityY);
      })
    ),
    { dispatch: false }
  );

  updateBallState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UpdateBall),
      tap((action) => {
        this.gameService.updateBallState(action.new_pos, action.new_velocity);
      })
    ),
    { dispatch: false }
  );
  // Other effects...
}
