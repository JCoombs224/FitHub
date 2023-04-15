import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  progressSummary = 'Track your progress and reach your fitness goals!';

  recentAchievements = [
    { description: 'Completed a 30-day workout challenge' },
    { description: 'Reached a new personal best in running' },
  ];

  personalizedTips = [
    { description: 'Stay hydrated during workouts' },
    { description: 'Try adding yoga to improve flexibility' },
  ];

  favoriteWorkouts = [
    { id: 1, name: 'HIIT Workout' },
    { id: 2, name: 'Strength Training' },
    { id: 3, name: 'Yoga' },
    { id: 4, name: 'Calisthenics' },
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

  progressValue = 75;
  strokeDashoffset: number;
  circumference: number;

  calculateStrokeDashoffset(progressValue: number, circleRadius: number): number {
    return (1 - progressValue / 100) * (2 * Math.PI * circleRadius);
  }

  constructor(
    private router: Router,
    private title: Title,
    private fb: FormBuilder,
    public authService: AuthService,
    private toastr: ToastrService,
    public currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    console.log(this.currentUserService.user);
    this.title.setTitle('Dashboard | FitHub');
    if (this.currentUserService.user.profile.profileHandle == '') {
      this.router.navigate(['/create-profile']);
    }
    this.circumference = 2 * Math.PI * 82;
    this.strokeDashoffset = this.calculateStrokeDashoffset(this.progressValue, 82);

    // Initialize the chart with the 'week' time range
    this.changeTimeRange('week');
  }

  // Replace data with actual input data from the user.
  allWorkoutData = [
    { date: '2023-04-01', value: 10 },
    { date: '2023-04-02', value: 12 },
    { date: '2023-04-03', value: 15 },
    { date: '2023-04-04', value: 17 },
    { date: '2023-04-05', value: 22 },
    { date: '2023-04-06', value: 20 },
    { date: '2023-04-07', value: 25 },
    { date: '2023-04-08', value: 30 },
    { date: '2023-04-09', value: 28 },
  ];

  changeTimeRange(range: string) {
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
