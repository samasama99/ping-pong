import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  private url_base = 'http://localhost:3000/user';

  constructor(private httpClient: HttpClient) { };

  public logIn(username: string) {
    return this.httpClient.get<User>(`${this.url_base}/${username}`);
  }

  public createUser(username: string) {
    return this.httpClient.post<User>(this.url_base, { username });
  }

  public getUsers() {
    return this.httpClient.get<User[]>(this.url_base);
  }
}
