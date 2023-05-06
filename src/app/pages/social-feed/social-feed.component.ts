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
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
    this.title.setTitle("Social Feed | FitHub");
  }

  
}