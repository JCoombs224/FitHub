import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ProfileService } from './profile.service';
import { Timestamp } from 'firebase/firestore'
import firebase from 'firebase/compat/app';
import { CurrentUserService } from './current-user.service';

@Injectable({
  providedIn: 'root'
})

export class PostsService {
  userProfile = false;
  private socialFeed = [];

  constructor(
    private afs: AngularFirestore,
    private profileService: ProfileService,
    private currentUser: CurrentUserService
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
      //  The post image
      postImg: '',
      //  The post workout
      postWorkout: [],
      //  The post text
      postText: '',
      //  The post timestamp
      postTimeStamp: new Timestamp(new Date().getTime(), 0),
    };
  }

  getSocialFeed() {
    // Get the list of users that the current user is following
    const following = [...this.currentUser.user.profile.following];

    // Add user to the list of users to get posts from
    following.push(this.currentUser.user.profile.profileHandle);

    const promise = new Promise((resolve, reject) => {
      if(this.socialFeed.length > 0) {
        resolve(true);
      }
      else {
        following.forEach((follow, index) => {
          const subscription = this.afs.collection('profiles').doc(follow).collection('posts', ref => ref.orderBy('postTimeStamp', 'desc')).valueChanges().subscribe(posts => {
            posts.forEach(post => {
              post.postDateString = post.postTimeStamp.toDate().toDateString();
              post.profileHandle = follow;
              this.socialFeed.push(post);
              subscription.unsubscribe();
            });
            if (index == following.length - 1) {
              // Sort the social feed by timestamp
              this.socialFeed.sort((a, b) => {
                return b.postTimeStamp - a.postTimeStamp;
              });
              resolve(true);
            }
          });
        });
      }
    });

    return promise.then(() => {
      return this.socialFeed;
    });
  }

}
