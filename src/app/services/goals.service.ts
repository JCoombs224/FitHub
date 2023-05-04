// src/app/services/goals.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

export interface Goal {
  id: string;
  description: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private goalsCollection = this.afs.collection('goals');
  private progress$ = new BehaviorSubject<number>(0);

  constructor(private afs: AngularFirestore) {
    this.getGoals().subscribe((goals) => {
      const completedGoals = goals.filter((goal) => goal.completed).length;
      const completionPercentage = (completedGoals / goals.length) * 100;
      this.progress$.next(completionPercentage);
    });
  }

  getGoals() {
    return this.goalsCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data };
        }).filter((goal) => goal.hasOwnProperty('completed'))
      )
    );
  }

  async completeGoal(goalIndex: number, completed: boolean): Promise<void> {
    this.getGoals()
      .pipe(first())
      .subscribe(async (goals) => {
        const goal = goals[goalIndex];
        await this.goalsCollection.doc(goal.id).update({ completed });

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
