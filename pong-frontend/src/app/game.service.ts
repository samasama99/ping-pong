import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Socket } from 'ngx-socket-io';
import Phaser from 'phaser';
import { Observable, fromEvent } from 'rxjs';
import { ChangeState, UpdateBall } from './game-state/game.actions';

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
            this.updatePlayerVelocityEvent()
            this.updateBallStateEvent();
          }
        } else if (state) {
          this.store.dispatch(ChangeState({ new_state: state }));
          this.playerNumber = 1;
        }
      })
  }

  updatePlayerVelocity(velocity: number) {
    const payload = { gameId: this.gameId, player: this.playerNumber, velocity };
    this.socket.emit('updatePlayerVelocity', JSON.stringify(payload));
  }

  updateBallState(position: { x: number, y: number }, velocity: { x: number, y: number }) {
    const payload = { gameId: this.gameId, player: this.playerNumber, position, velocity };
    this.socket.emit('updateBallState', JSON.stringify(payload));
  }

  updatePlayerVelocityEvent() {
    this.socket.fromEvent<string>('updatePlayerVelocityEvent').subscribe((state) => console.log("j"));
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


}
