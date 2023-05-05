import { Component, OnInit, OnDestroy } from '@angular/core';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline, faComment, faXmarkCircle, faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { ProfileService } from 'src/app/services/profile.service';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { PostsService } from 'src/app/services/posts.service';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-social-feed',
  templateUrl: './social-feed.component.html',
  animations: [
    trigger(
      'slideOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, opacity: 0 }),
            animate('0.2s ease-out',
              style({}))
          ]
        ),
        transition(
          ':leave',
          [
            style({}),
            animate('0.2s ease-in',
              style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
  // styleUrls: ['./social-feed.component.css'],
})


export class SocialFeedComponent implements OnInit {

  // Font Awesome Icons
  faHeartSolid = faHeartSolid;
  faHeartOutline = faHeartOutline;
  faComment = faComment;
  faXmarkCircle = faXmarkCircle;
  faPaperPlane = faPaperPlane;

  private urlProfileHandle;
  profile = this.currentUser.user.profile;
  profileHandle = this.currentUser.user.profile.profileHandle;
  userProfile = false;
  feed = [];

  constructor(
    private profileService: ProfileService,
    public currentUser: CurrentUserService,
    private workoutService: WorkoutsService,
    private afs: AngularFirestore,
    private postsService: PostsService,
    private title: Title
  ) { }

  ngOnInit() {
    this.title.setTitle("Social Feed | FitHub");
    this.postsService.getSocialFeed().then(feed => {
      this.feed = feed;
      this.loadWorkoutCards();
      console.log(feed);
    });
  }

  loadWorkoutCards() {
    for (let post of this.feed) {
      if (post.postWorkout && post.postWorkout != "None") {
        // Get the workout from the database
        const subscription = this.workoutService.getWorkout(post.postWorkout, post.profileHandle).subscribe((workout) => {
          post.workoutData = workout;
          subscription.unsubscribe();
        });
      }
    }
  }

  openWorkout(uid) {

  }

  comment(post) {
    // Get the current server timestamp
    const serverTimestamp = new Timestamp(Date.now() / 1000, 0);

    const comment = {
      commentText: post.commentText,
      commentOwner: this.currentUser.user.profile.profileHandle,
      commentTimeStamp: serverTimestamp,
      commentLikeCount: 0,
      commentLikeOwners: []
    }

    let temp = [comment, ...post.postComments];

    const promise = new Promise((resolve, reject) => {
      this.postsService.postComment(post, comment).then(() => {
        post.commentOpen = false;
        post.commentText = "";
        post.postComments = [];
        resolve(true);
      });
    });

    promise.then(() => {
      setTimeout(() => {
        post.postComments = temp;
      }, 200);
    });
  }

  toggleLikePost(post) {
    const alreadyLiked = post.postLikeOwners.includes(this.profileHandle);

    if (alreadyLiked) {
      post.postLikeOwners.splice(post.postLikeOwners.indexOf(this.profileHandle), 1);
      post.postLikeCount--;
    }
    else {
      post.postLikeOwners.push(this.profileHandle);
      post.postLikeCount++;
    }
    this.postsService.toggleLikePost(post, alreadyLiked);
  }

  toggleLikeComment(post, comment, commentIndex) {
    const alreadyLiked = comment.commentLikeOwners.includes(this.profileHandle);

    if (alreadyLiked) {
      comment.commentLikeOwners.splice(comment.commentLikeOwners.indexOf(this.profileHandle), 1);
      comment.commentLikeCount--;
    }
    else {
      comment.commentLikeOwners.push(this.profileHandle);
      comment.commentLikeCount++;
    }

    this.postsService.toggleLikeComment(post, commentIndex, alreadyLiked);
  }
}