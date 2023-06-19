import { Component, inject } from '@angular/core';
import { LoginService, User } from '../login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public username_login: string = '';
  public username_create: string = '';
  public loginService = inject(LoginService);
  public user!: User;
  public users$ = this.loginService.getUsers();

  logIn() {
    this.loginService.logIn(this.username_login).subscribe(user => {
      if (user) {
        this.user = user;
      }
    });
  }

  createUser() {
    this.loginService.createUser(this.username_create).subscribe(user => {
      if (user) {
        this.user = user;
      }
    });
  }
}
