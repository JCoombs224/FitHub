import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { ToastrService } from 'ngx-toastr';
import {animate, style, transition, trigger} from "@angular/animations";
import { CurrentUserService } from '../services/current-user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
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
export class SignUpComponent implements OnInit {

  faGoogle = faGoogle; // font awesome icon
  transitionDone = false;
  usernameAvailable = true;
  page = 1;

  signupForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    confirm_password: ['', Validators.required],
    profileHandle: [''],
  });

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
      this.title.setTitle("Sign Up | FitHub");
      console.log(this.currentUser.user);
  }

  private goToProfilePage() {
    // this.page = 0;

    // // transition 1
    // setTimeout(()=> {
    //   this.page = 2;
    // }, 750);

    // // transition 2
    // setTimeout(()=> {
    //   this.transitionDone = true;
    // }, 1750);
    this.router.navigate(["/create-profile"]);
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

  submitAccount() {
    // this will show the fields not filled in as an error
    this.signupForm.markAllAsTouched();

    // Check if all fields are filled
    if(this.signupForm.valid) {
      // Check if the passwords match
      if(this.password.value == this.confirm_password.value) {
        this.authService.SignUp(this.username.value, this.password.value).then((success) => {
          if(success) {
            this.goToProfilePage();
            this.toastr.success("Account created.")
          }
        })
      }
      else {
        this.toastr.error("Passwords do not match")
      }
    }
    else {
      this.toastr.error("Missing required fields");
    }
  }

  googleSignUp() {
    this.authService.GoogleAuthSignUp().then((success)=>{
      if(success) {
        this.goToProfilePage();
        this.toastr.success("Account created.")
      }
    })
  }

  submitProfile() {
    this.currentUser.newProfile(this.profileForm.getRawValue()).then((success) => {
      this.router.navigate(["/dashboard"]);
    }).catch((error)=>{
      this.toastr.error(error.message);
    });
  }

  get username() {
    return this.signupForm.get('username');
  }
  get password() {
    return this.signupForm.get('password');
  }
  get confirm_password() {
    return this.signupForm.get('confirm_password');
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
