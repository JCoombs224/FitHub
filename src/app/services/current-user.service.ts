import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {isPlatformBrowser} from "@angular/common";
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {

  constructor(private router: Router,
              @Inject(PLATFORM_ID) private platformId) { }

  private USER_INFO = "FitHubUser";
  public profile_data = this.initialize();
  public profile: BehaviorSubject<any> = new BehaviorSubject<any>(this.profile_data);

  initialize() {
    let user = {
      uid: '',
      email: '',
      displayName: '',
      photoURL: '',
      age: '',
      weight: '',
      sex: '',
      get loggedIn() {
        return this.user_name;
      }
    };
    if(isPlatformBrowser(this.platformId)) {
      let localUser = sessionStorage.getItem(this.USER_INFO);
      if(!localUser){
        localUser = localStorage.getItem(this.USER_INFO);
      }
      if (localUser) {
        user = JSON.parse(localUser);
      }
    }
    return user;
  }
  setUser(user) {
    this.profile_data.uid = user.uid;
    this.profile_data.email = user.email;
    this.profile_data.displayName = user.displayName;
    this.profile_data.photoURL = user.photoURL;

    this.profile.next(this.profile_data);

    if(isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.USER_INFO);
      localStorage.setItem(this.USER_INFO, JSON.stringify(this.profile_data));

      sessionStorage.removeItem(this.USER_INFO);
      sessionStorage.setItem(this.USER_INFO, JSON.stringify(this.profile_data));
    }
  }
  logOut() {
    if(isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.USER_INFO);
      sessionStorage.removeItem(this.USER_INFO);
    }
    setTimeout(()=> {
      this.profile_data = this.initialize();
      this.profile.next(this.profile_data);
      this.router.navigate(['']);
    },500);
  }

}

