import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { GameService } from "../game.service";
import { tap } from "rxjs";
import { SendMyPaddlePosition } from "./game.reducer";

@Injectable()
export class GameEffects {
  constructor(
    private actions$: Actions,
    private gameService: GameService,
  ) { }

  sendMyPaddleState = createEffect(() =>
    this.actions$.pipe(
      ofType(SendMyPaddlePosition),
      tap((action) => {
        this.gameService.sendMyPaddlePosition(action.payload);
      })
    ),
    { dispatch: false }
  );
}
