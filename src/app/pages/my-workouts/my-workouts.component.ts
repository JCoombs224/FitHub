import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from 'src/app/services/auth.service'; 
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { WorkoutsService } from 'src/app/services/workouts.service';

@Component({
  selector: 'app-my-workouts',
  templateUrl: './my-workouts.component.html',
  styleUrls: ['./my-workouts.component.css']
})
export class MyWorkoutsComponent {
  faPlusCircle = faPlusCircle;
  workouts = [];

  constructor(private router: Router,
    private title: Title,
    private fb: FormBuilder,
    public authService: AuthService,
    private toastr: ToastrService,
    public currentUser: CurrentUserService,
    private workoutService: WorkoutsService) {}

  ngOnInit(): void {
    this.title.setTitle("My Workouts | FitHub");
    this.getWorkouts();
  }

  // Set workouts array to the value of the user's workouts collection
  getWorkouts() {
    this.workoutService.getWorkouts().subscribe(workouts => {
      this.workouts = workouts;
      console.log(this.workouts);
    });
  }

  newWorkout() {
    this.router.navigate(["my-workouts/create"]);
  }

  openWorkout(workout) {
    this.router.navigate(["workout/" + workout.uid]);
  }
}
