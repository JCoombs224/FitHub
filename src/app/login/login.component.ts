import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  })

  constructor(private router: Router,
              private title: Title,
              private fb: FormBuilder) {}

  ngOnInit(): void {
      this.title.setTitle("Login | FitHub");
  }

  login() {
    // this will show the fields not filled in as an error
    this.loginForm.markAllAsTouched();

    // Check if all fields are filled
    if(this.loginForm.valid) {
      // TODO: Create a login service
    }
    console.log("login pressed");
  }

  get username() {
    return this.loginForm.get('username');
  }
  get password() {
    return this.loginForm.get('password');
  }

}
