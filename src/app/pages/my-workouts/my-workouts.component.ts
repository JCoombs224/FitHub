import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service'; 
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { faStar as starSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as starOutline } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-my-workouts',
  templateUrl: './my-workouts.component.html',
  styleUrls: ['./my-workouts.component.css']
})
export class MyWorkoutsComponent implements OnInit, OnDestroy {
  faPlusCircle = faPlusCircle;
  starOutline = starOutline;
  starSolid = starSolid;
  workouts = [];
  private subscription;
  loading = true;

  constructor(private router: Router,
    private title: Title,
    private fb: FormBuilder,
    public authService: AuthService,
    private toastr: ToastrService,
    public currentUser: CurrentUserService,
    private workoutService: WorkoutsService) {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.title.setTitle("My Workouts | FitHub");
    this.getWorkouts();
  }

  // Set workouts array to the value of the user's workouts collection
  getWorkouts() {
    this.subscription = this.workoutService.getWorkouts().subscribe(workouts => {
      this.workouts = workouts;
      this.loading = false;
      this.subscription.unsubscribe();
    });
  }

  newWorkout() {
    this.router.navigate(["my-workouts/create"]);
  }

  openWorkout(workout) {
    this.router.navigate(["workout/" + workout.uid]);
  }

  onFavClicked(event, workout) {
    event.stopPropagation();
    workout.favorite = !workout.favorite;
    this.workoutService.updateFavorite(workout.uid, workout.favorite).catch(error => {
      this.toastr.error("Something went wrong. Please try again later.");
      console.log(error);
    });
  }
}
