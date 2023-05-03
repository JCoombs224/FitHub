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
            animate('0.4s ease-in',
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
  private subscription; // The subscription to the workout data if we're editing a workout
  loading = true;
  hideEquipment = false;
  workout: any;

  startTime: number;
  elapsedTime: number;
  displayTime: string;
  isRunning: boolean;
  timerInterval: any;

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
      this.title.setTitle(this.workout.name + " | Workout | FitHub");
      this.loading = false;
      this.subscription.unsubscribe();
    });

    const storedStartTime = localStorage.getItem('stopwatchStartTime');
    const storedElapsedTime = localStorage.getItem('stopwatchElapsedTime');
    this.startTime = storedStartTime ? parseInt(storedStartTime, 10) : 0;
    this.elapsedTime = storedElapsedTime ? parseInt(storedElapsedTime, 10) : 0;
    this.updateDisplayTime();
    this.start();
  }

  ngOnDestroy() {
    this.stop();
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
    this.displayTime = `${this.padNumber(minutes)}:${this.padNumber(seconds)}:${this.padNumber(milliseconds)}`;
  }

  padNumber(number: number) {
    return number.toString().padStart(2, '0');
  }

}
