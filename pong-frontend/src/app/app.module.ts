import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { reducer } from './game-state/game.reducer';

import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GameComponent } from './game/game.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
  ],
  imports: [
    BrowserModule,
    // StoreModule.forRoot({}, {}),
    // EffectsModule.forRoot([]),
    StoreModule.forRoot({ game: reducer }),
    StoreDevtoolsModule.instrument({ maxAge: 50, logOnly: !isDevMode() }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
