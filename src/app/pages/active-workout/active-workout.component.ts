import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
import { Timestamp } from 'firebase/firestore';

@Component({
  templateUrl: './active-workout.component.html',
  styleUrls: ['./active-workout.component.css'],
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
            animate('0.3s ease-in',
              style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class ActiveWorkoutComponent implements OnInit, OnDestroy {

  modalRef;
  uid; // The workout UID if we're editing a workout
  profile; // The profile of the user who created the workout
  private subscription; // The subscription to the workout data if we're editing a workout
  loading = true;
  hideEquipment = false;
  workout: any;
  checkBoxes = [];
  private exerciseOpen = [-1, -1];

  startTime: number;
  elapsedTime: number;
  displayTime: string;
  isRunning: boolean;
  timerInterval: any;

  private percentComplete = 0;

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
    this.profile = this.route.snapshot.paramMap.get('profile');

    // Get the workout from the database
    this.subscription = this.workoutService.getWorkout(this.uid, this.profile).subscribe((workout) => {
      this.workout = workout;

      // Create the checkbox indices for the exercises
      for(let group of workout.groups) {
        const temp = []
        for(let exercise of group.exercises) {
          temp.push(false);
        }
        this.checkBoxes.push(temp);
      }
      
      this.title.setTitle(this.workout.name + " | Workout | FitHub");
      this.loading = false;
      this.subscription.unsubscribe();
    });

    const storedStartTime = localStorage.getItem('stopwatchStartTime');
    const storedElapsedTime = localStorage.getItem('stopwatchElapsedTime');
    this.startTime = storedStartTime ? parseInt(storedStartTime, 10) : 0;
    this.elapsedTime = storedElapsedTime ? parseInt(storedElapsedTime, 10) : 0;
    this.updateDisplayTime();
    if(storedStartTime) {
      this.start();
    }
    this.startTime = Date.now() - this.elapsedTime;
  }

  ngOnDestroy() {
    this.stop();
  }

  getPercentComplete() {
    let total = 0;
    let completed = 0;
    for(let i = 0; i < this.checkBoxes.length; i++) {
      for(let j = 0; j < this.checkBoxes[i].length; j++) {
        total++;
        if(this.checkBoxes[i][j]) {
          completed++;
        }
      }
    }
    return Math.round((completed / total) * 100);
  }

  openExercise(i, j) {
    if(this.exerciseOpen[0] === i && this.exerciseOpen[1] === j) {
      this.exerciseOpen = [-1, -1];
    }
    else {
      this.exerciseOpen = [i, j];
    }
  }

  isOpen(i, j) {
    return this.exerciseOpen[0] === i && this.exerciseOpen[1] === j;
  }

  start() {
    this.startTime = Date.now() - this.elapsedTime;
    localStorage.setItem('stopwatchStartTime', this.startTime.toString());
    this.isRunning = true;
    this.timerInterval = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
      localStorage.setItem('stopwatchElapsedTime', this.elapsedTime.toString());
      this.updateDisplayTime();
    }, 100);
  }

  stop() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    localStorage.removeItem('stopwatchStartTime');
    localStorage.removeItem('stopwatchElapsedTime');
  }

  reset() {
    this.stop();
    this.elapsedTime = 0;
    this.updateDisplayTime();
  }

  updateDisplayTime() {
    const minutes = Math.floor(this.elapsedTime / 60000);
    const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
    const milliseconds = Math.floor((this.elapsedTime % 1000) / 10);
    this.displayTime = `${this.padNumber(minutes)}:${this.padNumber(seconds)}`;//:${this.padNumber(milliseconds)}`;
  }

  private getElapsedTime() {
    const elapsed = Date.now() - this.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const milliseconds = Math.floor((elapsed % 1000) / 10);
    return `${this.padNumber(minutes)}:${this.padNumber(seconds)}`;//:${this.padNumber(milliseconds)}`;
  }

  padNumber(number: number) {
    return number.toString().padStart(2, '0');
  }

  completeWorkout() {
    const data = {uid: this.uid, name: this.workout.name, createdBy: this.profile, percentComplete: this.getPercentComplete(), elapsedTime: this.getElapsedTime().toString(), date: new Timestamp(Date.now() / 1000, 0)};
    this.workoutService.completeWorkout(data).then(() => {
      // Update the local profile to reflect the changes
      this.currentUser.fetchProfile(this.currentUser.user.account);

      this.toastr.success("Great Job!", "Workout Complete");
      this.router.navigate(['/dashboard']);
    }).catch((error) => {
      this.toastr.error("Something went wrong", "Error");
      console.log(error);
    });
  }

}
