import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { reducer } from './game-state/game.reducer';

import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [
    AppComponent
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
