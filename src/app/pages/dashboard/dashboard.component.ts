import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { faAward, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { GoalsService } from 'src/app/services/goals.service';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { take } from 'rxjs/operators';
import { interval } from 'rxjs';
import { ProfileService } from 'src/app/services/profile.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  progressSummary = 'Track your progress and reach your fitness goals!';
  averageTimeSpent: string;
  mostUsedWorkout: string;
  currentTipIndex = 0;


  faAward = faAward;
  faLightbulb = faLightbulb;

  recentAchievements = [];

  personalizedTips = [
    { description: 'Stay hydrated during workouts' },
    { description: 'Try adding yoga to improve flexibility' },
    { description: 'Incorporate strength training to build muscle and boost metabolism' },
    { description: 'Include a mix of cardio and resistance training for optimal fitness' },
    { description: 'Gradually increase workout intensity to avoid plateaus' },
    { description: 'Monitor your heart rate to ensure you are in the target zone' },
    { description: 'Set realistic fitness goals and track your progress' },
    { description: 'Fuel your body with a well-balanced diet, rich in protein, healthy fats, and complex carbs' },
    { description: 'Get sufficient sleep to support recovery and overall wellbeing' },
    { description: 'Incorporate regular stretching to reduce the risk of injury' },
    { description: 'Find a workout buddy to stay motivated and accountable' },
    { description: 'Listen to your body and adjust your routine as needed' },
    { description: 'Try different forms of exercise to keep things interesting and prevent boredom' },
    { description: 'Practice proper form to maximize results and minimize the risk of injury' },
    { description: 'Take rest days to allow your body time to recover and rebuild' },
    { description: 'Consider seeking guidance from a personal trainer or fitness professional' },
    { description: 'Track your food intake to ensure you are consuming enough nutrients' },
    { description: 'Stay consistent with your workouts to see long-term results' },
    { description: 'Celebrate your achievements and reward yourself for reaching milestones' },
    { description: 'Stay patient, as progress may not always be linear' },
  ];


  goals = [];
  progressValue: number;
  circumference = 2 * Math.PI * 120;
  strokeDashoffset: number;

  curatedWorkout1: any = {uid: 'WvedR8vbPf4iJ68sWoXC'};
  curatedWorkout2: any = {uid: 'cHlnUlE5kzNgvx2CCMrq'};
  curatedWorkout3: any = {uid: 'xwTw3e7EN5cKqETDxVFR'};
  curatedWorkout4: any = {uid: '9twmoZDkdYgg3OEcKDPA'};
  curatedWorkout5: any = {uid: '4G8mF9PLMxeSIsZowp9x'};


  constructor(
    private router: Router,
    private title: Title,
    private fb: FormBuilder,
    public authService: AuthService,
    private toastr: ToastrService,
    public currentUserService: CurrentUserService,
    private goalsService: GoalsService,
    private workoutsService: WorkoutsService,
    private firestore: AngularFirestore,
    private profileService: ProfileService
  ) {}

  getWorkoutByDocId(docId: string) {
    return this.firestore.collection('workouts')
    .doc(docId)
    .valueChanges();
  }

  ngOnInit(): void {
    console.log(this.currentUserService.user);
    this.title.setTitle('Dashboard | FitHub');
    if (this.currentUserService.user.profile.profileHandle == '') {
      this.router.navigate(['/create-profile']);
    }

    const subscription = this.workoutsService.getCompletedWorkouts().pipe(take(1)).subscribe((completedWorkouts) => {
      this.calculateAverageTimeSpent(completedWorkouts);
      this.findMostUsedWorkout(completedWorkouts);
      subscription.unsubscribe();
    });

    interval(8000).subscribe(() => {
      this.currentTipIndex = (this.currentTipIndex + 1) % this.personalizedTips.length;
    });

    const workoutId1 = 'WvedR8vbPf4iJ68sWoXC';
    const workoutId2 = 'cHlnUlE5kzNgvx2CCMrq';
    const workoutId3 = 'xwTw3e7EN5cKqETDxVFR';
    const workoutId4 = '9twmoZDkdYgg3OEcKDPA';
    const workoutId5 = '4G8mF9PLMxeSIsZowp9x';

    this.workoutsService.getCuratedWorkoutById(workoutId1).then(workout => {
      console.log(workout.data());
      this.curatedWorkout1 = workout.data();
      this.curatedWorkout1.uid = workoutId1;
    });

    this.workoutsService.getCuratedWorkoutById(workoutId2).then(workout => {
      this.curatedWorkout2 = workout.data();
      this.curatedWorkout2.uid = workoutId2;
    });

    this.workoutsService.getCuratedWorkoutById(workoutId3).then(workout => {
      this.curatedWorkout3 = workout.data();
      this.curatedWorkout3.uid = workoutId3;
    });

    this.workoutsService.getCuratedWorkoutById(workoutId4).then(workout => {
      this.curatedWorkout4 = workout.data();
      this.curatedWorkout4.uid = workoutId4;
    });

    this.workoutsService.getCuratedWorkoutById(workoutId5).then(workout => {
      this.curatedWorkout5 = workout.data();
      this.curatedWorkout5.uid = workoutId5;
    });

    const username = this.currentUserService.user.profile.profileHandle;
    this.profileService.getProfile(username).valueChanges().subscribe(profile => {
    this.recentAchievements = profile.achievements || [];
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
    });
    this.updateProgress();
  }

  updateProgress(): void {
    const completedGoals = this.goals.filter((goal) => goal.completed).length;
    this.progressValue = (completedGoals / this.goals.length) * 100;
    this.strokeDashoffset = this.calculateStrokeDashoffset(this.progressValue);
  }

  calculateStrokeDashoffset(progressValue: number): number {
    return (1 - progressValue / 100) * this.circumference;
  }

  goToCuratedWorkout(workoutId: string): void {
    this.router.navigate(['/workout', 'curated', workoutId]);
  }
}
