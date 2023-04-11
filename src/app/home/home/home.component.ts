import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private currentUser: CurrentUserService,
              private router: Router,
              private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle("FitHub | Transform Your Body, Transform Your Life");
    if(this.currentUser.isLoggedIn()) {
      this.router.navigate(["/dashboard"]);
    }
  }

}
