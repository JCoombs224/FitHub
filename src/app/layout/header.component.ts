import {Component, OnInit} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CurrentUserService } from '../services/current-user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-section',
  templateUrl: './header.html'
})
export class HeaderComponent implements OnInit {

  user = this.currentUserService.user;
  nav = this.router.url;

  constructor(public authService: AuthService,
              private currentUserService: CurrentUserService,
              private router: Router) {}

  ngOnInit() {
    console.log(this.nav);
  }
  reload(){
    window.location.reload();
  }
  logOut(){
    this.authService.SignOut();
  }
}
