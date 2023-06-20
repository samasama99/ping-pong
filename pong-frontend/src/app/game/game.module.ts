import { NgModule, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store, StoreModule } from '@ngrx/store';
import { GameEffects } from '../game-state/game.effects';
import { EffectsModule } from '@ngrx/effects';
import { GameComponent } from './game.component';
import { GameService } from '../game.service';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { reducer } from '../game-state/game.reducer';

@NgModule({
  declarations: [GameComponent],
  imports: [
    CommonModule,
    StoreModule.forRoot({ game: reducer }),
    EffectsModule.forRoot([GameEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
  ],
  providers: [],
  exports: [GameComponent],
})
export class GameModule { }
