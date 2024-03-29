import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'FitHub';

  constructor(private router: Router) {}

  showHeader() {
    const route = this.router.url;

    if(route == '/' || route == '/login' || route == '/sign-up' || route == '/create-profile')
      return false;

    return true;
  }
}
