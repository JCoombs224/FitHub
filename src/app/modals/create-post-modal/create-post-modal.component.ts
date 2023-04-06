import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service'; 
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
// import { MdbModalRef } from 'mdb-angular-ui-kit/modal';


@Component({
  selector: 'app-create-post-modal',
  templateUrl: './create-post-modal.component.html',
  styleUrls: ['./create-post-modal.component.css']
})
export class CreatePostModalComponent {

  constructor(private fb: FormBuilder,
              public authService: AuthService,
              private toastr: ToastrService,
              public currentUser: CurrentUserService) {}

  postForm = this.fb.group({
    postText: ['', Validators.required],
    postImage: ['']
  });

  openModal() {

  }

  createPost() {
    
  }
}
