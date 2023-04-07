import { Component, OnInit } from "@angular/core";

@Component({
  selector: "my-app",
  templateUrl: "./create-post-modal.component.html",
})
export class CreatePostModalComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  displayStyle = "none";

  postToProfile() {
    this.displayStyle = "block";
  }
  closePopup() {
    this.displayStyle = "none";
  }
}
