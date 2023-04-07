import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

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
      isPrivate: Boolean,
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
