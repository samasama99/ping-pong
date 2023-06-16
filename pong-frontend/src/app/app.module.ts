import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { reducer } from './game-state/game.reducer';

import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GameComponent } from './game/game.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { GameEffects } from './game-state/game.effects';

const config: SocketIoConfig = { url: 'http://10.12.2.5:3001' };

// const config: SocketIoConfig = { url: 'ws://localhost:3004', options: { transports: ['websocket'] } };

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
  ],
  imports: [
    BrowserModule,
    // StoreModule.forRoot({}, {}),
    EffectsModule.forRoot([GameEffects]),
    StoreModule.forRoot({ game: reducer }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
