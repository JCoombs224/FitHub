import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  faGoogle = faGoogle; // font awesome icon

  signupForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    confirm_password: ['', Validators.required],
  })

  constructor(private router: Router,
              private title: Title,
              private fb: FormBuilder,
              public authService: AuthService,
              private toastr: ToastrService) {}

  ngOnInit(): void {
      this.title.setTitle("Sign Up | FitHub");
  }

  submit() {
    // this will show the fields not filled in as an error
    this.signupForm.markAllAsTouched();

    // Check if all fields are filled
    if(this.signupForm.valid) {
      // Check if the passwords match
      if(this.password.value == this.confirm_password.value) {
        
      }
      else {
        this.toastr.error("Passwords do not match")
      }
    }
    else {
      this.toastr.error("Missing required fields");
    }
    
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
}
