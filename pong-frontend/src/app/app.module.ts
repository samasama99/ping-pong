import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { reducer } from './game-state/game.reducer';

import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GameComponent } from './game/game.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({}, {}),
    EffectsModule.forRoot([]),
    StoreModule.forRoot({ game: reducer }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
