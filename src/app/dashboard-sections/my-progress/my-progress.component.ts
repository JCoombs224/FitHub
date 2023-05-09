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
import { combineLatest } from 'rxjs';


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

  // Add availableGoals array and ViewChild for the goals modal
  availableGoals: any[] = [];
  selectedGoals: any[] = [];
  completedGoals: any[] = [];


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
    this.selectedGoals = this.currentUserService.user.profile.goals;

    const subscription = this.goalsService.getAvailableGoals().subscribe((availableGoals) => {
      availableGoals.forEach((goal) => {
        const selectedGoal = this.selectedGoals.find(selectedGoal => selectedGoal.description == goal.description);
        if(!selectedGoal) {
          this.availableGoals.push({...goal});
        }
      });
      subscription.unsubscribe();
    });

    console.log("selected goals", this.selectedGoals);

    this.loadSelectedGoals();
    this.updateProgress();
  }

  numberOfSelectedGoals(): number {
    return this.availableGoals.filter(goal => goal.selected).length;
  }

  toggleGoalSelection(index: number) {
    const goal = this.availableGoals[index];
    if (goal.selected) {
      this.selectedGoals.push({ ...goal, completed: false }); // Add the goal to the selectedGoals array with completed set to false
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
    this.selectedGoals = this.currentUserService.user.profile.goals;
  }

  loadCompletedGoals() {
    const subscription = this.currentUserService.account.subscribe((user) => {
      if (user.profile.completedGoals) {
        this.completedGoals = user.profile.completedGoals;

        // Update the progress
        this.updateProgress();
        subscription.unsubscribe();
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
    const goal = this.selectedGoals[goalIndex];
    goal.completed = completed;

    if (completed) {
      // Remove the goal from selectedGoals and add it to completedGoals
      this.selectedGoals.splice(goalIndex, 1);
      this.completedGoals.push(goal);
    } else {
      // Remove the goal from completedGoals and add it back to selectedGoals
      const completedIndex = this.completedGoals.findIndex(completedGoal => completedGoal.id === goal.id);
      if (completedIndex > -1) {
        this.completedGoals.splice(completedIndex, 1);
        this.selectedGoals.push(goal);
      }
    }

    // Update the user's profile
    this.currentUserService.updateProfile({
      goals: this.selectedGoals,
      completedGoals: this.completedGoals,
    });

    // Update the progress
    this.updateProgress();
  }

  updateProgress(): void {
    const totalGoals = this.selectedGoals.length + this.completedGoals.length;
    if (totalGoals === 0) {
      this.progressValue = 0;
      this.strokeDashoffset = this.circumference;
    }

    else {
      const completedGoals = this.completedGoals.length;
      this.progressValue = (completedGoals / totalGoals) * 100;
      if (this.progressValue === Math.floor(this.progressValue)) {
        this.progressValue = parseInt(this.progressValue.toFixed(0));
      } else {
        this.progressValue = parseFloat(this.progressValue.toFixed(2));
      }
      this.strokeDashoffset = this.calculateStrokeDashoffset(this.progressValue);
    }
  }

  calculateStrokeDashoffset(progressValue: number): number {
    if (progressValue === 0) {
      return this.circumference;
    }
    return (1 - progressValue / 100) * this.circumference;
  }

}
