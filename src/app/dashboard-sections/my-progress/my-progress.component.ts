import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { Goal, GoalsService } from 'src/app/services/goals.service';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-my-progress',
  templateUrl: './my-progress.component.html',
  styleUrls: ['./my-progress.component.css']
})
export class MyProgressComponent {
  progressSummary = 'Track your progress and reach your fitness goals!';
  progressValue: number;
  circumference = 2 * Math.PI * 120;
  strokeDashoffset: number;

  constructor(
    private router: Router,
    private title: Title,
    private fb: FormBuilder,
    public authService: AuthService,
    private toastr: ToastrService,
    public currentUserService: CurrentUserService,
    private goalsService: GoalsService,
    private workoutsService: WorkoutsService,
    private firestore: AngularFirestore
  ) {}

  ngOnInit(): void {
    console.log(this.currentUserService.user);
    this.title.setTitle('Dashboard | FitHub');
    if (this.currentUserService.user.profile.profileHandle == '') {
      this.router.navigate(['/create-profile']);
    }

    this.currentUserService.account.subscribe((user) => {
      this.selectedGoals = user.profile.goals || [];
    });

    this.goalsService.getAvailableGoals().subscribe((availableGoals) => {
      this.availableGoals = availableGoals;
    });

    this.loadSelectedGoals();
  }

  numberOfSelectedGoals(): number {
    return this.availableGoals.filter(goal => goal.selected).length;
  }

  // Add availableGoals array and ViewChild for the goals modal
  availableGoals: any[] = [];
  selectedGoals: any[] = [];
  completedGoals: any[] = [];

  toggleGoalSelection(index: number) {
    const goal = this.availableGoals[index];
    if (goal.selected) {
      this.selectedGoals.push(goal);
      goal.selected = false;
    } else {
      const selectedIndex = this.selectedGoals.findIndex(selectedGoal => selectedGoal.id === goal.id);
      if (selectedIndex > -1) {
        this.selectedGoals.splice(selectedIndex, 1);
      }
    }
  }

  @ViewChild('goalsModal', { static: false }) goalsModal: ElementRef;

  openGoalsModal(): void {
    this.goalsModal.nativeElement.classList.add("show");
    this.goalsModal.nativeElement.style.display = "block";
    document.body.classList.add("modal-open");

    this.loadSelectedGoals();
    this.loadCompletedGoals();
  }

  loadSelectedGoals() {
    this.currentUserService.account.subscribe(user => {
      this.selectedGoals = []; // clear the selectedGoals array
      if (user.profile.goals) {
        this.selectedGoals = user.profile.goals;

        // Update the 'selected' property of available goals
        this.availableGoals.forEach(goal => {
          goal.selected = this.selectedGoals.some(selectedGoal => selectedGoal.id === goal.id);
        });
      }
    });
  }

  loadCompletedGoals() {
    this.currentUserService.account.subscribe((user) => {
      if (user.profile.completedGoals) {
        this.completedGoals = user.profile.completedGoals;
      }
    });
  }

  closeGoalsModal(): void {
    this.goalsModal.nativeElement.classList.remove('show');
    this.goalsModal.nativeElement.style.display = 'none';
    document.body.classList.remove('modal-open');
  }

  saveGoals() {
    // Save the selected goals and completed goals to the user's profile
    this.currentUserService.updateProfile({
      goals: this.selectedGoals,
      completedGoals: this.completedGoals,
    });

    // Close the modal
    this.goalsModal.nativeElement.classList.remove("show");
    this.goalsModal.nativeElement.style.display = "none";
    document.body.classList.remove("modal-open");
  }

  completeGoal(goalIndex: number, completed: boolean): void {
    this.goalsService.completeGoal(goalIndex, completed).then(() => {
      const goal = this.selectedGoals[goalIndex];
      goal.completed = completed;

      if (completed) {
        // Remove the goal from selectedGoals and add it to completedGoals
        this.selectedGoals.splice(goalIndex, 1);
        this.completedGoals.push(goal);
      } else {
        // Remove the goal from completedGoals and add it back to selectedGoals
        const completedGoalIndex = this.completedGoals.findIndex(
          (completedGoal) => completedGoal.id === goal.id
        );
        this.completedGoals.splice(completedGoalIndex, 1);
        this.selectedGoals.push(goal);
      }

      this.updateProgress();
    });
  }

  updateProgress(): void {
    const completedGoals = this.selectedGoals.filter((goal) => goal.completed).length;
    this.progressValue = (completedGoals / this.selectedGoals.length) * 100;
    this.strokeDashoffset = this.calculateStrokeDashoffset(this.progressValue, 120);
  }

  calculateStrokeDashoffset(progressValue: number, circleRadius: number): number {
    return (1 - progressValue / 100) * (2 * Math.PI * circleRadius);
  }
}
