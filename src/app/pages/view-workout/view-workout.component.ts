import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { AddExerciseModalComponent } from 'src/app/modals/add-exercise-modal/add-exercise-modal.component';
import { animate, style, transition, trigger } from "@angular/animations";
import { faX, faInfoCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { EquipmentModalComponent } from 'src/app/modals/equipment-modal/equipment-modal.component';
import { ConfirmDeleteModalComponent } from 'src/app/modals/confirm-delete-modal/confirm-delete-modal.component';

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
  userWorkout = false;
  modalRef;
  uid; // The workout UID if we're editing a workout
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

    // Get the workout from the database
    this.subscription = this.workoutService.getWorkout(this.uid).subscribe((workout) => {
      this.workout = workout;
      this.title.setTitle(this.workout.name+" | Workout | FitHub");
      this.loading = false;
      this.userWorkout = true; // If this is the current user's workout, we can edit it.
      this.subscription.unsubscribe();
    });



  }
}
