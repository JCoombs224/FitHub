import { Component, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { ProfileService } from 'src/app/services/profile.service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent {

  private urlProfileHandle;
  profile = this.profileService.initProfile;
  userProfile = false;
  isPrivate = false;
  showModal = false;
  modalRef: BsModalRef;
  workouts;
  @ViewChild('followersModal') followersModal: ElementRef;
  @ViewChild('followingModal') followingModal: ElementRef;
  @ViewChild('postsModal') postsModal: ElementRef;
  @ViewChild('workoutsModal') workoutsModal: ElementRef;
  @ViewChild('editProfileModal') editProfileModal: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    public authService: AuthService,
    private profileService: ProfileService,
    public currentUser: CurrentUserService,
    private workoutService: WorkoutsService,
    private afs: AngularFirestore,
    public location: Location,
    ) {}

  // When the page is loaded
  ngOnInit(): void {
    // Subscribe to the url param for the profile username and update the page based on that
    this.route.paramMap.subscribe(params => {
      this.urlProfileHandle = params.get('name');
      this.loadProfileData();
      this.title.setTitle(`@${this.urlProfileHandle} | FitHub`);
    });
    this.showLatestPosts();
    this.checkFollowers();

    this.workouts = this.workoutService.getExercises(this.urlProfileHandle);
  }

  // Load the profile data from the database
  private loadProfileData() {
    // Check if the profile handle is the current user
    if(this.urlProfileHandle == this.currentUser.user.profile.profileHandle) {
      // Set the profile to the current user information
      this.profile = this.currentUser.user.profile;
      this.userProfile = true;
    }
    // If the profile handle is not the current user, load the profile data from the database
    else {
      this.userProfile = false;
      this.profileService.getProfile(this.urlProfileHandle).ref.get().then(data => {
        const profData = data.data();

        // Set the profile data to the data from the database
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
        this.profile.posts = profData.posts;
        this.profile.isPrivate = profData.isPrivate;
        this.profile.profilePicture = profData.profilePicture;
      });
    }
  }

  //  Function to add the current user to the target user's followers list and vice versa
  addToFollowing() {
    //  Reference the firebase database
    const db = firebase.firestore();

    //  Reference the profiles document associated with the current user's and the target user's profilehandles
    const docRefUser = db.collection('profiles').doc(this.currentUser.user.profile.profileHandle);
    const docRefTarget = db.collection('profiles').doc(this.profile.profileHandle);

    //  Update the following by calling arrayUnion and adding the value in the PostText element on the HTML doc.
    docRefUser.update({
      following: firebase.firestore.FieldValue.arrayUnion(this.urlProfileHandle)
    });

    //  Update the other user's followers array by calling arrayUnion and adding the value in the PostText element on the HTML doc.
    docRefTarget.update({
      followers: firebase.firestore.FieldValue.arrayUnion(this.currentUser.user.profile.profileHandle)
    }).then(() => {
      this.profile.followers.push(this.currentUser.user.profile.profileHandle);
    });
  }

  //  Function to remove the current user from the target user's followers list and vice versa
  removeFromFollowing() {
    const db = firebase.firestore();
    const docRefUser = db.collection('profiles').doc(this.currentUser.user.profile.profileHandle);
    const docRefTarget = db.collection('profiles').doc(this.urlProfileHandle);

    //  Update the user's following array by calling arrayUnion and adding the value in the PostText element on the HTML doc.
    docRefUser.update({
      following: firebase.firestore.FieldValue.arrayRemove(this.profile.profileHandle)
    });

    //  Update the other user's followers array by calling arrayUnion and adding the value in the PostText element on the HTML doc.
    docRefTarget.update({
      followers: firebase.firestore.FieldValue.arrayRemove(this.currentUser.user.profile.profileHandle)
    }).then(() => {
      this.profile.followers.splice(this.profile.followers.indexOf(this.currentUser.user.profile.profileHandle));
    });

  }

  //  Function to check if the current user is following the target user
  checkFollowers(): boolean {
    if(this.profile.followers.length === 0) {
      return false;
    }
    for (let i = 0; i < this.profile.followers.length; i++) {
      if(this.profile.followers[i] === this.currentUser.user.profile.profileHandle) {
        return true;
      }
    }
    return false;
  }

  loadProfilePic() {
    return this.profile.profilePicture;
  }

  getWorkouts(profile: string) {
    return this.afs.collection('profiles').doc(profile).collection('workouts').valueChanges({idField: 'uid'});
  }

  //  Function to open the modal
  showLatestPosts() {
    const postsDiv: HTMLElement | null = document.getElementById('posts');

    if (postsDiv) {
      // clear any existing posts
      postsDiv.innerHTML = '';

      let postsLength = 0;

      // check how many posts there are
      switch (this.profile.posts.length) {
        case 0:
          postsLength = 0;
          break;
        case 1:
          postsLength = 1;
          break;
        case 2:
          postsLength = 2;
          break;
        case 3:
          postsLength = 3;
          break;
        // if there are more than 4 posts, only show the latest 4
        default:
          postsLength = 4;
          break;
      }

      console.log(postsLength);

      // get the latest posts (at most 4)
      const latestPosts = this.profile.posts.slice(this.profile.posts.length - postsLength, postsLength + 1);

      // check if there are any posts
      if(postsLength > 0) {
        // create a new card for each post
        latestPosts.forEach((post: string) => {
          // create the card
          const cardDiv: HTMLDivElement = document.createElement('div');
          cardDiv.className = 'card';
          cardDiv.style.width = '25rem';
          cardDiv.style.marginBottom = '5px';

          // create the card body
          const cardBodyDiv: HTMLDivElement = document.createElement('div');
          cardBodyDiv.className = 'card-body';

          // create the card text
          const cardTextP: HTMLParagraphElement = document.createElement('p');
          cardTextP.className = 'card-text';
          cardTextP.textContent = post;

          // create the like and comment buttons
          const likeBtn: HTMLAnchorElement = document.createElement('a');
          likeBtn.className = 'btn zoom-btn btn-success';
          likeBtn.textContent = 'Like';
          likeBtn.href = '#';
          likeBtn.style.marginRight = '5px';

          const commentBtn: HTMLAnchorElement = document.createElement('a');
          commentBtn.className = 'btn zoom-btn btn-secondary';
          commentBtn.textContent = 'Comment';
          commentBtn.href = '#';

          // append the card text and buttons to the card body
          cardBodyDiv.appendChild(cardTextP);
          cardBodyDiv.appendChild(likeBtn);
          cardBodyDiv.appendChild(commentBtn);

          // append the card body to the card
          cardDiv.appendChild(cardBodyDiv);
          postsDiv.appendChild(cardDiv);
        });
      }

      // show a message if the user hasn't made any posts yet
      if(postsLength === 0 && this.userProfile) {
        const noPostsP: HTMLParagraphElement = document.createElement('p');
        noPostsP.textContent = 'You haven\'t made any posts yet.';
        postsDiv.appendChild(noPostsP)
      }

      // show a message if the user hasn't made any posts yet
      if (postsLength === 0 && !this.userProfile) {
        const noPostsP: HTMLParagraphElement = document.createElement('p');
        noPostsP.textContent = 'This user hasn\'t made any posts yet.';
        postsDiv.appendChild(noPostsP);
      }
    }
  }

  showRecentWorkouts() {
    const workoutsDiv: HTMLElement | null = document.getElementById('workouts');
  }


  //  This function shecks if the user has any workouts.
  checkWorkouts(): boolean {
    if(this.profile.workouts.length === 1) {
      return false;
    }
    return true;
  }

  getPost() {
    //  Check if the textarea is empty, so the user doesn't add an empty post
    if ((<HTMLInputElement>document.getElementById("PostText")).value != '') {
      //  Reference the firebase database
      const db = firebase.firestore();

      //  Reference the profiles document associated with the current user's profilehandle
      const docRef = db.collection('profiles').doc(this.profile.profileHandle);

      //  Update the posts by calling arrayUnion and adding the value in the PostText element on the HTML doc.
      docRef.update({
        posts: firebase.firestore.FieldValue.arrayUnion((<HTMLInputElement>document.getElementById("PostText")).value)
      });
    }
    else {
      alert("You didn't enter any text. Don't worry, no post was created!");
    }

    //  Clear the text inside the PostText element on the HTML doc
    (<HTMLInputElement>document.getElementById("PostText")).value = '';
  }

  cancelPost() {
    //  Check that the PostText element on the HTML doc isn't empty
    if ((<HTMLInputElement>document.getElementById("PostText")).value != '') {
      //  Ask the user to confirm that they want to discard their post
      if (confirm("Would you like to discard this post?")) {
        //  Empty the PostText element on the HTML doc.
        this.closePostsModal();
      }
    }
    else {
      //  Ask if the user would like to go back to the profile page
      if (confirm("Go back to your profile?")) {
        this.closePostsModal();
      }
    }
  }

  updateProfile() {
    this.updateProfileName();
    this.updateAge();
    this.updateWeight();
    this.updateAbout();
    this.updateVisibility();
  }

  updateProfileName() {
    const profileRef = this.afs.collection('profiles').doc(this.profile.profileHandle);
    let input = (<HTMLInputElement>document.getElementById('editProfileName'));

    //  Update the user's profileName in firebase
    if ((<HTMLInputElement>document.getElementById('editProfileName')).value !== '') {
      const updateProfileName = {
        profileName: (<HTMLInputElement>document.getElementById('editProfileName')).value,
      }
      profileRef.update(updateProfileName);
      input.placeholder = (<HTMLInputElement>document.getElementById('editProfileName')).value;
    }
    (<HTMLInputElement>document.getElementById('editProfileName')).value = '';
  }

  updateAge () {
    const profileRef = this.afs.collection('profiles').doc(this.profile.profileHandle);
    let input = (<HTMLInputElement>document.getElementById('editAge'));

    //  Update the user's age field in firebase
    if ((<HTMLInputElement>document.getElementById('editAge')).value !== '') {
      const updateAge = {
        age: (<HTMLInputElement>document.getElementById('editAge')).value
      }
      profileRef.update(updateAge);
      input.placeholder = (<HTMLInputElement>document.getElementById('editAge')).value;
    }
    (<HTMLInputElement>document.getElementById('editAge')).value = '';
  }

  updateWeight () {
    const profileRef = this.afs.collection('profiles').doc(this.profile.profileHandle);
    let input = (<HTMLInputElement>document.getElementById('editWeight'));

    //  Update the user's weight field in firebase
    if ((<HTMLInputElement>document.getElementById('editWeight')).value !== '') {
      const updateWeight = {
        weight: (<HTMLInputElement>document.getElementById('editWeight')).value
      }
      profileRef.update(updateWeight);
      input.placeholder = (<HTMLInputElement>document.getElementById('editWeight')).value;
    }
    (<HTMLInputElement>document.getElementById('editWeight')).value = '';
  }

  updateAbout () {
    const profileRef = this.afs.collection('profiles').doc(this.profile.profileHandle);
    let input = (<HTMLInputElement>document.getElementById('editAbout'));

    //  Update the user's about field in firebase
    if ((<HTMLInputElement>document.getElementById('editAbout')).value !== '') {
      const updateAbout = {
        about: (<HTMLInputElement>document.getElementById('editAbout')).value
      }
      profileRef.update(updateAbout);
      input.placeholder = (<HTMLInputElement>document.getElementById('editAbout')).value;
    }
    (<HTMLInputElement>document.getElementById('editAbout')).value = '';
  }

  updateVisibility () {
    const profileRef = this.afs.collection('profiles').doc(this.profile.profileHandle);

    //  Create a reference to the form element Visibility
    const form = document.querySelector('form');
    const visibility = form.elements['editVisibility'];

    //  Visibility to be changed through this variable
    let visibilitySelected;

    //  Determine which radio button is checked
    for (let i = 0; i < visibility.length; i++) {
      if(visibility[i].checked) {
        visibilitySelected = visibility[i].value;
      }
    }

    //  Only update if the other two radio buttons are selected
    if (visibilitySelected !== 'NoChange') {
      //  Update isPrivate to true and set the profile to private
      if (visibilitySelected === 'Private') {
        const updateIsPrivate = {
          isPrivate: true
        }
        profileRef.update(updateIsPrivate);
      }

      //  Update isPrivate to false and set the profile to public
      else {
        const updateIsPrivate = {
          isPrivate: false
        }
        profileRef.update(updateIsPrivate);
      }
    }

    visibility[0].checked = true;
  }

  /**
   * Functions that open the modal popups
   */

  //  This function will show the users that are following the user.
  showFollowersModal() {
    this.profile.followers.sort((a, b) => a.localeCompare(b));
    this.followersModal.nativeElement.style.display = "block";
  }

  //  This function will close the modal that shows the users that are following the user.
  closeFollowersModal() {
    this.followersModal.nativeElement.style.display = "none";
  }

  //  This function will show the users that the user is following.
  showFollowingModal() {
    this.profile.following.sort((a, b) => a.localeCompare(b));
    this.followingModal.nativeElement.style.display = "block";
  }

  //  This function will close the modal that shows the users that the user is following.
  closeFollowingModal() {
    this.followingModal.nativeElement.style.display = "none";
  }

  //  This function will show the users that are following the user.
  showPostsModal() {
    this.postsModal.nativeElement.style.display = "block";
  }

  //  This function will close the modal that shows the users that are following the user.
  closePostsModal() {
    this.postsModal.nativeElement.style.display = "none";
  }

  //  This function will show the users that are following the user.
  showEditProfileModal() {
    this.editProfileModal.nativeElement.style.display = "block";
  }

  //  This function will close the modal that shows the users that are following the user.
  closeEditProfileModal() {
    this.editProfileModal.nativeElement.style.display = "none";
  }
}
