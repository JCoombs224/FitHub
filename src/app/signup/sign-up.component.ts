import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  signupForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  })

  constructor(private router: Router,
              private title: Title,
              private fb: FormBuilder) {}

  ngOnInit(): void {
      this.title.setTitle("Login | FitHub");
  }

  submit() {
    // this will show the fields not filled in as an error
    this.signupForm.markAllAsTouched();

    // Check if all fields are filled
    if(this.signupForm.valid) {
      
    }
    console.log("login pressed");
  }

  get username() {
    return this.signupForm.get('username');
  }
  get password() {
    return this.signupForm.get('password');
  }
}
