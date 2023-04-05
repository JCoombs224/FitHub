import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from 'src/app/services/auth.service'; 
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent {
  
  
  constructor(private router: Router,
              private title: Title,
              private fb: FormBuilder,
              public authService: AuthService,
              private toastr: ToastrService,
              public currentUser: CurrentUserService) {}

  ngOnInit(): void {
    this.title.setTitle("My Profile | FitHub");
  } 
  
}
