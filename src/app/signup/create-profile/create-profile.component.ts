import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { ToastrService } from 'ngx-toastr';
import {animate, style, transition, trigger} from "@angular/animations";
import { CurrentUserService } from '../../services/current-user.service';

@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.css'],
  animations: [
    trigger(
      'slideOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, opacity: 0 }),
            animate('0.4s ease-out',
              style({ }))
          ]
        ),
        transition(
          ':leave',
          [
            style({  }),
            animate('0.3s ease-in',
              style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class CreateProfileComponent implements OnInit {

  transitionDone = false;
  usernameAvailable = true;

  profileForm = this.fb.group({
    profileHandle: ['', Validators.required],
    profileName: ['', Validators.required],
    age: [''],
    heightFeet: [''],
    heightInches: [''],
    weight: [''],
    sex: [''],
  });

  constructor(private router: Router,
              private title: Title,
              private fb: FormBuilder,
              public authService: AuthService,
              private toastr: ToastrService,
              private currentUser: CurrentUserService) {}

  ngOnInit(): void {
      this.title.setTitle("Create Profile | FitHub");

      // page transition
      setTimeout(()=> {
        this.transitionDone = true;
      }, 1750);
  }

  checkDisplayName() {
    this.currentUser.isUsernameAvailable(this.profileHandle.value).then((success) => {
      if(success) {
        this.usernameAvailable = true;
      } else {
        this.usernameAvailable = false;
      }
    }).catch((error) => {
      this.usernameAvailable = false;
    });
  }

  submitProfile() {
    this.currentUser.newProfile(this.profileForm.getRawValue()).then((success) => {
      this.router.navigate(["/dashboard"]);
    }).catch((error)=>{
      this.toastr.error(error.message);
    });
  }
  
  get profileHandle() {
    return this.profileForm.get('profileHandle');
  }
  get profileName() {
    return this.profileForm.get('profileName');
  }
  get age() {
    return this.profileForm.get('age');
  }
  get height() {
    return this.profileForm.get('height');
  }
  get weight() {
    return this.profileForm.get('weight');
  }
  get sex() {
    return this.profileForm.get('sex');
  }

}
