import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { isPlatformBrowser } from "@angular/common";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {

  private USER_INFO = "FitHubUser";
  public user = {
    account: {
      uid: '',
      email: '',
      displayName: '',
      photoURL: '',
      profileHandle: '',
      get loggedIn() {
        return this.email;
      }
    },
    profile: this.profileService.initProfile
  };

  public account: BehaviorSubject<any> = new BehaviorSubject<any>(this.user);

  constructor(private router: Router,
              public afs: AngularFirestore,
              private profileService: ProfileService,
              @Inject(PLATFORM_ID) private platformId) {
                this.initialize();
              }

  private initialize() {
    if (isPlatformBrowser(this.platformId)) {
      let localUser = sessionStorage.getItem(this.USER_INFO);
      if (!localUser) {
        localUser = localStorage.getItem(this.USER_INFO);
      }
      if (localUser) {
        this.user = JSON.parse(localUser);
        this.getProfile(this.user.account);
      }
    }
  }

  isLoggedIn() {
    return this.user.account.email != '';
  }

  isUsernameAvailable(username) {
    return this.afs.firestore.doc(`/profiles/${username}`).get()
      .then(docSnapshot => {
        if (docSnapshot.exists) {
          return false;
        }
        return true;
      }).catch((error) => {
        return false;
      });
  }

  /**
   * Sets/updates the profile data in the database.
   * @param profile
   * @returns
   */
  newProfile(profile) {
    const profileRef: AngularFirestoreDocument<any> = this.afs.doc(
      `/profiles/${profile.profileHandle}`
    );
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${this.user.account.uid}`
    );

    // Set account link to profile
    this.user.account.profileHandle = profile.profileHandle;
    userRef.set({ profileHandle: profile.profileHandle }, {
      merge: true
    });

    // Set profile info and link to account
    this.user.profile.uid = this.user.account.uid;
    this.user.profile.profileHandle = profile.profileHandle;
    this.user.profile.profileName = profile.profileName;
    this.user.profile.age = profile.age;
    this.user.profile.weight = profile.weight;
    this.user.profile.heightFeet = profile.heightFeet;
    this.user.profile.heightInches = profile.heightInches;
    this.user.profile.sex = profile.sex;

    this.router.navigate(["/dashboard"]);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.USER_INFO);
      localStorage.setItem(this.USER_INFO, JSON.stringify(this.user));

      sessionStorage.removeItem(this.USER_INFO);
      sessionStorage.setItem(this.USER_INFO, JSON.stringify(this.user));
    }

    return profileRef.set(this.user.profile, {
      merge: true,
    });
  }

  private getProfile(user) {
    this.user.account.profileHandle = user.profileHandle;

    // Get user's profile info then update
    const profileRef: AngularFirestoreDocument<any> = this.afs.doc(
      `/profiles/${user.profileHandle}`
    );
    profileRef.ref.get().then(data => {
      const profile = data.data();

      this.user.profile.uid = profile.uid;
      this.user.profile.profileHandle = profile.profileHandle;
      this.user.profile.profileName = profile.profileName;
      this.user.profile.age = profile.age;
      this.user.profile.weight = profile.weight;
      this.user.profile.heightFeet = profile.heightFeet;
      this.user.profile.heightInches = profile.heightInches;
      this.user.profile.sex = profile.sex;
      this.user.profile.about = profile.about;
      this.user.profile.followers = profile.followers;
      this.user.profile.following = profile.following;
      this.user.profile.posts = profile.posts;

      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem(this.USER_INFO);
        localStorage.setItem(this.USER_INFO, JSON.stringify(this.user));

        sessionStorage.removeItem(this.USER_INFO);
        sessionStorage.setItem(this.USER_INFO, JSON.stringify(this.user));
      }
    });

  }

  setUser(user) {
    this.user.account.uid = user.uid;
    this.user.account.email = user.email;
    this.user.account.displayName = user.displayName;
    this.user.account.photoURL = user.photoURL;
    this.user.account.profileHandle = user.profileHandle;

    if (user.profileHandle) {
      this.getProfile(user);
      this.router.navigate(["/dashboard"]);
    }

    this.account.next(this.user);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.USER_INFO);
      localStorage.setItem(this.USER_INFO, JSON.stringify(this.user));

      sessionStorage.removeItem(this.USER_INFO);
      sessionStorage.setItem(this.USER_INFO, JSON.stringify(this.user));
    }
  }

  logOut() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.USER_INFO);
      sessionStorage.removeItem(this.USER_INFO);
    }
    setTimeout(() => {
      this.initialize();
      // this.account.next(this.account_data);
      this.router.navigate(['']);
    }, 500);
  }

}

