import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { WorkoutsService } from 'src/app/services/workouts.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-workout-graph',
  templateUrl: './workout-graph.component.html',
  styleUrls: ['./workout-graph.component.css']
})
export class WorkoutGraphComponent {

  constructor(
    private router: Router,
    private title: Title,
    private fb: FormBuilder,
    public authService: AuthService,
    private toastr: ToastrService,
    public currentUserService: CurrentUserService,
    private workoutsService: WorkoutsService,
    private profileService: ProfileService
    ) {}

  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: string[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartData: ChartDataset[] = [
    {
      data: [],
      label: 'Completed Workout Time (minutes)',
      backgroundColor: 'rgba(0, 150, 0, 1)',
      borderColor: 'rgba(0, 150, 0, 1)',
      borderWidth: 1,
    },
    // {
    //   data: [],
    //   label: 'Exercises Completed',
    //   backgroundColor: 'rgba(75, 192, 192, 1)',
    //   borderColor: 'rgba(75, 192, 192, 1)',
    //   borderWidth: 1,
    // },
  ];

  public allWorkoutData: any[] = [];

  ngOnInit(): void {
    console.log(this.currentUserService.user);
    this.title.setTitle('Dashboard | FitHub');
    if (this.currentUserService.user.profile.profileHandle == '') {
      this.router.navigate(['/create-profile']);
    }

    // Fetch the user's profile and get the completedWorkouts
    this.profileService.getProfileByUid(this.currentUserService.user.account.uid).subscribe((profile: any) => {
      console.log('Profile:', profile); // Debug: log the profile
      console.log('Completed Workouts:', profile.completedWorkouts); // Debug: log the completedWorkouts
      const completedWorkouts = profile.completedWorkouts;

      this.allWorkoutData = profile.completedWorkouts.map(workout => {
        const dateInSeconds = workout.dateCompleted.seconds;
        const date = new Date(dateInSeconds * 1000);
        const percentCompleted = workout.percentCompleted;
        const timeToComplete = workout.timeToComplete;
        const timeSpent = this.calculateTimeSpent(timeToComplete, percentCompleted);

        return {
          date: date,
          timeToComplete: timeSpent,
          // exercises: 1
        };
      });

      console.log('All Workout Data:', this.allWorkoutData); // Debug: log the allWorkoutData

      // Update the chart based on the new data
      const currentDate = new Date();
      const startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const filteredData = this.allWorkoutData.filter(workout => new Date(workout.date) >= startDate);
      console.log('Filtered Data:', filteredData); // Debug: log the filteredData

      const groupedData = this.groupDataByRange(filteredData, this.selectedTimeRange);
      console.log('Grouped Data:', groupedData); // Debug: log the groupedData
      this.updateChartData(groupedData);
    });

    this.updateTimeline();
  }

  calculateTimeSpent(timeToComplete: string, percentCompleted: number): number {
    const [minutes, seconds] = timeToComplete.split(':').map(Number);
    const totalTime = minutes * 60 + seconds; // Convert the time to seconds
    return totalTime * (percentCompleted / 100); // Return the time spent in seconds
  }

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
    console.log('Filtered Data:', filteredData); // Debug: log the filteredData

    const groupedData = this.groupDataByRange(filteredData, range);
    console.log('Grouped Data:', groupedData); // Debug: log the groupedData

    this.updateChartData(groupedData);
    this.updateTimeline();
  }

  groupDataByRange(data: any[], range: string) {
    const groupedData: { [key: string]: { timeSpent: number } } = {};

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
      groupedData[label] = { timeSpent: 0 };

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

    data.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const groupKey = formatLabel(workoutDate);

      if (groupKey in groupedData) {
        groupedData[groupKey].timeSpent += workout.timeToComplete;
        // groupedData[groupKey].exercises += workout.exercises;
      }
    });

    return Object.entries(groupedData).map(([key, value]) => ({ date: key, ...value }));
  }

  updateChartData(data: any[]) {
    this.barChartLabels = data.map(workout => workout.date);
    this.barChartData = [
      {
        data: data.map(workout => workout.timeSpent),
        label: 'Completed Workout Time (minutes)',
        backgroundColor: 'rgba(0, 150, 0, 1)',
        borderColor: 'rgba(0, 150, 0, 1)',
        borderWidth: 1,
      },
      // {
      //   data: data.map(workout => workout.exercises),
      //   label: 'Exercises Completed',
      //   backgroundColor: 'rgba(36, 36, 36, 1)',
      //   borderColor: 'rgba(36, 36, 36, 1)',
      //   borderWidth: 1,
      // },
    ];

    console.log('Updated Bar Chart Data:', this.barChartData);
  }

  updateTimeline() {
    // Reset all days to inactive
    const days = document.querySelectorAll('.timeline-day');
    days.forEach(day => day.classList.remove('active'));

    // Set active days based on completed workouts
    this.allWorkoutData.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const day = workoutDate.toLocaleString('en-US', { weekday: 'long' });
      const dayElement = document.querySelector(`#timeline-${day.toLowerCase()}`);
      if (dayElement) {
        dayElement.classList.add('active');
      }
    });
  }
}


