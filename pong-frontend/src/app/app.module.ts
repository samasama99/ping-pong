import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GameModule } from './game/game.module';

// const config: SocketIoConfig = { url: 'localhost:3001' };

// const config: SocketIoConfig = { url: 'ws://localhost:3004', options: { transports: ['websocket'] } };

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    // GameComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    GameModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
