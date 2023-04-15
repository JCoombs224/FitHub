import { Component, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { ProfileService } from 'src/app/services/profile.service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Location } from '@angular/common';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { PostsService } from 'src/app/services/posts.service';
import { map } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';

interface Post {
  uid: string;
  postText: string;
  postTimeStamp: Timestamp;
  postLikeOwners: any[];
  postLikeCount: number;
  postComments: {
    commentLikeCount: number;
    commentLikeOwners: any[];
    commentOwner: string;
    commentText: string;
    commentTimeStamp: Timestamp;
  }[];
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent {

  faEdit = faEdit;
  public urlProfileHandle;
  profile = this.profileService.initProfile;
  userProfile = false;
  isPrivate = false;
  showModal = false;
  loadingImage = true;
  profilePictureUrl = ""; // default profile picture
  workouts;
  showUploadButton = false;
  showCropper = false;
  posts: Post[] = [];

  @ViewChild('followersModal') followersModal: ElementRef;
  @ViewChild('followingModal') followingModal: ElementRef;
  @ViewChild('postsModal') postsModal: ElementRef;
  @ViewChild('workoutsModal') workoutsModal: ElementRef;
  @ViewChild('editProfileModal') editProfileModal: ElementRef;
  @ViewChild('allPostsModal') allPostsModal: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    public authService: AuthService,
    private profileService: ProfileService,
    public currentUser: CurrentUserService,
    private workoutService: WorkoutsService,
    private afs: AngularFirestore,
    public location: Location,
    private storage: AngularFireStorage,
    private postsService: PostsService,
    private toastr: ToastrService,
  ) { }

  // When the page is loaded
  ngOnInit(): void {
    // Subscribe to the url param for the profile username and update the page based on that
    this.route.paramMap.subscribe(params => {
      this.urlProfileHandle = params.get('name');
      this.loadProfileData();
      this.title.setTitle(`@${this.urlProfileHandle} | FitHub`);
      this.loadProfilePostsData(this.profile.profileHandle).then(() => {
        this.displayPosts();
      });
      this.checkFollowers();

    });

    this.workouts = this.workoutService.getExercises(this.urlProfileHandle);
  }

  // Load the profile data from the database
  private loadProfileData() {
    // Check if the profile handle is the current user
    if (this.urlProfileHandle == this.currentUser.user.profile.profileHandle) {
      // Set the profile to the current user information
      this.profile = this.currentUser.user.profile;
      this.userProfile = true;
      // Get profile picture from database
      const filePath = `profile-pictures/${this.profile.profileHandle}`;
      const fileRef = this.storage.ref(filePath);
      fileRef.getDownloadURL().subscribe(url => {
        this.profilePictureUrl = url;
        this.loadingImage = false;
      },()=>{
        this.profilePictureUrl = "https://nwfblogs.wpenginepowered.com/wp-content/blogs.dir/11/files/2012/11/Turkey_strut-494x620.jpg"; // default profile picture
        this.loadingImage = false;
      });
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
        this.profile.isPrivate = profData.isPrivate;
        this.profile.profilePicture = profData.profilePicture;

        // Get profile picture from database
        const filePath = `profile-pictures/${this.profile.profileHandle}`;
        const fileRef = this.storage.ref(filePath);
        fileRef.getDownloadURL().subscribe(url => {
          this.profilePictureUrl = url;
          this.loadingImage = false;
        }
        ,()=>{
          this.profilePictureUrl = "https://wilcity.com/wp-content/uploads/2020/06/115-1150152_default-profile-picture-avatar-png-green.jpg"; // default profile picture
          this.loadingImage = false;
        });
      });
    }
  }

  //  Get this profile's posts
  loadProfilePostsData(profile = this.profile.profileHandle) {
    return new Promise<void>((resolve, reject) => {
      this.postsService.getPosts(this.profile.profileHandle).pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const uid = a.payload.doc.id;
          const postText = data.postText;
          const postTimeStamp = data.postTimeStamp;
          const postLikeOwners = data.postLikeOwners;
          const postLikeCount = data.postLikeCount;
          const postComments = data.postComments.map(comment => ({
            commentLikeCount: comment.commentLikeCount,
            commentLikeOwners: comment.commentLikeOwners,
            commentOwner: comment.commentOwner,
            commentText: comment.commentText,
            commentTimeStamp: comment.commentTimeStamp,
          }));
          return { uid, postText, postTimeStamp, postLikeOwners, postLikeCount, postComments };
        }))
      ).subscribe(data => {
        this.posts = data;
        resolve();
      });
    });
  }

  onUploadButtonClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      this.fileChangeEvent(event);
      this.showCropper = true;
    };
    input.click();
  }

  imageChangedEvent: any = '';
  croppedImage: any = '';

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  uploadImage() {
    this.showCropper = false;

    // This nasty code is only for the image cropper and is to convert the base64 image to a blob so it can be uploaded to firebase
    // Normally you would just upload the image from the input directly to firebase
    const split = this.croppedImage.split(',');
    const type = split[0].replace('data:', '').replace(';base64', '');
    const byteString = atob(split[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
    }
    const fileBlob = new Blob([arrayBuffer], { type }); // upload this to firebase.
    const filePath = `profile-pictures/${this.profile.profileHandle}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, fileBlob);
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          this.profilePictureUrl = url;
          this.showCropper = false;
        });
      })
    ).subscribe();
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
    if (this.profile.followers.length === 0) {
      return false;
    }
    for (let i = 0; i < this.profile.followers.length; i++) {
      if (this.profile.followers[i] === this.currentUser.user.profile.profileHandle) {
        return true;
      }
    }
    return false;
  }

  loadProfilePic() {
    return this.profile.profilePicture;
  }

  getWorkouts(profile: string) {
    return this.afs.collection('profiles').doc(profile).collection('workouts').valueChanges({ idField: 'uid' });
  }

  //  Function to create a new post
  newPost(post: string) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').add({
      postText: post,
      postLikeCount: 0,
      postTimeStamp: new Timestamp(new Date().getTime(), 0),
      postComments: {
        commentLikeCount: 0,
        commentLikeOwners: [],
        commentOwner: '',
        commentText: '',
        commentTimeStamp: new Timestamp(new Date().getTime(), 0),
      }
    });
  }

  //  Convert the timestamp numbers to a readable format
  convertTime(time: number) {

  }


  //  Function to display this porfile's posts in a modal
  displayPosts() {
    //  Get the element by id: posts
    const modal = document.getElementById('posts');

    //  Loop through the posts and create a card for each of them with a like
    //  and comment button and also display the comments for each post within the post card
    for (let i = 0; i < this.posts.length; i++) {
      const postCard = document.createElement('div');
      postCard.className = 'card w-100 mb-2';
      postCard.style.width = '18rem';

      //  Create a card header with no background to show the timestamp of the post
      const postCardHeader = document.createElement('div');
      postCardHeader.className = 'card-header';
      postCardHeader.style.backgroundColor = 'white';
      postCardHeader.style.textAlign = 'left';
      postCardHeader.style.fontSize = '15px';
      postCardHeader.innerHTML = this.posts[i].postTimeStamp.toDate().toDateString();

      //  Create a card body to hold the post text and the like and comment buttons
      const postCardBody = document.createElement('div');
      postCardBody.className = 'card-body';

      const postCardText = document.createElement('p');
      postCardText.className = 'card-text';
      postCardText.style.fontSize = '20px';
      postCardText.style.textAlign = 'left';
      postCardText.innerHTML = this.posts[i].postText;

      const postCardLike = document.createElement('button');
      postCardLike.className = 'btn btn-outline-secondary';

      //  Check if the current user has liked the post
      if (this.posts[i].postLikeOwners.includes(this.currentUser.user.profile.profileHandle)) {
        postCardLike.innerHTML = this.posts[i].postLikeCount + ' Unlike';
        postCardLike.addEventListener('click', () => {
          this.unlikePost(this.posts[i]);
        });
      } else {
        postCardLike.innerHTML = this.posts[i].postLikeCount + ' Like';
        postCardLike.addEventListener('click', () => {
          this.likePost(this.posts[i]);
        });
      }

      //  Create a comment button under the textarea for the user to submit a comment
      const commentButton = document.createElement('button');
      commentButton.className = 'btn btn-outline-success';
      commentButton.innerHTML = 'Comment';
      commentButton.addEventListener('click', () => {
        this.commentPost(this.posts[i]);
      });

      //  Create a text area for the user to enter a comment underneath the postText
      const commentTextArea = document.createElement('textarea');
      commentTextArea.className = 'form-control';
      commentTextArea.id = 'commentTextArea';
      commentTextArea.rows = 3;
      commentTextArea.placeholder = 'Reply to @' + this.profile.profileHandle + '\'s post...';

      modal.appendChild(postCard);
      postCard.appendChild(postCardHeader);
      postCard.appendChild(postCardBody);
      postCardBody.appendChild(postCardText);
      postCardBody.appendChild(commentTextArea);
      postCardBody.appendChild(postCardLike);
      postCardBody.appendChild(commentButton);

      //  Loop through this posts comments and create a paragraph for each of them with a like button for each comment
      for (let j = 0; j < this.posts[i].postComments.length; j++) {
        const commentCard = document.createElement('div');
        commentCard.className = 'card w-75';
        commentCard.style.width = '18rem';
        commentCard.style.marginLeft = '50px';

        const commentCardHeader = document.createElement('div');
        commentCardHeader.className = 'card-header';
        commentCardHeader.style.backgroundColor = 'white';
        commentCardHeader.style.textAlign = 'left';
        commentCardHeader.style.fontSize = '15px';
        commentCardHeader.innerHTML = this.posts[i].postComments[j].commentTimeStamp.toDate().toDateString();

        const commentCardBody = document.createElement('div');
        commentCardBody.className = 'card-body';

        const commentCardText = document.createElement('p');
        commentCardText.className = 'card-text';
        commentCardText.style.fontSize = '20px';
        commentCardText.innerHTML = this.posts[i].postComments[j].commentText;

        const commentCardLike = document.createElement('button');
        commentCardLike.className = 'btn btn-outline-secondary';

        //  Check if the current user has liked the comment
        if (this.posts[i].postComments[j].commentLikeOwners.includes(this.currentUser.user.profile.profileHandle)) {
          commentCardLike.innerHTML = this.posts[i].postComments[j].commentLikeCount + ' Unlike';
          commentCardLike.addEventListener('click', () => {
            this.unlikeComment(this.posts[i].postComments[j]);
          });
        } else {
          commentCardLike.innerHTML = this.posts[i].postComments[j].commentLikeCount + ' Like';
          commentCardLike.addEventListener('click', () => {
            this.likeComment(this.posts[i].postComments[j]);
          });
        }

        commentCardBody.append(commentCardHeader);
        commentCardBody.appendChild(commentCardText);
        commentCardBody.appendChild(commentCardLike);
        commentCard.appendChild(commentCardBody);
        postCardBody.appendChild(commentCard);
      }
    }
  }

  displayComments(post: any) {
    const modal = document.getElementById('posts');
    const commentCard = document.createElement('div');
    commentCard.className = 'card';
    commentCard.style.width = '18rem';
    commentCard.style.margin = '10px';

    const commentCardBody = document.createElement('div');
    commentCardBody.className = 'card-body';

    const commentCardText = document.createElement('p');
    commentCardText.className = 'card-text';
    commentCardText.innerHTML = post.postComments.commentText;

    const commentCardLike = document.createElement('button');
    commentCardLike.className = 'btn btn-primary';
    commentCardLike.innerHTML = 'Like';
    commentCardLike.addEventListener('click', () => {
      this.likeComment(post);
    });

    commentCardBody.appendChild(commentCardText);
    commentCardBody.appendChild(commentCardLike);
    commentCard.appendChild(commentCardBody);
    modal.appendChild(commentCard);

    return commentCard;
  }

  commentPost(post) {
    const modal = document.getElementById('posts');
    const commentCard = document.createElement('div');
    commentCard.className = 'card';
    commentCard.style.width = '18rem';
    commentCard.style.margin = '10px';

    const commentCardBody = document.createElement('div');
    commentCardBody.className = 'card-body';

    const commentCardText = document.createElement('p');
    commentCardText.className = 'card-text';
    commentCardText.innerHTML = post.postComments.commentText;

    const commentCardLike = document.createElement('button');
    commentCardLike.className = 'btn btn-primary';
    commentCardLike.innerHTML = 'Like';
    commentCardLike.addEventListener('click', () => {
      this.likeComment(post);
    });

    commentCardBody.appendChild(commentCardText);
    commentCardBody.appendChild(commentCardLike);
    commentCard.appendChild(commentCardBody);
    modal.appendChild(commentCard);
  }

  //  Function to like a post
  likePost(post) {
    //  Check if the current user has already liked the post
    let alreadyLiked = false;
    for (let i = 0; i < post.postLikeOwners.length; i++) {
      if (post.postLikeOwners[i] === this.currentUser.user.profile.profileHandle) {
        alreadyLiked = true;
      }
    }

    // If the current user hasn't already liked the post, like it
    if (!alreadyLiked) {
      //  Returns a promise that resolves when the post is liked
      return this.afs.collection('profiles').doc(this.profile.profileHandle).collection('posts').doc(post.uid).update({
        //  Increment the post's like count and add the current user's profile handle to the post's like owners
        postLikeCount: firebase.firestore.FieldValue.increment(1),
        postLikeOwners: firebase.firestore.FieldValue.arrayUnion(this.currentUser.user.profile.profileHandle)
      });
    }
  }

  //  Function to unlike a post
  unlikePost(post) {
    //  Check if the current user has already liked the post
    let alreadyLiked = false;
    for (let i = 0; i < post.postLikeOwners.length; i++) {
      if (post.postLikeOwners[i] === this.currentUser.user.profile.profileHandle) {
        alreadyLiked = true;
      }
    }

    //  If the current user has already liked the post, unlike it
    if (alreadyLiked) {
      //  Returns a promise that resolves when the post is unliked
      return this.afs.collection('profiles').doc(this.profile.profileHandle).collection('posts').doc(post.uid).update({
        //  Decrement the post's like count by 1 and remove the current user's profile handle from the post's like owners array
        postLikeCount: firebase.firestore.FieldValue.increment(-1),
        postLikeOwners: firebase.firestore.FieldValue.arrayRemove(this.currentUser.user.profile.profileHandle)
      });
    }
  }

  //  Function to create a new comment on an existing post
  newComment(post, newComment: string) {
    //  Returns a promise that resolves when the comment is added to the database
    return this.afs.collection('profiles').doc(this.profile.profileHandle).collection('posts').doc(post.uid).update({
      //  Add the new comment to the post's comments array
      postComments: firebase.firestore.FieldValue.arrayUnion({
        commentLikeCount: 0,
        commentOwner: this.currentUser.user.profile.profileHandle,
        commentText: newComment,
        commentTimeStamp: new Date().getTime(),
      })
    });
  }

  //  Function to like a comment
  likeComment(comment) {
    //  Returns a promise that resolves when the comment's like count is incremented and the user is added to the 'commentLikeOwners' array
    return this.afs.collection('profiles').doc(this.profile.profileHandle).collection('posts').doc(comment).update({
      //  Increment the comment's like count and add the current user to the 'commentLikeOwners' array
      postComments: firebase.firestore.FieldValue.arrayUnion({
        commentLikeCount: comment.postComments.firebase.firestore.FieldValue.increment(1),
        commentLikeOwners: comment.postComments.firebase.firestore.FieldValue.arrayUnion(this.currentUser.user.profile.profileHandle),
      })
    });
  }

  //  Function to unlike a comment
  unlikeComment(comment) {
    //  Returns a promise that resolves when the comment's like count is decremented and the user is removed from the 'commentLikeOwners' array
    return this.afs.collection('profiles').doc(this.profile.profileHandle).collection('posts').doc(comment).update({
      //  Decrement the comment's like count and remove the current user from the 'commentLikeOwners' array
      postComments: firebase.firestore.FieldValue.arrayUnion({
        commentLikeCount: comment.firebase.firestore.FieldValue.increment(-1),
        commentLikeOwners: comment.firebase.firestore.FieldValue.arrayRemove(this.currentUser.user.profile.profileHandle),
      })
    });
  }

  //  Function to delete a post
  deletePost(post) {
    //  Returns a promise that resolves when the post is deleted from the database
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).delete();
  }

  //  Function to delete a comment
  deleteComment(post, comment) {
    //  Returns a promise that resolves when the comment is deleted from the database
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).update({
      postComments: firebase.firestore.FieldValue.arrayRemove(comment)
    });
  }

  //  This function shecks if the user has any workouts.
  checkWorkouts(): boolean {
    if (this.profile.workouts.length === 1) {
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

  updateAge() {
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

  updateWeight() {
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

  updateAbout() {
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

  updateVisibility() {
    const profileRef = this.afs.collection('profiles').doc(this.profile.profileHandle);

    //  Create a reference to the form element Visibility
    const form = document.querySelector('form');
    const visibility = form.elements['editVisibility'];

    //  Visibility to be changed through this variable
    let visibilitySelected;

    //  Determine which radio button is checked
    for (let i = 0; i < visibility.length; i++) {
      if (visibility[i].checked) {
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

  showAllPostsModal() {
    this.allPostsModal.nativeElement.style.display = "block";
  }

  closeAllPostsModal() {
    this.allPostsModal.nativeElement.style.display = "none";
  }
}
