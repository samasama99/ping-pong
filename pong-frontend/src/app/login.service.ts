import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';

export type User = {
  id: number;
  username: string;
  matches: Match[];
}

export type Match = {
  id: number;
  player1: User;
  player2: User;
  winner: number;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private socket = new Socket({ url: 'localhost:3002' });
  private url_base = 'http://localhost:3000/user';

  constructor(private httpClient: HttpClient) {
    this.socket.on('invite', (inviterId: string) => {
      const id = parseInt(inviterId);
      const response = confirm(`You have been invited by player ${id}. Do you accept?`);
      // this.socket.emit('inviteResponse', { inviterId, accepted: response });
    });
  };

  public logIn(username: string) {
    return this.httpClient.get<User>(`${this.url_base}/${username}`);
  }

  public createUser(username: string) {
    return this.httpClient.post<User>(this.url_base, { username });
  }

  public getUsers() {
    return this.httpClient.get<User[]>(this.url_base);
  }

  public getOnlineUsers() {
    return this.socket.fromEvent<ArrayBuffer>('updateOnlineList');
  }

  public addToOnline(id: number) {
    return this.socket.emit('logIn', id);
  }

}
