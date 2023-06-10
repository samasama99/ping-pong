import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { GameService } from "../game.service";
import { SendMyPaddleState, } from "./game.actions";
import { tap } from "rxjs";

@Injectable()
export class GameEffects {
  constructor(
    private actions$: Actions,
    private gameService: GameService,
  ) { }

  sendMyPaddleState = createEffect(() =>
    this.actions$.pipe(
      ofType(SendMyPaddleState),
      tap((action) => {
        this.gameService.sendMyPaddleState(action.paddleState);
      })
    ),
    { dispatch: false }
  );
}
