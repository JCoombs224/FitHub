import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from 'src/app/services/auth.service'; 
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { GeneralService } from 'src/app/services/general.service';
import { ProfileService } from 'src/app/services/profile.service';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CreatePostModalComponent } from 'src/app/modals/create-post-modal/create-post-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  
  modalRef; // modal reference variable

  private urlProfileHandle;
  profile = this.profileService.initProfile;
  userProfile = false;
  
  constructor(private router: Router,
              private route: ActivatedRoute,
              private title: Title,
              private fb: FormBuilder,
              public authService: AuthService,
              private toastr: ToastrService,
              private profileService: ProfileService,
              private modalService: BsModalService,
              public currentUser: CurrentUserService,
              private generalService: GeneralService) {}

  
  ngOnInit(): void {
    // Subscribe to the url param for the profile username and update the page based on that
    this.route.paramMap.subscribe(params => {
      this.urlProfileHandle = params.get('name');
      this.loadProfileData();
      this.title.setTitle(`@${this.urlProfileHandle} | FitHub`);
    });
  }

  /**
   * Opens a modal component to create a post
   */
  createPost() {
    const initialState = {
      initialState: {
        callback: (result) => {
          if(result) {
            this.toastr.success("Submitted");
          }
        },
      },
      title: 'modal',
      backdrop: 'static',
      class: 'modal-lg'
    };
    this.modalRef = this.modalService.show(CreatePostModalComponent, initialState as ModalOptions);
  }

  private loadProfileData() {
    // Check if the profile handle is the current user
    if(this.urlProfileHandle == this.currentUser.user.profile.profileHandle) {
      // Set the profile to the current user information
      this.profile = this.currentUser.user.profile;
      this.userProfile = true;
    }
    else {
      this.userProfile = false;
      this.profileService.getProfile(this.urlProfileHandle).ref.get().then(data => {
        const profData = data.data();

        this.profile.uid = profData.uid;
        this.profile.profileHandle = profData.profileHandle;
        this.profile.profileName = profData.profileName;
        this.profile.age = profData.age;
        this.profile.weight = profData.weight;
        this.profile.heightFeet = profData.heightFeet;
        this.profile.heightInches = profData.heightInches;
        this.profile.sex = profData.sex;
        this.profile.about = profData.about;
        this.profile.followers = profData.followers;
        this.profile.following = profData.following;
      });
    }
  }
  
}
