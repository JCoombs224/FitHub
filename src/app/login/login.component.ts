import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../services/current-user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{

  faGoogle = faGoogle; // font awesome icon

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  })

  constructor(private router: Router,
              private title: Title,
              private fb: FormBuilder,
              public authService: AuthService,
              private toastr: ToastrService,
              private currentUserService: CurrentUserService) {}

  ngOnInit(): void {
      this.title.setTitle("Login | FitHub");
  }

  login() {
    // this will show the fields not filled in as an error
    this.loginForm.markAllAsTouched();

    // Check if all fields are filled
    if(this.loginForm.valid) {
      this.authService.SignIn(this.username.value, this.password.value);
    }
  }

  googleSignIn() {
    this.authService.GoogleAuthLogin().then((success)=>{
      if(success) {
        // this.router.navigate(["/dashboard"]);
      }
    })
  }

  get username() {
    return this.loginForm.get('username');
  }
  get password() {
    return this.loginForm.get('password');
  }

}
