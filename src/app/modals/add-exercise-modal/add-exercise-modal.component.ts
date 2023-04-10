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

  constructor(public bsModalRef: BsModalRef,
              private workoutService: WorkoutsService) {}

  ngOnInit(): void {
    this.getExercises();
  }

  getExercises() {
    this.workoutService.getExercises(this.group).get().subscribe(data=>data.forEach(el=>{
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
