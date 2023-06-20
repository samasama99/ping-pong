import { Component, OnInit } from '@angular/core';
import { GameScene } from './game-scene'; // Import your Phaser scene
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor() {
  }

  sendMessage() {
    // this.chatSocket.emit('chatMessage', 'Hello from Angular!');
    // this.gameSocket.emit('gameEvent', { type: 'move', direction: 'right' });
  }
}



