import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { ProfileService } from 'src/app/services/profile.service';
import { Location } from '@angular/common';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const FieldValue = firebase.firestore.FieldValue;

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent {

  private urlProfileHandle;
  profile = this.profileService.initProfile;
  userProfile = false;
  isPrivate = false;
  postText = '';

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private title: Title,
    public authService: AuthService,
    private profileService: ProfileService,
    public currentUser: CurrentUserService) {}

  ngOnInit() {
    this.title.setTitle("Create Post+ | FitHub");
    // Subscribe to the url param for the profile username and update the page based on that
    this.route.paramMap.subscribe(params => {
      this.urlProfileHandle = params.get('name');
      this.loadProfileData();
      this.title.setTitle(`Create Post+ | FitHub`);
    });
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

        //  Set the references from this page to the profile data they're associated with
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

  getPost() {
    //  Check if the textarea is empty, so the user doesn't add an empty post
    if ((<HTMLInputElement>document.getElementById("PostText")).value != '') {
      //  Reference the firebase database
      const db = firebase.firestore();

      //  Reference the profiles document associated with the current user's profilehandle
      const docRef = db.collection('profiles').doc(this.profile.profileHandle);

      //  Update the posts by calling arrayUnion and adding the value in the PostText element on the HTML doc.
      docRef.update({
        posts: firebase.firestore.FieldValue.arrayUnion((<HTMLInputElement>document.getElementById("PostText")).value)
      });
    }
    else {
      alert("You didn't enter any text. Don't worry, no post was created!");
    }

    //  Clear the text inside the PostText element on the HTML doc
    (<HTMLInputElement>document.getElementById("PostText")).value = '';
  }

  cancelPost() {
    //  Check that the PostText element on the HTML doc isn't empty
    if ((<HTMLInputElement>document.getElementById("PostText")).value != '') {
      //  Ask the user to confirm that they want to discard their post
      if (confirm("Would you like to discard this post?")) {
        //  Empty the PostText element on the HTML doc.
        (<HTMLInputElement>document.getElementById("PostText")).value = '';

        //  Ask if the user would like to go back to the profile page
        if (confirm("Go back to your profile?")) {
          this.location.back();
        }
      }
    }
    else {
      //  Ask if the user would like to go back to the profile page
      if (confirm("Go back to your profile?")) {
        this.location.back();
      }
    }
  }
}
