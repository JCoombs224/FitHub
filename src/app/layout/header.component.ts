import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-header-section',
  templateUrl: './header.html'
})
export class HeaderComponent implements OnInit {

  constructor() {}

  ngOnInit() {
    
  }
  reload(){
    window.location.reload();
  }
  logOut(){
    
  }
}
