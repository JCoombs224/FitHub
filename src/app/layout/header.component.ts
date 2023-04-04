import {Component, OnInit} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CurrentUserService } from '../services/current-user.service';
import { Router } from '@angular/router';
import { faHouse, faDumbbell, faFeed, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header-section',
  templateUrl: './header.html'
})
export class HeaderComponent implements OnInit {
  // icon declarations
  faHouse = faHouse;
  faDumbbell = faDumbbell;
  faFeed = faFeed;
  faUser = faUser;

  user = this.currentUserService.user;

  constructor(public authService: AuthService,
              private currentUserService: CurrentUserService,
              public router: Router) {}

  ngOnInit() {
    
  }
  reload(){
    window.location.reload();
  }
  logOut(){
    this.authService.SignOut();
  }
}
