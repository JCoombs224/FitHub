import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FollowersService {

  constructor(private http: HttpClient,
              private afs: AngularFirestore) { }

  getFollowers(profileHandle): AngularFirestoreCollection {
    return this.afs.collection('profiles').doc(profileHandle).collection('followers');
  }
}
