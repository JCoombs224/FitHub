import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ProfileService } from './profile.service';
import { Timestamp } from 'firebase/firestore'
import firebase from 'firebase/compat/app';
import { CurrentUserService } from './current-user.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class PostsService {
  userProfile = false;
  private socialFeed = [];

  constructor(
    private afs: AngularFirestore,
    private toastr: ToastrService,
    private profileService: ProfileService,
    private currentUser: CurrentUserService
  ) { }

  postComment(post, comment) {
    // Get the current post document from Firestore
    const postDocRef = this.afs.collection('profiles').doc(post.profileHandle)
      .collection('posts').doc(post.uid);

    // Get the post document from Firestore
    return postDocRef.get().toPromise().then(postDoc => {
      // Get the post's comments array from the document data
      const postComments = postDoc.data().postComments || [];

      // Add the new comment object to the comments array
      postComments.push(comment);

      // Update the post document with the updated comments array
      postDocRef.update({ postComments: postComments });
    }).catch(error => {
      this.toastr.error("Please try again.", "Something went wrong");
      console.log(error);
    });

  }

  getSocialFeed(force = false) {
    // Get the list of users that the current user is following
    const following = [...this.currentUser.user.profile.following];

    // Add user to the list of users to get posts from
    following.push(this.currentUser.user.profile.profileHandle);

    const promise = new Promise((resolve, reject) => {
      if (!force && this.socialFeed.length > 0) {
        resolve(true);
      }
      else {
        console.log('forcing')
        following.forEach((follow, index) => {
          const subscription = this.afs.collection('profiles').doc(follow).collection('posts', ref => ref.orderBy('postTimeStamp', 'desc')).valueChanges().subscribe(posts => {
            posts.forEach(post => {
              post.postDateString = post.postTimeStamp.toDate().toDateString();
              post.profileHandle = follow;
              post.commentOpen = false; // used to toggle the comment input field
              post.commentText = ''; // used for the comment input field
              post.postComments = [...post.postComments] || [];
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

  fetchPost(post) {
    return this.afs.collection('profiles').doc(post.profileHandle).collection('posts').doc(post.uid).get().toPromise();
  }

  // TODO: Create fetch social feed function

  toggleLikePost(post, alreadyLiked) {
    if (!alreadyLiked) {
      return this.afs.collection('profiles').doc(post.profileHandle).collection('posts').doc(post.uid).update({
        //  Increment the post's like count and add the current user's profile handle to the post's like owners
        postLikeCount: firebase.firestore.FieldValue.increment(1),
        postLikeOwners: firebase.firestore.FieldValue.arrayUnion(this.currentUser.user.profile.profileHandle)
      }).catch(error => {
        this.toastr.error("Please try again.", "Something went wrong");
        console.log(error);
      });
    }
    else {
      return this.afs.collection('profiles').doc(post.profileHandle).collection('posts').doc(post.uid).update({
        //  Decrement the post's like count and remove the current user's profile handle from the post's like owners
        postLikeCount: firebase.firestore.FieldValue.increment(-1),
        postLikeOwners: firebase.firestore.FieldValue.arrayRemove(this.currentUser.user.profile.profileHandle)
      }).catch(error => {
        this.toastr.error("Please try again.", "Something went wrong");
        console.log(error);
      });
    }
  }

  toggleLikeComment(post, commentIndex, alreadyLiked) {

    if (!alreadyLiked) {
      // Get the existing postComments array
      const postRef = this.afs.collection('profiles').doc(post.profileHandle).collection('posts').doc(post.uid);
      return postRef.get().toPromise().then(doc => {
        if (doc.exists) {
          const post = doc.data();
          const postComments = post.postComments.slice(); // Make a copy of the array to modify
          const commentToUpdate = postComments[commentIndex];
          const updatedComment = {
            ...commentToUpdate,
            commentLikeCount: commentToUpdate.commentLikeCount + 1,
            commentLikeOwners: [...commentToUpdate.commentLikeOwners, this.currentUser.user.profile.profileHandle]
          };
          postComments[commentIndex] = updatedComment;
          // Update the entire postComments array with the modified item
          return postRef.update({
            postComments: postComments
          });
        } else {
          this.toastr.error("Document does not exist", "Something went wrong");
          console.log("No such document!");
        }
      }).catch(error => {
        this.toastr.error("Please try again.", "Something went wrong");
        console.log("Error getting document:", error);
      });
    }
    else {
      // Get the existing postComments array
      const postRef = this.afs.collection('profiles').doc(post.profileHandle).collection('posts').doc(post.uid);
      return postRef.get().toPromise().then(doc => {
        if (doc.exists) {
          const post = doc.data();
          const postComments = post.postComments.slice(); // Make a copy of the array to modify
          const commentToUpdate = postComments[commentIndex];
          const updatedComment = {
            ...commentToUpdate,
            commentLikeCount: commentToUpdate.commentLikeCount - 1,
            commentLikeOwners: commentToUpdate.commentLikeOwners.filter(owner => owner != this.currentUser.user.profile.profileHandle)
          };
          postComments[commentIndex] = updatedComment;
          // Update the entire postComments array with the modified item
          return postRef.update({
            postComments: postComments
          });
        } else {
          this.toastr.error("Document does not exist", "Something went wrong");
          console.log("No such document!");
        }
      }).catch(error => {
        this.toastr.error("Please try again.", "Something went wrong");
        console.log("Error getting document:", error);
      });
    }
  }

}
