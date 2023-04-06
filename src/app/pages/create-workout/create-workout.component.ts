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

  get newGroup() {
    return this.fb.group({
      groupType: [''], // cardio, triceps, biceps, etc.
      exercises: new FormArray([])
    });
  }

  get newMuscleExercise() {
    return this.fb.group({
      exerciseId: [''], // The exercise UID from the database
      name: [''],
      sets: [''],
      reps: [''],
      notes: ['']
    });  
  }

  get newCardioExercise() {
    return this.fb.group({
      name: [''],
      distance: [''],
      duration: [''],
      incline: [''],
      calories_burned: ['']
    });
  }

  editingName = false;
  
  constructor(private router: Router,
    private title: Title,
    private fb: FormBuilder,
    public authService: AuthService,
    private toastr: ToastrService,
    public currentUser: CurrentUserService) {}

  ngOnInit(): void {
    this.title.setTitle("New Workout | FitHub");
    this.addGroup();
  }

  addGroup() {
    this.groups.push(this.newGroup);
  }
  addMuscleExerciseAt(i) {
    this.getExercisesAt(i).push(this.newMuscleExercise);
  }
  addCardioExerciseAt(i) {
    this.getExercisesAt(i).push(this.newCardioExercise);
  }

  get name() {
    return this.workoutForm.get('name');
  }
  get groups() {
    return this.workoutForm.get('groups') as FormArray;
  }
  getGroupAt(i) {
    return this.groups.at(i);
  }
  getExercisesAt(i) {
    return this.groups.at(i).get('exercises') as FormArray;
  }

}
