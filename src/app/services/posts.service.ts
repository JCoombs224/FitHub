import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ProfileService } from './profile.service';
import { Timestamp } from 'firebase/firestore'
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})

export class PostsService {
  profile = this.profileService.initProfile;
  userProfile = false;

  constructor(
    private afs: AngularFirestore,
    private profileService: ProfileService,
  ) { }

  get initPost() {
    return {
      //  Unique ID for the post
      uid: '',
      // Comments inner structure
      postComments: [{
                      commentLikeCount: 0,
                      commentLikeOwners: [],
                      commentOwner: '',
                      commentText: '',
                      commentTimeStamp: new Timestamp(new Date().getTime(), 0),
                    }],
      //  Number of likes for the post
      postLikeCount: 0,
      //  Array of users who liked the post
      postLikeOwners: [],
      //  The post text
      postText: '',
      //  The post timestamp
      postTimeStamp: new Timestamp(new Date().getTime(), 0),
    };
  }

  // Get all workouts for the current user
  getPosts(profile = this.profile.profileHandle) {
    return this.afs.collection('profiles').doc(profile).collection('posts', ref => ref.orderBy('postTimeStamp', 'desc')).snapshotChanges().subscribe(posts => console.log(posts));
  }
}
