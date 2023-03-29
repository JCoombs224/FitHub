import {Component, OnInit} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CurrentUserService } from '../services/current-user.service';

@Component({
  selector: 'app-header-section',
  templateUrl: './header.html'
})
export class HeaderComponent implements OnInit {

  user = this.currentUserService.profile_data;

  constructor(public authService: AuthService,
              private currentUserService: CurrentUserService) {}

  ngOnInit() {
    
  }
  reload(){
    window.location.reload();
  }
  logOut(){
    this.authService.SignOut();
  }
}
