import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';
import { GameService } from './game.service';

export type User = {
  id: number;
  username: string;
}

export type Match = {
  id: number;
  player1: { id: number, username: string };
  player2: { id: number, username: string };
  winner: { id: number, username: string };
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public ip;
  public url_base_user;
  public url_base_match;
  public socket: Socket;
  private gameIsCreated$ = new BehaviorSubject<boolean>(false);

  constructor(private httpClient: HttpClient, private gameService: GameService) {
    this.socket = gameService.socket;
    this.ip = this.gameService.ip;
    this.url_base_user = this.gameService.url_base_user;
    this.url_base_match = this.gameService.url_base_match;
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
    return this.httpClient.get<User>(`${this.url_base_user}/${username}`);
  }

  public getMatchHistory(id: number) {
    return this.httpClient.get<Match[]>(`${this.url_base_match}/${id}`);
  }

  public createUser(username: string) {
    return this.httpClient.post<User>(this.url_base_user, { username });
  }

  public getUsers() {
    return this.httpClient.get<User[]>(this.url_base_user);
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
