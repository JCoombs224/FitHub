import { Component, OnInit } from '@angular/core';
import {FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { animate, style, transition, trigger } from "@angular/animations";
import { faX, faInfoCircle, faPlusCircle, faDumbbell } from '@fortawesome/free-solid-svg-icons';

@Component({
  templateUrl: './view-workout.component.html',
  styleUrls: ['./view-workout.component.css'],
  animations: [
    trigger(
      'slideOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, opacity: 0 }),
            animate('0.4s ease-out',
              style({}))
          ]
        ),
        transition(
          ':leave',
          [
            style({}),
            animate('0.4s ease-in',
              style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class ViewWorkoutComponent implements OnInit{

  // Instance variables
  faEdit = faEdit;
  faX = faX;
  faInfoCircle = faInfoCircle;
  faPlusCircle = faPlusCircle;
  faDumbbell = faDumbbell;
  userWorkout = true;
  modalRef;
  uid; // The workout UID if we're editing a workout
  profile; // The user's profile
  private subscription; // The subscription to the workout data if we're editing a workout
  loading = true;
  hideEquipment = false;
  workout: any;


  constructor(private router: Router,
    private title: Title,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public authService: AuthService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    public currentUser: CurrentUserService,
    private workoutService: WorkoutsService) { }

  ngOnInit() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    // Get the workout UID from the URL
    this.uid = this.route.snapshot.paramMap.get('uid');

    // Check if this is the current user's workout
    if(this.route.snapshot.paramMap.get('profile')) {
      this.userWorkout = false; // If this is the current user's workout, we can edit it.
      this.profile = this.route.snapshot.paramMap.get('profile');
    }
    else {
      this.profile = this.currentUser.user.profile.profileHandle; // If this is the current user's workout, we can't edit it.
    }

    // Get the workout from the database
    if(this.profile == 'curated') {
      this.workoutService.getCuratedWorkoutById(this.uid).then((workout) => {
        this.workout = workout.data();
        this.title.setTitle(this.workout.name+" | Workout | FitHub");
        this.loading = false;
      });
    } else {
      this.subscription = this.workoutService.getWorkout(this.uid, this.profile).subscribe((workout) => {
        this.workout = workout;
        this.title.setTitle(this.workout.name+" | Workout | FitHub");
        this.loading = false;
        this.subscription.unsubscribe();
      });
    }

  }

  startWorkout() {
    this.router.navigate(['active-workout/', this.profile, this.uid]);
  }

  showCurateButton() {
    const handle = this.currentUser.user.profile.profileHandle;
    return handle == 'jamisoncoombs' || handle == 'SwankyWorkouts' || handle == 'rusty';
  }

  curate() {
    this.workoutService.addCuratedWorkout(this.workout).then(() => {
      this.toastr.success("Workout added curated workouts.", "Success!");
    }).catch((error) => {
      this.toastr.error("Please try again.", "Something went wrong");
      console.log(error);
    });
  }

}
