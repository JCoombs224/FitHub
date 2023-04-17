import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { faBullseye } from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(public afs: AngularFirestore) { }

  get initProfile() {
    return {
      uid: '',
      profileHandle: '', // @user1234
      profileName: '',
      age: '',
      weight: '',
      heightFeet: '',
      heightInches: '',
      sex: '',
      about: '',
      profilePicture: '',
      isPrivate: false,
      workouts: [{}],
      followers: [],
      following: [],
      posts: []
    };
  }

  getProfile(username): AngularFirestoreDocument<any> {
    return this.afs.doc(`/profiles/${username}`);
  }
}
