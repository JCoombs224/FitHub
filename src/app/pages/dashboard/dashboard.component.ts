import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from 'src/app/services/auth.service'; 
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private router: Router,
              private title: Title,
              private fb: FormBuilder,
              public authService: AuthService,
              private toastr: ToastrService,
              public currentUser: CurrentUserService) {}

  ngOnInit(): void {
    console.log(this.currentUser.user);
    this.title.setTitle("Dashboard | FitHub");
    // make sure user has created their profile, if not take them to the create profile page
    if(this.currentUser.user.profile.profileHandle == '') {
      this.router.navigate(["/create-profile"]);
    }
  }
}
