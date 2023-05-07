import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, first } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { CurrentUserService } from 'src/app/services/current-user.service';

export interface Goal {
  description: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private goalsDoc;
  private availableGoalsDoc = this.afs.collection('availableGoals').doc('RurqXsPUJfxUBXZ5nDkp');
  private progress$ = new BehaviorSubject<number>(0);

  constructor(private afs: AngularFirestore, private currentUserService: CurrentUserService) {

    this.currentUserService.account.subscribe(user => {
      if (user) {
        this.goalsDoc = this.afs.collection('userGoals').doc(user.uid);
      }
    });

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

  getAvailableGoals() {
    return this.availableGoalsDoc.valueChanges().pipe(
      map((data: any) => {
        return data.goals.map((goalDescription: string) => {
          return {
            description: goalDescription,
            completed: false,
            selected: false
          };
        });
      })
    );
  }

  async saveGoals(newGoals: Goal[]): Promise<void> {
    const completedArray = newGoals.map((goal: Goal) => goal.completed);
    await this.goalsDoc.update({ Goals: newGoals.map(goal => goal.description), completed: completedArray });

    const completedGoals = newGoals.filter((goal) => goal.completed).length;
    const completionPercentage = (completedGoals / newGoals.length) * 100;
    this.progress$.next(completionPercentage);
  }
}
