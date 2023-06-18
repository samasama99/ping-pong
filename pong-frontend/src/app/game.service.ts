import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Socket } from 'ngx-socket-io';
import { UpdateBall, UpdateOpponentPosition, UpdateScore } from './game-state/game.actions';
import * as flatbuffers from 'flatbuffers';
import { PositionState } from 'src/position-state';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  constructor(public socket: Socket, private store: Store) { }

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
    this.socket.fromEvent<ArrayBuffer>('updateOpponentPaddle').subscribe((state) => {
      const buffer = new flatbuffers.ByteBuffer(new Uint8Array(state));
      const paddleState = PositionState.getRootAsPositionState(buffer);

      const x = paddleState.x();
      const y = paddleState.y();
      this.store.dispatch(UpdateOpponentPosition({ position: { x, y } }));
    });
  }

  updateBallStateEvent() {
    this.socket.fromEvent<ArrayBuffer>('updateBallState').subscribe((state) => {
      const buffer = new flatbuffers.ByteBuffer(new Uint8Array(state));
      const ballState = PositionState.getRootAsPositionState(buffer);

      const x = ballState.x();
      const y = ballState.y();
      this.store.dispatch(UpdateBall({ ball: { x, y } }));
    });
  }

  updatePlayerScoreEvent() {
    this.socket.fromEvent<string>('UpdateScore').subscribe((payload) => {
      const score: {
        player1: number, player2: number
      } = JSON.parse(payload);
      console.log("score parsed", score);
      this.store.dispatch(UpdateScore({ score }));
    })
  }

  playerIsReady() {
    this.socket.emit('playerIsReady');
  }


}
