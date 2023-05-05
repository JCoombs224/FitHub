import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { faAward, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { GoalsService } from 'src/app/services/goals.service';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  progressSummary = 'Track your progress and reach your fitness goals!';
  averageTimeSpent: string;
  mostUsedWorkout: string;

  faAward = faAward;
  faLightbulb = faLightbulb;

  recentAchievements = [
    { description: 'Completed a 30-day workout challenge' },
    { description: 'Reached a new personal best in running' },
  ];

  personalizedTips = [
    { description: 'Stay hydrated during workouts' },
    { description: 'Try adding yoga to improve flexibility' },
  ];

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

    this.workoutsService.getCompletedWorkouts().pipe(take(1)).subscribe((completedWorkouts) => {
      this.calculateAverageTimeSpent(completedWorkouts);
      this.findMostUsedWorkout(completedWorkouts);
    });
  }

  calculateAverageTimeSpent(completedWorkouts: any[]): void {
    const totalTime = completedWorkouts.reduce((total, workout) => {
      const timeParts = workout.timeToComplete.split(':');
      const timeInMinutes = timeParts.length === 3
        ? +timeParts[0] * 60 + +timeParts[1] + +timeParts[2] / 60
        : +timeParts[0] + +timeParts[1] / 60;
      return total + timeInMinutes;
    }, 0);

    const averageTime = completedWorkouts.length ? totalTime / completedWorkouts.length : 0;
    const averageMinutes = Math.floor(averageTime);
    const averageSeconds = Math.round((averageTime - averageMinutes) * 60);
    this.averageTimeSpent = `${averageMinutes.toString().padStart(2, '0')}:${averageSeconds.toString().padStart(2, '0')}`;
  }

  findMostUsedWorkout(completedWorkouts: any[]): void {
    const workoutCounts = completedWorkouts.reduce((countMap, workout) => {
      countMap[workout.workoutName] = (countMap[workout.workoutName] || 0) + 1;
      return countMap;
    }, {});

    this.mostUsedWorkout = Object.keys(workoutCounts).reduce((a, b) => workoutCounts[a] > workoutCounts[b] ? a : b, '');
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
