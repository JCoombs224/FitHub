import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { GeneralService } from 'src/app/services/general.service';
import { ProfileService } from 'src/app/services/profile.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent {

  private urlProfileHandle;
  profile = this.profileService.initProfile;
  userProfile = false;

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    public authService: AuthService,
    private profileService: ProfileService,
    public currentUser: CurrentUserService,
    private fb: FormBuilder,
    private location: Location,
    private db: AngularFireDatabase,
    private fs: AngularFirestore,
    // private generalService: GeneralService
    // private router: Router,
    // private toastr: ToastrService,
    ) {}

  ngOnInit(): void {
    // Subscribe to the url param for the profile username and update the page based on that
    this.route.paramMap.subscribe(params => {
      this.urlProfileHandle = params.get('name');
      this.loadProfileData();
      this.title.setTitle(`Edit Profile | FitHub`);
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

  updateProfile() {

    var updatesHandled = '';
    const profileRef = this.fs.collection('profiles').doc(this.profile.profileHandle);

    //  Update the user's profileName in firebase
    if ((<HTMLInputElement>document.getElementById('profileName')).value !== '') {
      const updateProfileName = {
        profileName: (<HTMLInputElement>document.getElementById('profileName')).value,
      }
      profileRef.update(updateProfileName);
      updatesHandled += "Your Name: " + (<HTMLInputElement>document.getElementById('profileName')).value + " ";
    }

    //  Update the user's age field in firebase
    if ((<HTMLInputElement>document.getElementById('age')).value !== '') {
      const updateAge = {
        age: (<HTMLInputElement>document.getElementById('age')).value
      }
      profileRef.update(updateAge);
      updatesHandled += "Your Age: " + (<HTMLInputElement>document.getElementById('age')).value + " ";
    }

    //  Update the user's weight field in firebase
    if ((<HTMLInputElement>document.getElementById('weight')).value !== '') {
      const updateWeight = {
        weight: (<HTMLInputElement>document.getElementById('weight')).value
      }
      profileRef.update(updateWeight);
      updatesHandled += "Your Weight: " + (<HTMLInputElement>document.getElementById('weight')).value + " ";
    }

    //  Update the user's about field in firebase
    if ((<HTMLInputElement>document.getElementById('about')).value !== '') {
      const updateAbout = {
        about: (<HTMLInputElement>document.getElementById('about')).value
      }
      profileRef.update(updateAbout);
      updatesHandled += "About you: " + (<HTMLInputElement>document.getElementById('about')).value + " ";
    }

    const form = document.querySelector('form');
    const visibility = form.elements['Visibility'];

    let visibilitySelected;

    for (let i = 0; i < visibility.length; i++) {
      if(visibility[i].checked) {
        visibilitySelected = visibility[i].value;
      }
    }

    if (visibilitySelected !== 'NoChange') {
      if (visibilitySelected === 'Private') {
        const updateIsPrivate = {
          isPrivate: true
        }
        profileRef.update(updateIsPrivate);
        updatesHandled += "Profile visibility: Private";
      }

      else {
        const updateIsPrivate = {
          isPrivate: false
        }
        profileRef.update(updateIsPrivate);
        updatesHandled += "Profile visibility: Public";
      }


    }

    if (updatesHandled !== '') {
      alert(updatesHandled);
    }

    else {
      alert("No changes were made.");
    }
  }

  cancelEdit() {
    this.location.back();
    alert("Cancelled profile editing. No changes were made.")
  }
}
