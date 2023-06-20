import { Component, inject } from '@angular/core';
import { LoginService, User } from '../login.service';
import { GameService } from '../game.service';
import { Observable, combineLatest, map } from 'rxjs';

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
  public users$: Observable<User[]>;
  public matches$!: Observable<any>;
  public onlineUsersIds$;
  private gameService!: GameService;
  public filteredUsers$;

  constructor(private loginService: LoginService) {
    this.users$ = this.loginService.getUsers();
    this.loginService.gameIsCreated().subscribe(_ => { this.gameIsCreated = _ });
    this.onlineUsersIds$ = this.loginService.getOnlineUsers();
    this.filteredUsers$ = combineLatest(this.users$, this.onlineUsersIds$).pipe(
      map(([users, _onlineIds]) => {
        const onlineIds = JSON.parse(_onlineIds as string);
        return users.filter(u =>
          onlineIds.includes(u.id) && (!this.user || u.id !== this.user.id)
        );
      }),
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

