import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { WorkoutsService } from 'src/app/services/workouts.service';
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-add-exercise-modal',
  templateUrl: './add-exercise-modal.component.html',
  styleUrls: ['./add-exercise-modal.component.css'],
  animations: [
    trigger(
      'slideOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, opacity: 0 }),
            animate('0.4s ease-out',
              style({ }))
          ]
        ),
        transition(
          ':leave',
          [
            style({  }),
            animate('0.4s ease-in',
              style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class AddExerciseModalComponent implements OnInit {

  group = '';
  openExerciseIndex = -1;
  exercises = [];
  equipment;
  filters = [];

  constructor(public bsModalRef: BsModalRef,
              private workoutService: WorkoutsService) {}

  ngOnInit(): void {
    if(this.equipment.includes(',')) {
      this.equipment = this.equipment.split(',');
    }
    if(this.equipment instanceof Array) {
      this.filters = this.equipment;
    } 
    else {
      this.filters.push(this.equipment);
    }
    this.getExercises();
  }

  getExercises() {
    this.workoutService.getExercises(this.group, this.filters).get().subscribe(data=>data.forEach(el=>{
      this.exercises.push(el.data());
      }));
  }

  public addExercise(exercise) {
    if (this.bsModalRef.content.callback != null){
      this.bsModalRef.content.callback(exercise);
      this.bsModalRef.hide();
    }
  }

  public cancel() {
    if (this.bsModalRef.content.callback != null) {
      this.bsModalRef.content.callback(false);
      this.bsModalRef.hide();
    }
  }
}
