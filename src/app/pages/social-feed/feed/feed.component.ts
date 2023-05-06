import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
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
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit, OnChanges {

  @Input()
  profileFeed = '';
 
  @Input()
  updateFeed: number;

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
    private toastr: ToastrService,
    private postsService: PostsService,
    private title: Title,
    private router: Router
  ) { }

  ngOnInit() {
    if (!this.profileFeed) {
      this.postsService.getSocialFeed(true).then(feed => {
        this.feed = feed;
        this.loadWorkoutCards();
      });
    }
    else {
      this.postsService.getProfileFeed(this.profileFeed).then(feed => {
        this.feed = feed;
        this.loadWorkoutCards();
      });
    }

  }

  ngOnChanges() {
    /**********THIS FUNCTION WILL TRIGGER WHEN PARENT COMPONENT UPDATES 'someInput'**************/
    //Write your code here
    if (this.profileFeed && this.updateFeed != 0) {
      this.postsService.getProfileFeed(this.profileFeed).then(feed => {
        this.feed = feed;
        this.loadWorkoutCards();
      });
    }
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

  openWorkout(post) {
    this.router.navigate(['/workout/', post.profileHandle, post.postWorkout]);
  }

  deletePost(post) {
    if (confirm("Are you sure you want to delete this post?")) {
      this.postsService.deletePost(post).then(() => {
        this.feed.splice(this.feed.indexOf(post), 1);
        this.toastr.success("Post deleted successfully");
      }).catch((error) => {
        this.toastr.error("Error deleting post");
        console.log(error);
      });
    }
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
