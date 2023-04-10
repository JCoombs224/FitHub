import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { WorkoutsService } from 'src/app/services/workouts.service';

@Component({
  selector: 'app-add-exercise-modal',
  templateUrl: './add-exercise-modal.component.html',
  styleUrls: ['./add-exercise-modal.component.css']
})
export class AddExerciseModalComponent implements OnInit {

  group = '';
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

  public add() {
    if (this.bsModalRef.content.callback != null){
      this.bsModalRef.content.callback(true);
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
