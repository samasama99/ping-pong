import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Socket } from 'ngx-socket-io';
import { UpdateBall, UpdateOpponentPosition, UpdateScore } from './game-state/game.actions';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  constructor(private socket: Socket, private store: Store) { }

  createGame() {
    this.socket.emit('createGame');
    return this.socket.fromEvent<string>('changeState')
  }

  sendMyPaddlePosition(position: { x: number, y: number }) {
    this.socket.emit('sendMyPaddleState', JSON.stringify({ x: position.x, y: position.y }));
  }

  updateOpponentPaddle() {
    this.socket.fromEvent<string>('updateOpponentPaddle').subscribe((state) => {
      const position = JSON.parse(state);
      // console.log("parse", position)
      this.store.dispatch(UpdateOpponentPosition({ position }))
    })
  }

  updateBallStateEvent() {
    this.socket.fromEvent<string>('updateBallState').subscribe((state) => {
      const ball: {
        x: number, y: number
      } = JSON.parse(state);

      this.store.dispatch(UpdateBall({ ball }))
    })
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
