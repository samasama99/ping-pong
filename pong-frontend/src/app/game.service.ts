import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import * as flatbuffers from 'flatbuffers';
import { PositionState } from 'src/position-state';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public socket = new Socket({ url: 'localhost:3001' });

  constructor() {
    console.log("game service constructed");
  }

  createGame() {
    this.socket.emit('createGame');
    return this.socket.fromEvent<string>('changeState')
  }

  sendMyPaddlePosition(position: { x: number, y: number }) {
    const builder = new flatbuffers.Builder();
    const offset = PositionState.createPositionState(builder, position.x, position.y);
    builder.finish(offset);
    const buffer = builder.asUint8Array();

    this.socket.emit('sendMyPaddleState', buffer);
  }

  updateOpponentPaddle() {
    return this.socket.fromEvent<ArrayBuffer>('updateOpponentPaddle');
  }

  updateBallStateEvent() {
    return this.socket.fromEvent<ArrayBuffer>('updateBallState');
  }

  updatePlayerScoreEvent() {
    return this.socket.fromEvent<string>('UpdateScore');
  }

  playerIsReady() {
    this.socket.emit('playerIsReady');
  }


}
