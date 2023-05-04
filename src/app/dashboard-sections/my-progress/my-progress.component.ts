import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { GoalsService } from 'src/app/services/goals.service';
import { WorkoutsService } from 'src/app/services/workouts.service';

@Component({
  selector: 'app-my-progress',
  templateUrl: './my-progress.component.html',
  styleUrls: ['./my-progress.component.css']
})
export class MyProgressComponent {
  progressSummary = 'Track your progress and reach your fitness goals!';

  goals: any[] = [];
  progressValue: number;
  circumference = 2 * Math.PI * 82;
  strokeDashoffset: number;

  constructor(
    private router: Router,
    private title: Title,
    private fb: FormBuilder,
    public authService: AuthService,
    private toastr: ToastrService,
    public currentUserService: CurrentUserService,
    private goalsService: GoalsService,
    private workoutsService: WorkoutsService
  ) {}

  ngOnInit(): void {
    console.log(this.currentUserService.user);
    this.title.setTitle('Dashboard | FitHub');
    if (this.currentUserService.user.profile.profileHandle == '') {
      this.router.navigate(['/create-profile']);
    }
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
