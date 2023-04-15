import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ProfileService } from './profile.service';
import { CurrentUserService } from './current-user.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PostsService {
  profile = this.profileService.initProfile;
  userProfile = false;

  constructor(
    private db: AngularFireDatabase,
    private afs: AngularFirestore,
    private profileService: ProfileService,
    public currentUser: CurrentUserService,
  ) { }

  // Get all workouts for the current user
  getPosts(profile = this.currentUser.user.profile.profileHandle) {
    return this.afs.collection('profiles').doc(profile).collection('posts').valueChanges({ idField: 'uid' });
  }
}

