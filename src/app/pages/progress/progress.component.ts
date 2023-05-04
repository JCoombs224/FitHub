// src/app/progress/progress.component.ts
import { Component, OnInit } from '@angular/core';
import { GoalsService, Goal } from '../../services/goals.service';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css'],
})
export class ProgressComponent implements OnInit {
  goals: Goal[] = [];
  progressValue: number;
  circumference = 2 * Math.PI * 82;
  strokeDashoffset: number;

  constructor(private goalsService: GoalsService) {}

  ngOnInit(): void {
    this.goalsService.getGoals().subscribe((goals) => {
      this.goals = goals;
      this.updateProgress();
    });
  }

  completeGoal(goalIndex: number, completed: boolean): void {
    this.goalsService.completeGoal(goalIndex, completed).then(() => {
      this.goals[goalIndex].completed = completed;
      this.updateProgress();
    });
  }

  updateProgress(): void {
    const completedGoals = this.goals.filter((goal) => goal.completed).length;
    this.progressValue = (completedGoals / this.goals.length) * 100;
    this.strokeDashoffset = this.calculateStrokeDashoffset(this.progressValue, 82);
  }

  calculateStrokeDashoffset(progressValue: number, circleRadius: number): number {
    return (1 - progressValue / 100) * (2 * Math.PI * circleRadius);
  }
}
