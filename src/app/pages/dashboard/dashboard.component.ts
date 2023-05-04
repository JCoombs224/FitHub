import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { faAward, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { GoalsService } from 'src/app/services/goals.service';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { MyProgressComponent } from 'src/app/dashboard-sections/my-progress/my-progress.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  progressSummary = 'Track your progress and reach your fitness goals!';

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

  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: string[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartData: ChartDataset[] = [
    {
      data: [],
      label: 'Workout History',
      backgroundColor: 'rgba(0, 150, 0, 1)',
      borderColor: 'rgba(0, 150, 0, 1)',
      borderWidth: 1,
    },
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

    // Initialize the chart with the 'week' time range
    this.changeTimeRange('week');
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

  // Replace data with actual input data from the user.
  allWorkoutData = [
    { date: '2023-02-01', value: 10 },
    { date: '2023-02-02', value: 12 },
    { date: '2023-02-03', value: 15 },
    { date: '2023-02-04', value: 17 },
    { date: '2023-02-05', value: 22 },
    { date: '2023-02-06', value: 20 },
    { date: '2023-02-07', value: 25 },
    { date: '2023-02-08', value: 30 },
    { date: '2023-02-09', value: 28 },
    { date: '2023-02-12', value: 10 },
    { date: '2023-02-13', value: 12 },
    { date: '2023-02-14', value: 15 },
    { date: '2023-02-16', value: 17 },
    { date: '2023-02-17', value: 22 },
    { date: '2023-02-20', value: 14 },
    { date: '2023-02-21', value: 25 },
    { date: '2023-02-22', value: 20 },
    { date: '2023-02-23', value: 10 },

    { date: '2023-03-01', value: 10 },
    { date: '2023-03-01', value: 10 },
    { date: '2023-03-02', value: 12 },
    { date: '2023-03-03', value: 15 },
    { date: '2023-03-04', value: 17 },
    { date: '2023-03-05', value: 22 },
    { date: '2023-03-06', value: 20 },
    { date: '2023-03-07', value: 25 },
    { date: '2023-03-08', value: 30 },

    { date: '2023-04-01', value: 10 },
    { date: '2023-04-02', value: 12 },
    { date: '2023-04-03', value: 15 },
    { date: '2023-04-04', value: 17 },
    { date: '2023-04-05', value: 22 },
    { date: '2023-04-06', value: 20 },
    { date: '2023-04-07', value: 25 },
    { date: '2023-04-08', value: 30 },
    { date: '2023-04-09', value: 28 },
    { date: '2023-04-12', value: 10 },
    { date: '2023-04-13', value: 12 },
    { date: '2023-04-14', value: 15 },
    { date: '2023-04-16', value: 17 },
    { date: '2023-04-17', value: 10 },
    { date: '2023-04-18', value: 22 },
    { date: '2023-04-19', value: 18 },
    { date: '2023-04-20', value: 14 },
    { date: '2023-04-21', value: 25 },
    { date: '2023-04-22', value: 20 },
    { date: '2023-04-23', value: 10 },

    { date: '2023-06-01', value: 10 },
    { date: '2023-06-01', value: 10 },
    { date: '2023-06-02', value: 12 },
    { date: '2023-06-03', value: 15 },
    { date: '2023-06-04', value: 17 },
    { date: '2023-06-05', value: 22 },
    { date: '2023-06-06', value: 20 },
    { date: '2023-06-07', value: 25 },
    { date: '2023-06-08', value: 30 },

    { date: '2023-08-01', value: 10 },
    { date: '2023-08-01', value: 10 },
    { date: '2023-08-02', value: 12 },
    { date: '2023-08-03', value: 15 },
    { date: '2023-08-04', value: 17 },
    { date: '2023-08-05', value: 22 },
    { date: '2023-08-06', value: 20 },
    { date: '2023-08-07', value: 25 },
    { date: '2023-08-08', value: 30 },
    { date: '2023-08-09', value: 20 },
    { date: '2023-08-10', value: 25 },
    { date: '2023-08-11', value: 30 },

    { date: '2023-10-03', value: 15 },
    { date: '2023-10-04', value: 17 },
    { date: '2023-10-05', value: 22 },
  ];

  // Sets the default time range
  selectedTimeRange: string = 'week';

  changeTimeRange(range: string) {
    this.selectedTimeRange = range;
    let startDate: Date;
    const currentDate = new Date();

    switch (range) {
      case 'week':
        startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        break;
      case 'year':
        startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
        break;
      default:
        return;
    }

    const filteredData = this.allWorkoutData.filter(workout => new Date(workout.date) >= startDate);
    const groupedData = this.groupDataByRange(filteredData, range);
    this.updateChartData(groupedData);
  }

  groupDataByRange(data: any[], range: string) {
    const groupedData: { [key: string]: number } = {};

    // Generate all labels based on the range
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let formatLabel: (date: Date) => string;

    switch (range) {
      case 'week':
        const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
        const sunday = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate = sunday;
        endDate = new Date(sunday.getTime() + 7 * 24 * 60 * 60 * 1000);
        formatLabel = date => date.toISOString().slice(0, 10); // day-by-day
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start at the first day of the current month
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // Until the first day of the next month
        formatLabel = date => date.toISOString().slice(0, 10); // day-by-day
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1); // Start at January 1st of the current year
        endDate = new Date(now.getFullYear() + 1, 0, 1); // Until January 1st of the next year
        formatLabel = date => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`; // month-by-month
        break;
      default:
        return;
    }

    // Initialize groupedData with all the labels and set values to 0
    for (let d = new Date(startDate); d < endDate; ) {
      const label = formatLabel(d);
      groupedData[label] = 0;

      switch (range) {
        case 'week':
          d.setDate(d.getDate() + 1); // Increment by 1 day
          break;
        case 'month':
          d.setDate(d.getDate() + 1); // Increment by 1 day
          break;
        case 'year':
          d.setMonth(d.getMonth() + 1); // Increment by 1 day
          break;
      }
    }

    // Just a placeholder. Fill the groupedData with actual values from the input data.
    data.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const groupKey = formatLabel(workoutDate);

      if (groupKey in groupedData) {
        groupedData[groupKey] += workout.value;
      }
    });

    return Object.entries(groupedData).map(([key, value]) => ({ date: key, value }));
  }

  updateChartData(data: any[]) {
    this.barChartLabels = data.map(workout => workout.date);
    this.barChartData = [
      {
        data: data.map(workout => workout.value),
        label: 'Workout History',
        backgroundColor: 'rgba(0, 150, 0, 1)',
        borderColor: 'rgba(0, 150, 0, 1)',
        borderWidth: 1,
      },
    ];
  }
}
