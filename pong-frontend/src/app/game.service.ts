import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Socket } from 'ngx-socket-io';
import { GameStateType, PaddleState, PlayerNumber } from './game-state/game.state';
import { SetPlayerNumber, UpdateBall, UpdateGameState, UpdateOpponentPaddle, UpdateScore } from './game-state/game.actions';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  constructor(private socket: Socket, private store: Store) { }

  createGame() {
    this.socket.emit('createGame');
    return this.socket.fromEvent<string>('changeState')
  }

  sendMyPaddleState(paddleState: PaddleState) {
    const payload = { paddleState };
    this.socket.emit('sendMyPaddleState', JSON.stringify(payload));
  }

  updateOpponentPaddle() {
    this.socket.fromEvent<string>('updateOpponentPaddle').subscribe((state) => {
      const _state = JSON.parse(state);
      this.store.dispatch(UpdateOpponentPaddle({ paddleState: _state.paddleState }))
    })
  }

  updateBallStateEvent() {
    this.socket.fromEvent<string>('updateBallState').subscribe((state) => {
      const { position, velocity }: {
        position: { x: number, y: number },
        velocity: { x: number, y: number },
      } = JSON.parse(state);

      this.store.dispatch(UpdateBall({ position, velocity }))
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


  sendBallState(position: { x: number; y: number; }, velocity: { x: number; y: number; }) {
    this.socket.emit('sendBallState', JSON.stringify({ position: { x: position.x, y: position.y }, velocity: { x: velocity.x, y: velocity.y } }));
  }

}
