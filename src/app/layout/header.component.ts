import {Component, OnInit} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CurrentUserService } from '../services/current-user.service';
import { Router } from '@angular/router';
import { faHouse, faDumbbell, faFeed, faUser, faCog, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { ProfileService } from '../services/profile.service';

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
  faSearch = faSearch;

  // used for search bar requests
  private debounceTimer = null;

  searchQuery = '';
  searchResults;
  subscription;

  user = this.currentUserService.user;
  dropdownOpen = false;
  mobile = false;

  constructor(public authService: AuthService,
              private currentUserService: CurrentUserService,
              private profileService: ProfileService,
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

  search() {
    if(this.searchQuery.length < 1) {
      this.searchResults = null;
      return;
    }

    if(this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (this.searchQuery != '' && this.searchQuery.trim() != '') {
      this.debounceTimer = setTimeout(() => {
        this.subscription = this.profileService.searchProfiles(this.searchQuery).subscribe(results => {
          this.searchResults = results;
          this.subscription.unsubscribe();
        });
      }, 500);
    } else {
      this.searchResults = null;
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = null;
    this.subscription.unsubscribe();
  }

}
