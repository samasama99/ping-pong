import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import * as flatbuffers from 'flatbuffers';
import { PositionState } from 'src/position-state';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public socket: Socket;
  constructor(private loginService: LoginService) {
    this.socket = loginService.socket;
  }

  createGame(id1: number, id2?: number) {
    this.loginService.socket.emit('createGame', JSON.stringify({ id1, id2 }));
  }

  getState() {
    return this.loginService.socket.fromEvent<string>('changeState')
  }

  sendMyPaddlePosition(position: { x: number, y: number }) {
    const builder = new flatbuffers.Builder();
    const offset = PositionState.createPositionState(builder, position.x, position.y);
    builder.finish(offset);
    const buffer = builder.asUint8Array();

    this.loginService.socket.emit('sendMyPaddleState', buffer);
  }

  updateOpponentPaddle() {
    return this.loginService.socket.fromEvent<ArrayBuffer>('updateOpponentPaddle');
  }

  updateBallStateEvent() {
    return this.loginService.socket.fromEvent<ArrayBuffer>('updateBallState');
  }

  updatePlayerScoreEvent() {
    return this.loginService.socket.fromEvent<string>('UpdateScore');
  }

  playerIsReady() {
    this.loginService.socket.emit('playerIsReady');
  }

}
