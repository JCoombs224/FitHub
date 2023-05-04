// src/app/services/goals.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, first } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export interface Goal {
  description: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private goalsDoc = this.afs.collection('goals').doc('pRnbn6OuepXPBrq1GyHH');
  private progress$ = new BehaviorSubject<number>(0);

  constructor(private afs: AngularFirestore) {
    this.getGoals().subscribe((goals) => {
      const completedGoals = goals.filter((goal) => goal.completed).length;
      const completionPercentage = (completedGoals / goals.length) * 100;
      this.progress$.next(completionPercentage);
    });
  }

  getGoals() {
    return this.goalsDoc.valueChanges().pipe(
      map((data: any) => {
        const goalsArray = data.Goals.map((goalDescription: string, index: number) => {
          return {
            description: goalDescription,
            completed: data.completed && data.completed[index] ? true : false,
          };
        });
        return goalsArray;
      })
    );
  }

  async completeGoal(goalIndex: number, completed: boolean): Promise<void> {
    this.getGoals()
      .pipe(first())
      .subscribe(async (goals) => {
        goals[goalIndex].completed = completed;
        const completedArray = goals.map((goal: Goal) => goal.completed);
        await this.goalsDoc.update({ completed: completedArray });

        // Update the progress
        const completedGoals = goals.filter((goal) => goal.completed).length;
        const completionPercentage = (completedGoals / goals.length) * 100;
        this.progress$.next(completionPercentage);
      });
  }

  getProgress() {
    return this.progress$.asObservable();
  }
}
