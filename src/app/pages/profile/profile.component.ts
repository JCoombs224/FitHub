import { Component, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { ProfileService } from 'src/app/services/profile.service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

// import { FormBuilder, Validators } from '@angular/forms';
// import { AngularFireDatabase } from '@angular/fire/compat/database';
// import { GeneralService } from 'src/app/services/general.service';
// import { ToastrService } from 'ngx-toastr';
// import { faGoogle } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent {

  private urlProfileHandle;
  profile = this.profileService.initProfile;
  userProfile = false;
  isPrivate = false;
  showModal = false;
  modalRef: BsModalRef;
  @ViewChild('followersModal') followersModal: ElementRef;
  @ViewChild('followingModal') followingModal: ElementRef;
  @ViewChild('workoutsModal') workoutsModal: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    public authService: AuthService,
    private profileService: ProfileService,
    public currentUser: CurrentUserService,
    private modalService: BsModalService,
    // private fb: FormBuilder,
    // private generalService: GeneralService
    // private db: AngularFireDatabase,
    // private router: Router,
    // private toastr: ToastrService,
    ) {}


  ngOnInit(): void {
    // Subscribe to the url param for the profile username and update the page based on that
    this.route.paramMap.subscribe(params => {
      this.urlProfileHandle = params.get('name');
      this.loadProfileData();
      this.title.setTitle(`@${this.urlProfileHandle} | FitHub`);
    });
    this.showLatestPosts();
    this.checkFollowers();
  }


  private loadProfileData() {
    // Check if the profile handle is the current user
    if(this.urlProfileHandle == this.currentUser.user.profile.profileHandle) {
      // Set the profile to the current user information
      this.profile = this.currentUser.user.profile;
      this.userProfile = true;
    }
    else {
      this.userProfile = false;
      this.profileService.getProfile(this.urlProfileHandle).ref.get().then(data => {
        const profData = data.data();

        this.profile.uid = profData.uid;
        this.profile.profileHandle = profData.profileHandle;
        this.profile.profileName = profData.profileName;
        this.profile.age = profData.age;
        this.profile.weight = profData.weight;
        this.profile.heightFeet = profData.heightFeet;
        this.profile.heightInches = profData.heightInches;
        this.profile.sex = profData.sex;
        this.profile.about = profData.about;
        this.profile.followers = profData.followers;
        this.profile.following = profData.following;
        this.profile.posts = profData.posts;
        this.profile.isPrivate = profData.isPrivate;
        this.profile.profilePicture = profData.profilePicture;
      });
    }
  }

  addToFollowing() {
    //  Reference the firebase database
    const db = firebase.firestore();

    //  Reference the profiles document associated with the current user's and the target user's profilehandles
    const docRefUser = db.collection('profiles').doc(this.currentUser.user.profile.profileHandle);
    const docRefTarget = db.collection('profiles').doc(this.profile.profileHandle);

    //  Update the following by calling arrayUnion and adding the value in the PostText element on the HTML doc.
    docRefUser.update({
      following: firebase.firestore.FieldValue.arrayUnion(this.urlProfileHandle)
    });

    //  Update the other user's followers by calling arrayUnion and adding the value in the PostText element on the HTML doc.
    docRefTarget.update({
      followers: firebase.firestore.FieldValue.arrayUnion(this.currentUser.user.profile.profileHandle)
    }).then(() => {
      this.profile.followers.push(this.currentUser.user.profile.profileHandle);
    });
  }

  removeFromFollowing() {
    const db = firebase.firestore();
    const docRefUser = db.collection('profiles').doc(this.currentUser.user.profile.profileHandle);
    const docRefTarget = db.collection('profiles').doc(this.urlProfileHandle);

    docRefUser.update({
      following: firebase.firestore.FieldValue.arrayRemove(this.profile.profileHandle)
    });

    //  Update the other user's followers by calling arrayUnion and adding the value in the PostText element on the HTML doc.
    docRefTarget.update({
      followers: firebase.firestore.FieldValue.arrayRemove(this.currentUser.user.profile.profileHandle)
    }).then(() => {
      this.profile.followers.splice(this.profile.followers.indexOf(this.currentUser.user.profile.profileHandle));
    });

  }

  checkFollowers(): boolean {
    if(this.profile.followers.length === 0) {
      return false;
    }
    for (let i = 0; i < this.profile.followers.length; i++) {
      if(this.profile.followers[i] === this.currentUser.user.profile.profileHandle) {
        console.log(this.profile.followers[i] + " and " + this.currentUser.user.profile.profileHandle);
        return true;
      }
    }
    return false;
  }

  loadProfilePic() {
    return this.profile.profilePicture;
  }

  showLatestPosts() {
    const postsDiv: HTMLElement | null = document.getElementById('posts');

    if (postsDiv) {
      // clear any existing posts
      postsDiv.innerHTML = '';

      let postsLength = 0;

      switch (this.profile.posts.length) {
        case 0:
          postsLength = 0;
          break;
        case 1:
          postsLength = 1;
          break;
        case 2:
          postsLength = 2;
          break;
        case 3:
          postsLength = 3;
          break;
        default:
          postsLength = 4;
          break;
      }

      const latestPosts = this.profile.posts.slice(this.profile.posts.length - postsLength, this.profile.posts.length); // get the latest 4 posts or fewer

      if(latestPosts.length > 0) {
        // create a new card for each post
        latestPosts.forEach((post: string) => {
          const cardDiv: HTMLDivElement = document.createElement('div');
          cardDiv.className = 'card';
          cardDiv.style.width = '25rem';
          cardDiv.style.marginBottom = '5px';

          const cardBodyDiv: HTMLDivElement = document.createElement('div');
          cardBodyDiv.className = 'card-body';

          const cardTextP: HTMLParagraphElement = document.createElement('p');
          cardTextP.className = 'card-text';
          cardTextP.textContent = post;

          const likeBtn: HTMLAnchorElement = document.createElement('a');
          likeBtn.className = 'btn zoom-btn btn-success';
          likeBtn.textContent = 'Like';
          likeBtn.href = '#';
          likeBtn.style.marginRight = '5px';

          const commentBtn: HTMLAnchorElement = document.createElement('a');
          commentBtn.className = 'btn zoom-btn btn-secondary';
          commentBtn.textContent = 'Comment';
          commentBtn.href = '#';

          cardBodyDiv.appendChild(cardTextP);
          cardBodyDiv.appendChild(likeBtn);
          cardBodyDiv.appendChild(commentBtn);

          cardDiv.appendChild(cardBodyDiv);
          postsDiv.appendChild(cardDiv);
        });
      }

      if(this.profile.posts.length === 0 && this.userProfile) {
        const noPostsP: HTMLParagraphElement = document.createElement('p');
        noPostsP.textContent = 'You haven\'t made any posts yet.';
        postsDiv.appendChild(noPostsP)
      }

      // show a message if the user hasn't made any posts yet
      if (this.profile.posts.length === 0 && !this.userProfile) {
        const noPostsP: HTMLParagraphElement = document.createElement('p');
        noPostsP.textContent = 'This user hasn\'t made any posts yet.';
        postsDiv.appendChild(noPostsP);
      }
    }
  }

  checkWorkouts(): boolean {
    if(this.profile.workouts.length === 1) {
      return false;
    }
    return true;
  }

  showFollowers() {
    this.followersModal.nativeElement.style.display = "block";
  }

  closeFollowersModal() {
    this.followersModal.nativeElement.style.display = "none";
  }

  showFollowing() {
    this.followingModal.nativeElement.style.display = "block";
  }

  closeFollowingModal() {
    this.followingModal.nativeElement.style.display = "none";
  }

  showWorkouts() {
    this.workoutsModal.nativeElement.style.display = "block";
  }

  closeWorkoutsModal() {
    this.workoutsModal.nativeElement.style.display = "none";
  }
}
