import {Component, OnInit} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CurrentUserService } from '../services/current-user.service';
import { Router } from '@angular/router';
import { faHouse, faDumbbell, faFeed, faUser, faCog } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header-section',
  templateUrl: './header.html',
})
export class HeaderComponent implements OnInit {
  // icon declarations
  faHouse = faHouse;
  faDumbbell = faDumbbell;
  faFeed = faFeed;
  faUser = faUser;
  faCog = faCog;

  user = this.currentUserService.user;
  dropdownOpen = false;
  mobile = false;

  constructor(public authService: AuthService,
              private currentUserService: CurrentUserService,
              public router: Router) {}

  ngOnInit() {
    if (window.screen.width === 360) { // 768px portrait
      this.mobile = true;
    }
  }
  reload(){
    window.location.reload();
  }
  logOut(){
    this.authService.SignOut();
  }
}
