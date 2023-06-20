import { Component, inject } from '@angular/core';
import { LoginService, User } from '../login.service';
import { GameService } from '../game.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  public username_login = '';
  public username_create = '';
  public user!: User;
  public users$: Observable<User[]>;
  public onlineUsers$ = this.loginService.getOnlineUsers();
  private gameService !: GameService;

  constructor(private loginService: LoginService) {
    this.users$ = this.loginService.getUsers();
  }

  public logIn() {
    if (!this.username_login)
      return;
    this.loginService.logIn(this.username_login).subscribe(u => {
      if (!u) return;
      console.log(u);
      this.user = u;
      this.loginService.addToOnline(u.id);
    });
  }

  public createUser() {
    if (!this.username_create)
      return;
    this.loginService.createUser(this.username_create).subscribe(u => this.user = u);
  }

  public createGameWith(opponentId: number) {
    if (!this.gameService && this.user) {
      this.gameService = new GameService();
    }
    if (this.gameService)
      this.gameService.createGame(this.user.id, opponentId);
  }

  public createRandomGame() {
    if (!this.gameService && this.user) {
      this.gameService = new GameService();
      this.gameService.createGame(this.user.id);
    }
  }
}

