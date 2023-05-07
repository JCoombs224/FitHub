import { Component, OnInit } from '@angular/core';
import { GoalsService, Goal } from 'src/app/services/goals.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  availableGoals: Goal[] = [];

  newGoalDescription: string = '';

  constructor(private goalsService: GoalsService) {}

  ngOnInit(): void {
    this.goalsService.getGoals().subscribe((goals) => {
      this.availableGoals = goals;
    });
  }

  onCreateNewGoal() {
    if (this.newGoalDescription) {
      const newGoal: Goal = {
        description: this.newGoalDescription,
        completed: false
      };
      this.availableGoals.push(newGoal);
      this.newGoalDescription = '';
    }
  }
}
