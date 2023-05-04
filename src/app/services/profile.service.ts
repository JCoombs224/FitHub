import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable, debounceTime } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(public afs: AngularFirestore) { }

  profilesCollection: any;

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
      completedWorkouts: [{}],
      workouts: [{}],
      followers: [],
      following: [],
      posts: []
    };
  }

  getProfile(username): AngularFirestoreDocument<any> {
    return this.afs.doc(`/profiles/${username}`);
  }

  searchProfiles(query: string): Observable<any> {
    this.profilesCollection = this.afs.collection<any>('profiles', ref =>
      ref.where('profileHandle', '>=', query)
         .where('profileHandle', '<=', query + '\uf8ff')
         .orderBy('profileHandle')
         .limit(10)
    );
    
    return this.profilesCollection.valueChanges();
  }
}
