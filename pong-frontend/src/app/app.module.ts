import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { GameModule } from './game/game.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

// const config: SocketIoConfig = { url: 'localhost:3001' };

// const config: SocketIoConfig = { url: 'ws://localhost:3004', options: { transports: ['websocket'] } };

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    // StoreModule.forRoot({}), // add StoreModule here
    // EffectsModule.forRoot([]),
    GameModule,
    // StoreModule.forRoot({}, {}),
    // SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
