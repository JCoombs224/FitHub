import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { ProfileService } from 'src/app/services/profile.service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { FollowersService } from 'src/app/services/followers.service';
import { FollowersModalComponent } from 'src/app/modals/followers-modal/followers-modal.component';

// import { FormBuilder, Validators } from '@angular/forms';
// import { AngularFireDatabase } from '@angular/fire/compat/database';
// import { GeneralService } from 'src/app/services/general.service';
// import { ToastrService } from 'ngx-toastr';
// import { faGoogle } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {

  private urlProfileHandle;
  profile = this.profileService.initProfile;
  userProfile = false;
  isPrivate = false;
  followers: any[] = [];
  followersModalRef: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private title: Title,
    public authService: AuthService,
    private profileService: ProfileService,
    public currentUser: CurrentUserService,
    private followersService: FollowersService,
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
}
