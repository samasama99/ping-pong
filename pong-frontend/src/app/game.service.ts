import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import Phaser from 'phaser';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private socket: Socket) { }

  createGame() {
    this.socket.emit('createGame');
  }
}
