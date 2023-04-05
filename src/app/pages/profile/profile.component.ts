import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from 'src/app/services/auth.service'; 
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { GeneralService } from 'src/app/services/general.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  
  private urlDisplayName;
  profile = this.profileService.initProfile;
  userProfile = false;
  
  constructor(private router: Router,
              private route: ActivatedRoute,
              private title: Title,
              private fb: FormBuilder,
              public authService: AuthService,
              private toastr: ToastrService,
              private profileService: ProfileService,
              public currentUser: CurrentUserService,
              private generalService: GeneralService) {}

  
  ngOnInit(): void {
    // Get the profile handle from the url
    this.urlDisplayName = this.route.snapshot.paramMap.get('name');

    // Check if the profile handle is the current user
    if(this.urlDisplayName == this.currentUser.user.profile.profileHandle) {
      // Set the profile to the current user information
      this.profile = this.currentUser.user.profile;
      this.userProfile = true;
    }
    else {
      this.profileService.getProfile(this.urlDisplayName).ref.get().then(data => {
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
      });
    }
    
    this.title.setTitle(`@${this.urlDisplayName} | FitHub`);
  } 
  
}