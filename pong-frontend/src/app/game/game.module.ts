import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store, StoreModule } from '@ngrx/store';
import { GameEffects } from '../game-state/game.effects';
import { EffectsModule } from '@ngrx/effects';
import { GameComponent } from './game.component';
import { GameService } from '../game.service';
import { gameReducer } from '../game-state/game.reducer';
import { GameState } from '../game-state/game.state';

@NgModule({
  declarations: [GameComponent],
  imports: [
    CommonModule,
    StoreModule.forRoot({ game: gameReducer }),
    EffectsModule.forRoot([GameEffects]),
  ],
  providers: [GameService],
  exports: [GameComponent],
})
export class GameModule { }
