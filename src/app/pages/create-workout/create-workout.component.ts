import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from 'src/app/services/auth.service'; 
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-create-workout',
  templateUrl: './create-workout.component.html',
  styleUrls: ['./create-workout.component.css']
})
export class CreateWorkoutComponent {

  faEdit = faEdit;

  workoutForm = this.fb.group({
    name: ['New Workout'],
    groups: new FormArray([])
  });

  workoutGroup = this.fb.group({
    groupType: [''], // cardio, triceps, biceps, etc.
    exercises: new FormArray([])
  });

  muscleExercise = this.fb.group({
    exerciseId: [''], // The exercise UID from the database
    name: [''],
    sets: [''],
    reps: [''],
    notes: ['']
  });

  cardioExercise = this.fb.group({
    name: [''],
    distance: [''],
    duration: [''],
    incline: [''],
    calories_burned: ['']
  });

  editingName = false;
  
  constructor(private router: Router,
    private title: Title,
    private fb: FormBuilder,
    public authService: AuthService,
    private toastr: ToastrService,
    public currentUser: CurrentUserService) {}

  ngOnInit(): void {
    this.title.setTitle("New Workout | FitHub");
  }

  get name() {
    return this.workoutForm.get('name');
  }

}
