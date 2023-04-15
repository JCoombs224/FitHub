import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ProfileService } from './profile.service';
import { CurrentUserService } from './current-user.service';
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
    public currentUser: CurrentUserService,
  ) { }

  // Get all workouts for the current user
  getPosts(profile = this.currentUser.user.profile.profileHandle) {
    return this.afs.collection('profiles').doc(profile).collection('posts').valueChanges({ idField: 'uid' });
  }

  newPost(post) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').add({
      postText: post.postText,
      postLikeCount: 0,
      postTimeStamp: new Date().getTime(),
      postComments: {
        commentLikeCount: 0,
        commentLikeOwners: [],
        commentOwner: '',
        commentText: '',
        commentTimeStamp: new Date().getTime(),
      }
    });
  }

  likePost(post) {
    let alreadyLiked = false;
    for (let i = 0; i < post.postLikeOwners.length; i++) {
      if (post.postLikeOwners[i] === this.currentUser.user.profile.profileHandle) {
        alreadyLiked = true;
      }
    }

    if (!alreadyLiked) {
      return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).update({
        postLikeCount: firebase.firestore.FieldValue.increment(1),
        postLikeOwners: firebase.firestore.FieldValue.arrayUnion(this.currentUser.user.profile.profileHandle)
      });
    }
  }

  unlikePost(post) {
    let alreadyLiked = false;
    for (let i = 0; i < post.postLikeOwners.length; i++) {
      if (post.postLikeOwners[i] === this.currentUser.user.profile.profileHandle) {
        alreadyLiked = true;
      }
    }

    if (alreadyLiked) {
      return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).update({
        postLikeCount: firebase.firestore.FieldValue.increment(-1),
        postLikeOwners: firebase.firestore.FieldValue.arrayRemove(this.currentUser.user.profile.profileHandle)
      });
    }
  }

  newComment(post, comment) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).update({
      postComments: firebase.firestore.FieldValue.arrayUnion({
        commentText: comment.commentText,
        commentLikeCount: 0,
        commentTimeStamp: new Date().getTime(),
        commentUser: this.currentUser.user.profile.profileHandle,
      })
    });
  }

  likeComment(post, comment) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).update({
      postComments: firebase.firestore.FieldValue.arrayUnion({
        commentLikeCount: firebase.firestore.FieldValue.increment(1),
        commentLikeOwners: firebase.firestore.FieldValue.arrayUnion(this.currentUser.user.profile.profileHandle),
      })
    });
  }

  unlikeComment(post, comment) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).update({
      postComments: firebase.firestore.FieldValue.arrayUnion({
        commentLikeCount: firebase.firestore.FieldValue.increment(-1),
        commentLikeOwners: firebase.firestore.FieldValue.arrayRemove(this.currentUser.user.profile.profileHandle),
      })
    });
  }

  deletePost(post) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).delete();
  }

  deleteComment(post, comment) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).update({
      postComments: firebase.firestore.FieldValue.arrayRemove(comment)
    });
  }

  // Get all posts for the current user
  getProfilePosts(profile = this.currentUser.user.profile.profileHandle) {
    return this.afs.collection('profiles').doc(profile).collection('posts').valueChanges({ idField: 'uid' });
  }
}

