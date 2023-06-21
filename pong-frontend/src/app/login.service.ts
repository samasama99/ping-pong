import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';

export type User = {
  id: number;
  username: string;
  matches: Match[];
}

export type Match = {
  id: number;
  player1Id: User;
  player2Id: User;
  winnerId: number;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public socket = new Socket({ url: '10.12.5.5:3001' });
  private url_base = 'http://10.12.5.5:3000/user';
  private gameIsCreated$ = new BehaviorSubject<boolean>(false);

  constructor(private httpClient: HttpClient) {
    this.socket.on('invite', (inviterId: string) => {
      const id = parseInt(inviterId);
      const response = confirm(`You have been invited by player id ${id}. Do you accept?`);
      this.socket.emit('inviteResponse', response);
    });
    this.socket.on('startTheGame', () => {
      console.log("startTheGame")
      this.gameIsCreated$.next(true);
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

  public gameIsCreated() {
    return this.gameIsCreated$;
  }

  public getOnlineUsers() {
    return this.socket.fromEvent('updateOnlineList');
  }

  public addToOnline(id: number) {
    return this.socket.emit('logIn', id);
  }

}
