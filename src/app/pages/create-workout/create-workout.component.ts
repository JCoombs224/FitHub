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
import { WorkoutsService } from 'src/app/services/workouts.service';
import {BsModalService, ModalOptions} from "ngx-bootstrap/modal";
import { AddExerciseModalComponent } from 'src/app/modals/add-exercise-modal/add-exercise-modal.component';


@Component({
  selector: 'app-create-workout',
  templateUrl: './create-workout.component.html',
  styleUrls: ['./create-workout.component.css']
})
export class CreateWorkoutComponent {

  faEdit = faEdit;
  modalRef;

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
  exercises = [];
  
  constructor(private router: Router,
    private title: Title,
    private fb: FormBuilder,
    public authService: AuthService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    public currentUser: CurrentUserService,
    private workoutService: WorkoutsService) {}

  ngOnInit(): void {
    this.title.setTitle("New Workout | FitHub");
    this.addGroup();
  }

  getExercises(i) {
    this.exercises = [];
    this.workoutService.getExercises(this.getGroupAt(i).get('groupType').value).get().subscribe(data=>data.forEach(el=>{
      this.exercises.push(el.data());
      }));
    this.addMuscleExerciseAt(i);
  }

  addGroup() {
    this.groups.push(this.newGroup);
  }
  addMuscleExerciseAt(i) {
    const initialState = {
      initialState: {
        group: this.getGroupAt(i).get('groupType').value,
        callback: (result) => {
          if(result) {
            this.toastr.success("Added exercise to workout!");
            this.getExercisesAt(i).push(this.newMuscleExercise);
          }
        },
      },
      title: 'modal',
      backdrop: 'static',
      class: 'modal-lg'
    };
    this.modalRef = this.modalService.show(AddExerciseModalComponent, initialState as ModalOptions);
    
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
