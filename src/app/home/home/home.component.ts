import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentUserService } from 'src/app/services/current-user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private currentUser: CurrentUserService,
              private router: Router) {}

  ngOnInit(): void {
      if(this.currentUser.isLoggedIn()) {
        this.router.navigate(["/dashboard"]);
      }
  }

}
