import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Socket } from 'ngx-socket-io';
import { SetPlayerNumber, UpdateBall, UpdateGameState, UpdateOpponentPosition, UpdateScore } from './game-state/game.actions';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  constructor(private socket: Socket, private store: Store) { }

  createGame() {
    this.socket.emit('createGame');
    return this.socket.fromEvent<string>('changeState')
  }

  sendMyPaddlePosition(myPaddle: number) {
    this.socket.emit('sendMyPaddleState', JSON.stringify({ myPaddle }));
  }

  updateOpponentPaddle() {
    this.socket.fromEvent<string>('updateOpponentPaddle').subscribe((state) => {
      const _state = JSON.parse(state);
      const opponentPaddle = _state.myPaddle;
      console.log("parse", opponentPaddle)
      this.store.dispatch(UpdateOpponentPosition({ opponentPaddle }))
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
        myScore: number, opponentScore: number
      } = JSON.parse(payload);
      this.store.dispatch(UpdateScore(score));
    })
  }

  playerIsReady() {
    this.socket.emit('playerIsReady');
  }


  // sendBallState(position: { x: number; y: number; }, velocity: { x: number; y: number; }) {
  //   this.socket.emit('sendBallState', JSON.stringify({ position: { x: position.x, y: position.y }, velocity: { x: velocity.x, y: velocity.y } }));
  // }

}
