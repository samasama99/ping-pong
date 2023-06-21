import { Component, inject } from '@angular/core';
import { LoginService, User } from '../login.service';
import { GameService } from '../game.service';
import { Observable, combineLatest, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  public username_login = '';
  public username_create = '';
  public user!: User;
  public gameIsCreated: boolean = false;
  public users$;
  public onlineUsersIds$;
  private gameService!: GameService;
  public filteredUsers$;

  constructor(private loginService: LoginService) {
    this.loginService.gameIsCreated().subscribe(_ => { this.gameIsCreated = _ });
    this.users$ = this.loginService.getUsers();
    this.onlineUsersIds$ = this.loginService.getOnlineUsers();

    this.filteredUsers$ = this.onlineUsersIds$.pipe(
      map(onlineIds => JSON.parse(onlineIds as string)),
      switchMap((onlineIds) =>
        this.users$.pipe(
          map((users) =>
            users.filter(u => onlineIds.includes(u.id))
          )
        )
      )
    );
    this.gameService = new GameService(this.loginService);
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
    this.loginService.createUser(this.username_create).subscribe();
  }

  public createGameWith(opponentId: number) {
    this.gameService.createGame(this.user.id, opponentId);
  }

  public createRandomGame() {
    this.gameService.createGame(this.user.id);
  }
}

