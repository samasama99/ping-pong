import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Socket } from 'ngx-socket-io';
import Phaser from 'phaser';
import { Observable, fromEvent } from 'rxjs';
import { ChangeState, MovePlayer1, MovePlayer2, MoveBall, UpdatePlayer1, UpdatePlayer2, UpdateBall, UpdatePlayer1Score, UpdatePlayer2Score } from './game-state/game.actions';

export type GameStateType = 'pending' | 'in queue' | 'player1' | 'player2' | 'finished';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private gameId = 0;
  private playerNumber = 0;
  constructor(private socket: Socket, private store: Store) { }

  createGame() {
    this.socket.emit('createGame');
    this.socket.fromEvent<string>('changeState')
      .subscribe(payload => {
        console.log({ payload });
        const state = JSON.parse(payload);
        if (state.state) {
          this.store.dispatch(ChangeState({ new_state: state.state }));
          this.gameId = state.gameId;
          if (state.state == 'player2') {
            console.log("setting event");
            this.updateBallStateEvent();
            this.updatePlayer1VelocityEvent()
            this.updatePlayerScoreEvent();
          } else if (state.state == 'player1') {
            console.log("setting event");
            this.updatePlayer2VelocityEvent()
          }
        } else if (state) {
          this.store.dispatch(ChangeState({ new_state: state }));
          this.playerNumber = 1;
        }
      })
  }

  updatePlayer1Velocity(velocity: number) {
    const payload = { gameId: this.gameId, player: this.playerNumber, velocity };
    this.socket.emit('updatePlayer1Velocity', JSON.stringify(payload));
  }

  updatePlayer2Velocity(velocity: number) {
    const payload = { gameId: this.gameId, player: this.playerNumber, velocity };
    this.socket.emit('updatePlayer2Velocity', JSON.stringify(payload));
  }

  updateBallState(position: { x: number, y: number }, velocity: { x: number, y: number }) {
    console.log("event trigged", position, velocity)
    const payload = { gameId: this.gameId, player: this.playerNumber, position, velocity };
    this.socket.emit('updateBallState', JSON.stringify(payload));
  }

  updatePlayer1VelocityEvent() {
    this.socket.fromEvent<string>('updatePlayer1VelocityEvent')
      .subscribe((state) => this.store.dispatch(UpdatePlayer1({ new_velocityY: JSON.parse(state).velocity })));
  }

  updatePlayer2VelocityEvent() {
    this.socket.fromEvent<string>('updatePlayer2VelocityEvent')
      .subscribe((state) => this.store.dispatch(UpdatePlayer2({ new_velocityY: JSON.parse(state).velocity })));
  }

  updateBallStateEvent() {
    this.socket.fromEvent<string>('updateBallStateEvent').subscribe((state) => {
      const data: {
        position: { x: number, y: number },
        velocity: { x: number, y: number },
      } = JSON.parse(state);

      this.store.dispatch(UpdateBall({ new_pos: data.position, new_velocity: data.velocity, new_speed: 650 }))
    })
  }


  updatePlayer1Score() {
    this.socket.emit('updatePlayer1Score');
  }

  updatePlayer2Score() {
    this.socket.emit('updatePlayer2Score');
  }

  updatePlayerScoreEvent() {
    this.socket.fromEvent<string>('updatePlayer1ScoreEvent').subscribe(() => {
      this.store.dispatch(UpdatePlayer1Score())
    })
    this.socket.fromEvent<string>('updatePlayer2ScoreEvent').subscribe(() => {
      this.store.dispatch(UpdatePlayer2Score())
    })
  }

}
