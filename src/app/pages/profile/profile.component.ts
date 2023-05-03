import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
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


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  template: `
    <button class="btn btn-outline-secondary">
      <fa-icon [icon]="faCog"></fa-icon>
    </button>
  `
})

export class ProfileComponent implements OnInit {

  faEdit = faEdit;
  public urlProfileHandle;
  profile = this.profileService.initProfile;
  userProfile = false;
  isPrivate = false;
  showModal = false;
  loadingImage = true;
  profilePictureUrl = ""; // default profile picture
  workouts = [];
  workoutsSubscription;
  showUploadButton = false;
  showCropper = false;
  posts;
  imageChangedEvent: any = '';
  croppedImage: any = '';

  @ViewChild('followersModal') followersModal: ElementRef;
  @ViewChild('followingModal') followingModal: ElementRef;
  @ViewChild('postsModal') postsModal: ElementRef;
  @ViewChild('workoutsModal') workoutsModal: ElementRef;
  @ViewChild('editProfileModal') editProfileModal: ElementRef;
  @ViewChild('allPostsModal') allPostsModal: ElementRef;
  @ViewChild('editPostModal') editPostModal: ElementRef;

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
    private toastr: ToastrService,
  ) { }

  // When the page is loaded
  ngOnInit(): void {
    // Subscribe to the url param for the profile username and update the page based on that
    this.route.paramMap.subscribe(params => {
      this.urlProfileHandle = params.get('name');
      this.title.setTitle(`@${this.urlProfileHandle} | FitHub`);

      this.loadProfileData().then(() => {
        this.loadProfilePostsData(this.profile.profileHandle).then(() => {
          this.displayPosts();
        });
        this.checkFollowers();
      });
    });

    this.workoutsSubscription = this.workoutService.getWorkouts().subscribe(workouts => {
      this.workouts = workouts;
    });
  }

  // Load the profile data from the database
  private loadProfileData() {
    return new Promise((resolve) => {
      // Check if the profile handle is the current user
      if (this.urlProfileHandle == this.currentUser.user.profile.profileHandle) {
        // Set the profile to the current user information
        this.profile = this.currentUser.user.profile;
        this.userProfile = true;

        resolve(true);

        // Get profile picture from database
        const filePath = `profile-pictures/${this.profile.profileHandle}`;
        const fileRef = this.storage.ref(filePath);
        fileRef.getDownloadURL().subscribe(url => {
          this.profilePictureUrl = url;
          this.loadingImage = false;
        }, () => {
          this.profilePictureUrl = "https://wilcity.com/wp-content/uploads/2020/06/115-1150152_default-profile-picture-avatar-png-green.jpg"; // default profile picture
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

          resolve(true);

          // Get profile picture from database
          const filePath = `profile-pictures/${this.profile.profileHandle}`;
          const fileRef = this.storage.ref(filePath);
          fileRef.getDownloadURL().subscribe(url => {
            this.profilePictureUrl = url;
            this.loadingImage = false;
          }, () => {
              this.profilePictureUrl = "https://wilcity.com/wp-content/uploads/2020/06/115-1150152_default-profile-picture-avatar-png-green.jpg"; // default profile picture
              this.loadingImage = false;
            });
        });
      }
    });

  }

  loadProfilePostsData(profile = this.profile.profileHandle) {
    return new Promise<void>((resolve, reject) => {
      this.afs.collection('profiles').doc(profile).collection('posts', ref => ref.orderBy('postTimeStamp', 'desc')).snapshotChanges().pipe(
        map((posts: any[]) => {
          return posts.map(post => {
            const data = post.payload.doc.data();
            const uid = post.payload.doc.id;
            const postImg = data.postImg;
            const postText = data.postText;
            const postTimeStamp = data.postTimeStamp;
            const postLikeOwners = data.postLikeOwners;
            const postLikeCount = data.postLikeCount;
            const postWorkout = data.postWorkout;
            const postComments = data.postComments.map(comment => ({
              commentLikeCount: comment.commentLikeCount,
              commentLikeOwners: comment.commentLikeOwners,
              commentOwner: comment.commentOwner,
              commentText: comment.commentText,
              commentTimeStamp: comment.commentTimeStamp,
            }));
            return { uid, postImg, postText, postTimeStamp, postLikeOwners, postLikeCount, postWorkout, postComments };
          });
        })
      ).subscribe(posts => {
        this.posts = posts;
        resolve();
      });
    });
  }

  //  Button that allows a user to upload a profile picture
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

  //  Checks if the user has updated their profile picture
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  //  Crops the image to a square
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  //  Uploads the image to firebase
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
    //  If the target user has no followers, return false
    if (this.profile.followers.length === 0) {
      return false;
    }
    //  Loop through the target user's followers array and check if the current user is in it
    for (let i = 0; i < this.profile.followers.length; i++) {
      if (this.profile.followers[i] === this.currentUser.user.profile.profileHandle) {
        return true;
      }
    }
    return false;
  }

  getWorkouts(profile: string) {
    return this.workoutService.getWorkouts(this.profile.profileHandle);
  }

  //  Function to display this porfile's posts in a modal
  displayPosts() {

    //  Get the element by id: posts
    const posts = document.getElementById('posts');
    posts.innerHTML = '';

    if (this.posts.length === 0) {

      const noPosts = document.createElement('div');
      noPosts.className = 'card w-100 mb-2';
      noPosts.style.width = '18rem';
      noPosts.innerHTML = 'No posts to display';
      posts.appendChild(noPosts);
    }

    else {
      //  Loop through the posts and create a card for each of them with a like
      //  and comment button and also display the comments for each post within the post card
      for (let i = 0; i < this.posts.length; i++) {
        const postCard = document.createElement('div');
        postCard.className = 'card mb-2';
        postCard.style.width = 'auto';
        postCard.style.borderColor = '#212529';

        //  Create a card header with no background to show the timestamp of the post
        const postCardHeader = document.createElement('div');
        postCardHeader.className = 'card-header bg-dark text-white';
        postCardHeader.style.textAlign = 'left';
        postCardHeader.style.fontSize = '15px';
        postCardHeader.innerHTML = this.posts[i].postTimeStamp.toDate().toDateString();

        if (this.profile.profileHandle === this.currentUser.user.profile.profileHandle) {
          //  Create a "-" button to delete the post when hovered on and has an info attribute that says "Delete this post?"
          const deletePostButton = document.createElement('button');
          deletePostButton.className = 'btn btn-outline-secondary';
          deletePostButton.style.float = 'right';
          deletePostButton.innerHTML = 'Delete Post';
          deletePostButton.addEventListener('click', () => {
            if (confirm("Are you sure you want to delete this post?")) {
              this.deletePost(this.posts[i]);
            }
          });

          //  Change the background color of the delete post button when hovered on
          deletePostButton.addEventListener('mouseover', () => {
            deletePostButton.style.backgroundColor = 'red';
          });

          //  Change the background color of the delete post button when the mouse leaves the button
          deletePostButton.addEventListener('mouseout', () => {
            deletePostButton.style.backgroundColor = 'transparent';
          });

          deletePostButton.setAttribute('data-toggle', 'tooltip');
          deletePostButton.setAttribute('data-placement', 'top');
          deletePostButton.setAttribute('title', 'Delete this post?');

          postCardHeader.appendChild(deletePostButton);
        }

        //  Create a card body to hold the post text, image, and the like and comment buttons
        const postCardBody = document.createElement('div');
        postCardBody.className = 'card-body';

        //  Create an image element to show post[i].postImg if it exists
        const postCardImgWrapper = document.createElement('div');
        postCardImgWrapper.style.display = 'flex';
        postCardImgWrapper.style.justifyContent = 'center';
        postCardImgWrapper.style.padding = '0';
        postCardImgWrapper.className = 'pb-5';

        const postCardImg = document.createElement('img');
        postCardImg.className = 'img-fluid';
        postCardImg.style.width = 'auto';
        postCardImg.style.height = '100%';
        postCardImg.style.display = 'flex';
        postCardImg.style.justifyContent = 'center';
        postCardImg.style.borderRadius = '10px';
        postCardImg.style.border = '1px solid black';
        postCardImg.style.maxHeight = '60vh';

        postCardImgWrapper.appendChild(postCardImg);

        //  If the post has an image, display it
        if (this.posts[i].postImg !== '') {
          postCardImg.src = this.posts[i].postImg;
        }

        if (this.posts[i].postWorkout !== 'None') {
          const postCardWorkout = document.createElement('p');
          postCardWorkout.className = 'card-text';
          postCardWorkout.style.fontSize = '20px';
          postCardWorkout.style.textAlign = 'left';
          postCardWorkout.innerHTML = this.posts[i].postWorkout;
          postCardBody.appendChild(postCardWorkout);
        }

        const hr = document.createElement('hr');
        hr.className = 'mb-5 mt-0';

        //  Create a card text to hold the post text
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

          //  Change the background color of the unlike button when hovered on
          postCardLike.addEventListener('mouseover', () => {
            postCardLike.style.backgroundColor = 'gray';
          });

          //  Change the background color of the unlike button when the mouse leaves the button
          postCardLike.addEventListener('mouseout', () => {
            postCardLike.style.backgroundColor = 'white';
          });
        }

        else {
          postCardLike.innerHTML = this.posts[i].postLikeCount + ' Like';
          postCardLike.addEventListener('click', () => {
            this.likePost(this.posts[i]);
          });

          //  Change the background color of the like button when hovered on
          postCardLike.addEventListener('mouseover', () => {
            postCardLike.style.backgroundColor = 'blue';
          });

          //  Change the background color of the like button when the mouse leaves the button
          postCardLike.addEventListener('mouseout', () => {
            postCardLike.style.backgroundColor = 'white';
          });
        }

        //  Create a comment button under the textarea for the user to submit a comment
        const commentButton = document.createElement('button');
        commentButton.className = 'btn btn-outline-success';
        commentButton.style.marginLeft = '3px';
        commentButton.innerHTML = 'Comment';
        commentButton.addEventListener('click', () => {
          this.commentPost(this.posts[i], i);
        });

        //  Create a text area for the user to enter a comment underneath the postText
        const commentTextArea = document.createElement('textarea');
        commentTextArea.className = 'form-control';
        commentTextArea.id = 'commentTextArea' + i;
        commentTextArea.rows = 3;
        commentTextArea.placeholder = 'Reply to @' + this.profile.profileHandle + '\'s post...';

        //  Append the post card to the posts div
        posts.appendChild(postCard);
        postCard.appendChild(postCardHeader);
        postCard.appendChild(postCardBody);
        if (typeof this.posts[i].postImg !== 'undefined' && this.posts[i].postImg !== '') {
          postCardBody.appendChild(postCardImgWrapper);
          postCardBody.appendChild(hr);
        }
        postCardBody.appendChild(postCardText);
        postCardBody.appendChild(commentTextArea);
        postCardBody.appendChild(postCardLike);
        postCardBody.appendChild(commentButton);

        if (this.posts[i].postComments.length > 0) {
          //  Loop through this posts comments and create a paragraph for each of them with a like button for each comment
          for (let j = 0; j < this.posts[i].postComments.length; j++) {
            //  Only display comments that contain text. This is to prevent empty comments from being displayed.
            if (this.posts[i].postComments[j].commentText !== '') {
              const commentCard = document.createElement('div');
              commentCard.className = 'card w-75 mb-2';
              commentCard.style.width = '18rem';
              commentCard.style.marginLeft = '25px';

              const commentCardHeader = document.createElement('div');
              commentCardHeader.className = 'card-header w-100';
              commentCardHeader.style.backgroundColor = 'white';
              commentCardHeader.style.textAlign = 'left';
              commentCardHeader.style.fontSize = '15px';
              //  Display the comment timestamp and the comment owner as a link to their profile
              commentCardHeader.innerHTML = this.posts[i].postComments[j].commentTimeStamp.toDate().toDateString();
              commentCardHeader.innerHTML += ' - <a href="#/profile/' + this.posts[i].postComments[j].commentOwner + '">' + this.posts[i].postComments[j].commentOwner + '</a>';

              //  Create a gear button to allow the user to delete their own comments
              if (this.posts[i].postComments[j].commentOwner === this.currentUser.user.profile.profileHandle || this.profile.profileHandle === this.currentUser.user.profile.profileHandle) {
                const commentCardGear = document.createElement('button');
                commentCardGear.className = 'btn btn-outline-secondary';
                commentCardGear.style.float = 'right';
                commentCardGear.innerHTML = 'Delete Comment';

                //  Change backgroud color of the button to red on hover
                commentCardGear.addEventListener('mouseover', () => {
                  commentCardGear.style.backgroundColor = 'red';
                });

                //  Change backgroud color of the button back to white on mouseout
                commentCardGear.addEventListener('mouseout', () => {
                  commentCardGear.style.backgroundColor = 'white';
                });

                commentCardGear.addEventListener('click', () => {
                  if (confirm("Are you sure you want to delete this comment?")) {
                    this.deleteComment(this.posts[i], this.posts[i].postComments[j]);
                  }
                });

                //  Append the gear button to the card header
                commentCardHeader.appendChild(commentCardGear);
              }

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
                  this.unlikeComment(this.posts[i], i, this.posts[i].postComments[j], j);
                });

                //  Change the background color of the unlike button when hovered on
                commentCardLike.addEventListener('mouseover', () => {
                  commentCardLike.style.backgroundColor = 'gray';
                });

                //  Change the background color of the unlike button when the mouse leaves the button
                commentCardLike.addEventListener('mouseout', () => {
                  commentCardLike.style.backgroundColor = 'white';
                });
              }

              else {
                commentCardLike.innerHTML = this.posts[i].postComments[j].commentLikeCount + ' Like';
                commentCardLike.addEventListener('click', () => {
                  this.likeComment(this.posts[i], i, this.posts[i].postComments[j], j);
                });

                //  Change the background color of the like button when hovered on
                commentCardLike.addEventListener('mouseover', () => {
                  commentCardLike.style.backgroundColor = 'blue';
                });

                //  Change the background color of the like button when the mouse leaves the button
                commentCardLike.addEventListener('mouseout', () => {
                  commentCardLike.style.backgroundColor = 'white';
                });
              }

              commentCard.append(commentCardHeader);
              commentCardBody.appendChild(commentCardText);
              commentCardBody.appendChild(commentCardLike);
              commentCard.appendChild(commentCardBody);
              postCardBody.appendChild(commentCard);
            }
          }
        }
      }
    }
  }

  commentPost(post, i) {
    // Get the comment text from the textarea
    const commentText = (<HTMLInputElement>document.getElementById('commentTextArea' + i)).value;

    // Check if the comment text is empty
    if (commentText === '') {
      return;
    }

    // Get the current post document from Firestore
    const postDocRef = this.afs.collection('profiles').doc(this.profile.profileHandle)
      .collection('posts').doc(post.uid);

    // Get the current server timestamp
    const serverTimestamp = new Timestamp(Date.now() / 1000, 0);

    // Get the post document from Firestore
    postDocRef.get().toPromise().then(postDoc => {
      // Get the post's comments array from the document data
      const postComments = postDoc.data().postComments || [];

      // Add the new comment object to the comments array
      postComments.push({
        commentText: commentText,
        commentOwner: this.currentUser.user.profile.profileHandle,
        commentTimeStamp: serverTimestamp,
        commentLikeCount: 0,
        commentLikeOwners: []
      });

      // Update the post document with the updated comments array
      postDocRef.update({ postComments: postComments }).then(() => {
        // Clear the textarea
        (<HTMLInputElement>document.getElementById('commentTextArea' + i)).value = '';
      })
        .then(() => this.loadProfilePostsData())
        .then(() => this.displayPosts())
        .then(() => this.toastr.success('Comment posted successfully!', 'Success'));
    });
  }

  //  Function to save a post
  savePost(post) {
    //  Get the post's text from the textarea
    const postText = (<HTMLInputElement>document.getElementById('editPostTextArea' + post.uid)).value;

    //  Check if the post text is empty
    if (postText === '') {
      return;
    }

    //  Get the current post document from Firestore
    const postDocRef = this.afs.collection('profiles').doc(this.profile.profileHandle)
      .collection('posts').doc(post.uid);

    //  Get the current server timestamp
    const serverTimestamp = new Timestamp(Date.now() / 1000, 0);

    //  Update the post document with the updated post text and timestamp
    postDocRef.update({
      postText: postText,
      postTimeStamp: serverTimestamp
    }).then(() => {
      //  Clear the textarea
      (<HTMLInputElement>document.getElementById('postTextArea' + post.uid)).value = '';
    })
      .then(() => this.loadProfilePostsData())
      .then(() => this.displayPosts())
      .then(() => this.toastr.success('Post edited successfully!', 'Success'));
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
      }).then(() => this.loadProfilePostsData()).then(() => this.displayPosts());
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
      }).then(() => this.loadProfilePostsData()).then(() => this.displayPosts());
    }
  }

  //  Function to like a comment
  likeComment(post, postIndex, comment, commentIndex) {
    // Check if the current user has already liked the comment
    let alreadyLiked = false;
    for (let i = 0; i < comment.commentLikeOwners.length; i++) {
      if (this.posts[postIndex].postComments[commentIndex].commentLikeOwners[i] === this.currentUser.user.profile.profileHandle) {
        alreadyLiked = true;
        break;
      }
    }

    // If the current user hasn't already liked the comment, like it
    if (!alreadyLiked) {
      // Get the existing postComments array
      const postRef = this.afs.collection('profiles').doc(this.profile.profileHandle).collection('posts').doc(post.uid);
      return postRef.get().toPromise().then(doc => {
        if (doc.exists) {
          const post = doc.data();
          const postComments = post.postComments.slice(); // Make a copy of the array to modify
          const commentToUpdate = postComments[commentIndex];
          const updatedComment = {
            ...commentToUpdate,
            commentLikeCount: commentToUpdate.commentLikeCount + 1,
            commentLikeOwners: [...commentToUpdate.commentLikeOwners, this.currentUser.user.profile.profileHandle]
          };
          postComments[commentIndex] = updatedComment;
          // Update the entire postComments array with the modified item
          return postRef.update({
            postComments: postComments
          }).then(() => this.loadProfilePostsData()).then(() => this.displayPosts());;
        } else {
          console.log("No such document!");
        }
      }).catch(error => {
        console.log("Error getting document:", error);
      });
    }
  }

  //  Function to unlike a comment
  unlikeComment(post, postIndex, comment, commentIndex) {
    // Check if the current user has already liked the comment
    let alreadyLiked = false;
    let commentToUpdate = null;
    let updatedComment = null;
    for (let i = 0; i < comment.commentLikeOwners.length; i++) {
      if (this.posts[postIndex].postComments[commentIndex].commentLikeOwners[i] === this.currentUser.user.profile.profileHandle) {
        alreadyLiked = true;
        // Found the current user's like, remove it from the commentLikeOwners array and decrement the commentLikeCount
        commentToUpdate = this.posts[postIndex].postComments[commentIndex];
        updatedComment = {
          ...commentToUpdate,
          commentLikeCount: commentToUpdate.commentLikeCount - 1,
          commentLikeOwners: commentToUpdate.commentLikeOwners.filter(owner => owner !== this.currentUser.user.profile.profileHandle)
        };
        break;
      }
    }

    // If the current user has already liked the comment, unlike it
    if (alreadyLiked) {
      // Get the existing postComments array
      const postRef = this.afs.collection('profiles').doc(this.profile.profileHandle).collection('posts').doc(post.uid);
      return postRef.get().toPromise().then(doc => {
        if (doc.exists) {
          const post = doc.data();
          const postComments = post.postComments.slice(); // Make a copy of the array to modify
          postComments[commentIndex] = updatedComment;
          // Update the entire postComments array with the modified item
          return postRef.update({
            postComments: postComments
          }).then(() => this.loadProfilePostsData()).then(() => this.displayPosts());;
        } else {
          console.log("No such document!");
        }
      }).catch(error => {
        console.log("Error getting document:", error);
      });
    }
  }

  //  Function to delete a post
  deletePost(post) {
    //  Returns a promise that resolves when the post is deleted from the database
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).delete()
      .then(() => this.loadProfilePostsData())
      .then(() => this.displayPosts())
      .then(() => this.toastr.success('Post deleted successfully!', 'Success'));
  }

  //  Function to delete a comment
  deleteComment(post, comment) {
    //  Returns a promise that resolves when the comment is deleted from the database
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).update({
      postComments: firebase.firestore.FieldValue.arrayRemove(comment)
    }).then(() => this.loadProfilePostsData())
      .then(() => this.displayPosts())
      .then(() => this.toastr.success('Comment deleted successfully!', 'Success'));
  }

  //  This function checks if the user has any workouts.
  checkWorkouts(): boolean {
    if (this.profile.workouts.length === 1) {
      return false;
    }
    return true;
  }

  //  This function gets text the user has entered and creates a new post in the user's posts collection
  createPost() {
    let imageToPost = (<HTMLInputElement>document.getElementById("ImageToPost")).files[0];
    let postText = (<HTMLInputElement>document.getElementById("PostText")).value;
    let postImgUrl = '';

    let postWorkout = (<HTMLInputElement>document.getElementById("PostWorkout")).value;
    let workout = this.workoutService.getWorkout(postWorkout);
    let workoutName = '';

    //  subscribe to the workout observable
    workout.subscribe((workout) => {
      //  Get the workout name
      workoutName = workout.name;
    });

    console.log("Workout name: " + workoutName);


    //  Check to see if the user has selected an image
    if (imageToPost) {
      this.toastr.info('Uploading image...', 'Please wait');

      //  Create a randomized reference name for the image 32 characters long
      let randomId = Math.random().toString(36).substring(0, 16) + Math.random().toString(36).substring(0, 16);

      //  Create a storage reference for the image
      const storageRef = firebase.storage().ref(`postImages/${randomId}`);

      //  Upload the image to the storage reference
      const uploadTask = storageRef.put(imageToPost);

      //  Get the image url for the image
      uploadTask.on('state_changed', (snapshot) => {
        //  Show a progress bar in a toastr
        this.toastr.info('Uploading image...', 'Please wait');
      }, (error) => {
        //  Handle unsuccessful uploads
        console.log(error);
      }, () => {
        //  Do something once upload is complete
        uploadTask.snapshot.ref.getDownloadURL()
          .then((downloadURL) => {
            //  Set the postImgUrl to the download url for the image
            postImgUrl = downloadURL;
          })
          .then(() => {
            //  Create a new post object
            let post = {
              uid: this.afs.createId(),
              postText: postText,
              postTimeStamp: new Timestamp(Date.now() / 1000, 0),
              postLikeCount: 0,
              postLikeOwners: [],
              postImg: postImgUrl,
              postWorkout: postWorkout,
              postComments: [{
                commentText: '',
                commentTimeStamp: new Timestamp(Date.now() / 1000, 0),
                commentLikeCount: 0,
                commentLikeOwners: []
              }]
            }
            //  Add the post to the user's posts collection
            this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).set(post)
              .then(() => this.loadProfilePostsData())
              .then(() => this.displayPosts())
              .then(() => this.toastr.success('Post created successfully with an image!', 'Success'));
          });
      });
    }

    else {
      //  Create a new post object
      let post = {
        uid: this.afs.createId(),
        postText: postText,
        postTimeStamp: new Timestamp(Date.now() / 1000, 0),
        postLikeCount: 0,
        postLikeOwners: [],
        postImg: postImgUrl,
        postWorkout: postWorkout,
        postComments: [{
          commentText: '',
          commentTimeStamp: new Timestamp(Date.now() / 1000, 0),
          commentLikeCount: 0,
          commentLikeOwners: []
        }]
      }
      //  Add the post to the user's posts collection
      this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('posts').doc(post.uid).set(post)
        .then(() => this.loadProfilePostsData())
        .then(() => this.displayPosts())
        .then(() => this.toastr.success('Post created successfully without an image!', 'Success'));
    }

    //  Clear the PostText element on the HTML doc.
    (<HTMLInputElement>document.getElementById("PostText")).value = '';

    //  Clear the ImageToPost element on the HTML doc.
    (<HTMLInputElement>document.getElementById("ImageToPost")).value = '';

    //  Close the modal
    this.closePostsModal();
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
    this.toastr.success('Profile updated successfully!', 'Success');
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

  showEditPostModal() {
    this.editPostModal.nativeElement.style.display = "block";
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
