import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from './post.model';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Comment } from './comment.model';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { ProfileService } from 'src/app/services/profile.service';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { PostsService } from 'src/app/services/posts.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-social-feed',
  templateUrl: './social-feed.component.html',
  // styleUrls: ['./social-feed.component.css'],
})


export class SocialFeedComponent implements OnInit {

  private urlProfileHandle;
  profile = this.currentUser.user.profile;
  profileHandle = this.currentUser.user.profile.profileHandle;
  userProfile = false;
  feed;

  constructor(
    private profileService: ProfileService,
    public currentUser: CurrentUserService,
    private workoutService: WorkoutsService,
    private afs: AngularFirestore,
    private postsService: PostsService,
    private title: Title
    ) {}

  ngOnInit() {
    this.title.setTitle("Social Feed | FitHub");
    this.postsService.getSocialFeed().then(feed => {
      this.feed = feed;
      console.log(feed);
    });
  }

  // TODO: Add functionality to update likes and comments

  toggleLike(post) {
    if (post.likes.includes(this.profileHandle)) {
      post.likes.splice(post.likes.indexOf(this.profileHandle), 1);
    } else {
      post.likes.push(this.profileHandle);
    }
    // this.postsService.updatePost(post);
  }
}