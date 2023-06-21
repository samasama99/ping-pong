import { Component } from '@angular/core';

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



