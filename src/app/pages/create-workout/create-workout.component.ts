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
  selector: 'app-create-workout',
  templateUrl: './create-workout.component.html',
  styleUrls: ['./create-workout.component.css'],
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
export class CreateWorkoutComponent implements OnInit, OnDestroy {

  // Instance variables
  faEdit = faEdit;
  faX = faX;
  faInfoCircle = faInfoCircle;
  faPlusCircle = faPlusCircle;
  modalRef;
  private uid; // The workout UID if we're editing a workout
  private subscription; // The subscription to the workout data if we're editing a workout
  loading = true;
  showInfo = false;
  editingName = true;
  editingWorkout = false;
  hideEquipment = false;
  exercises = [];
  equipmentGroups = [];
  equipment = [];
  
  workoutForm = this.fb.group({
    name: [''],
    equipment_group_name: [''],
    equipment: ['*'],
    description: [''],
    groups: this.fb.array([])
  });

  get newGroup() {
    return this.fb.group({
      groupType: ['New Group'], // cardio, triceps, biceps, etc.
      exercises: this.fb.array([])
    });
  }

  newMuscleExercise(name = '', instructions = '', secondaryMuscles = '') {
    return this.fb.group({
      exerciseId: [''], // The exercise UID from the database
      name: name,
      instructions: [instructions],
      secondaryMuscles: [secondaryMuscles],
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

  constructor(private router: Router,
              private title: Title,
              private route: ActivatedRoute,
              private fb: FormBuilder,
              public authService: AuthService,
              private modalService: BsModalService,
              private toastr: ToastrService,
              public currentUser: CurrentUserService,
              private workoutService: WorkoutsService) { }


  // Unsubscribe from the subscription to the workout data if we're editing a workout when the component is destroyed
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
  }

  ngOnInit(): void {
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });

    // Get equipment groups from user's profile
    this.workoutService.getEquipmentGroups().subscribe(data => { 
      this.equipmentGroups = data.equipmentGroups;
    });


    // Get the workout UID from the URL
    this.uid = this.route.snapshot.paramMap.get('uid');

    // If we're editing a workout, load the workout data into the form
    if (this.uid) {
      this.workoutForm.reset();
      this.title.setTitle("Edit Workout | FitHub");
      this.subscription = this.workoutService.openWorkout(this.route.snapshot.paramMap.get('uid')).subscribe(data => {
        // Add the groups and exercises to the form to be filled from data
        for (let group of data.groups) {
          this.groups.push(this.newGroup);
          for (let exercise of group.exercises) {
            this.getExercisesAt(this.groups.length - 1).push(this.newMuscleExercise(exercise.name, exercise.instructions, exercise.secondaryMuscles));
          }
        }
        // Fill the form with the data
        this.workoutForm.patchValue(data);
        this.editingWorkout = true;
        this.loading = false;
        this.editingName = false;
        this.equipment = data.equipment;
        if(this.equipment[0] == '*') {
          this.equipment[0] = "All Equipment Selected";
        }
      });
    }
    else {
      this.title.setTitle("Create Workout | FitHub");
      this.loading = false;
      this.addGroup();
      this.updateEquipmentList();
    }
  }

  addEquipmentGroup() {
    const initialState = {
      initialState: {
        callback: (group) => {
          if (group) {
            this.equipmentGroups.push(group);
            this.workoutForm.get('equipment').setValue(group.equipment.join(','));
            this.updateEquipmentList();
          }
        },
      },
      title: 'modal',
      backdrop: 'static',
      class: 'modal-lg'
    };
    this.modalRef = this.modalService.show(EquipmentModalComponent, initialState as ModalOptions);
  }

  editEquipmentGroup() {
    const initialState = {
      initialState: {
        equipment: this.equipmentGroups.find(e => this.arrayEquals(e.equipment, this.equipment)),
        callback: (group) => {
          if (group) {
            this.equipmentGroups.push(group);
            this.workoutForm.get('equipment').setValue(group.equipment.join(','));
            this.updateEquipmentList();
          }
        },
      },
      title: 'modal',
      backdrop: 'static',
      class: 'modal-lg'
    };
    this.modalRef = this.modalService.show(EquipmentModalComponent, initialState as ModalOptions);
  }

  updateEquipmentList() {
    console.log(this.workoutForm.get('equipment').value);
    if (this.workoutForm.get('equipment').value != '*') {
      if(this.workoutForm.get('equipment').value.includes(',')) {
        this.equipment = this.workoutForm.get('equipment').value.split(',');
      }
      else {
        this.equipment = [this.workoutForm.get('equipment').value];
      }
    }
    else {
      this.equipment = ['All Equipment Selected'];
    }
  }

  // Get the exercises for a group from the database
  getExercises(i) {
    this.exercises = [];
    this.workoutService.getExercises(this.getGroupAt(i).get('groupType').value).get().subscribe(data => data.forEach(el => {
      this.exercises.push(el.data());
    }));
    this.addMuscleExerciseAt(i);
  }

  // Add a group to the form
  addGroup() {
    this.groups.push(this.newGroup);
  }

  // Add a muscle exercise to the form
  addMuscleExerciseAt(i) {
    const initialState = {
      initialState: {
        group: this.getGroupAt(i).get('groupType').value,
        equipment: this.workoutForm.get('equipment').value,
        callback: (exercise) => {
          if (exercise) {
            this.toastr.success("Added exercise to workout!");
            this.getExercisesAt(i).push(this.newMuscleExercise(exercise.name, exercise.instructions.join(" "), exercise.secondaryMuscles.join(", ")));
            // this.getExercisesAt(i).get('exerciseId').setValue(exercise.id);
          }
          this.equipment.splice(this.equipment.indexOf('Body Only'), 1);
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

  removeExerciseAt(i, j) {
    this.getExercisesAt(i).removeAt(j);
    this.toastr.error("Removed exercise from workout");
  }

  removeGroupAt(i) {
    this.groups.removeAt(i);
    this.toastr.error("Removed group from workout");
  }

  // save workout to firebase under the current users profile
  saveWorkout() {
    // If we're editing a workout, update it
    if (this.editingWorkout) {
      this.workoutService.updateWorkout({ uid: this.uid, workout: this.workoutForm.getRawValue() }).then(() => {
        this.toastr.success("Workout updated!");
        this.router.navigate(['/my-workouts']);
      });
      return;
    }

    // If we're creating a new workout, save it
    this.workoutService.newWorkout(this.workoutForm.getRawValue()).then(() => {
      this.toastr.success("Workout saved!");
      this.router.navigate(['/my-workouts']);
    });
  }

  deleteWorkout() {
    const initialState = {
      initialState: {
        object: 'workout',
        callback: (value) => {
          if (value) {
            this.workoutService.deleteWorkout(this.uid).then(() => {
              this.toastr.success("Workout deleted!");
              this.router.navigate(['/my-workouts']);
            });
          }
        },
      },
      title: 'modal',
      backdrop: 'static',
      class: 'modal-lg'
    };
    this.modalRef = this.modalService.show(ConfirmDeleteModalComponent, initialState as ModalOptions);
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
