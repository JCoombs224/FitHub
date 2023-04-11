import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  socialFeedPreview = 'Check out what your friends are doing in their workouts!';
  progressSummary = 'Track your progress and reach your fitness goals!';
  workoutHistoryPreview = 'View and analyze your past workouts!';
  featuresDescription = 'Discover new workouts, follow friends, and get personalized recommendations!';

  favoriteWorkouts = [
    { id: 1, name: 'HIIT Workout' },
    { id: 2, name: 'Strength Training' },
    { id: 3, name: 'Yoga' },
    { id: 4, name: 'Calisthenics' },
  ];

  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: NgChartsModule[] = ['Activity 1', 'Activity 2', 'Activity 3', 'Activity 4', 'Activity 5'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartData: ChartDataset[] = [
    {
    data: [45, 28, 48, 40, 19],
    label: 'Workout History',
    backgroundColor: 'rgba(0, 150, 0, 1)',
    borderColor: 'rgba(0, 150, 0, 1)',
    borderWidth: 1,
    }
  ];

  constructor(private router: Router,
              private title: Title,
              private fb: FormBuilder,
              public authService: AuthService,
              private toastr: ToastrService,
              public currentUserService: CurrentUserService) {}

  ngOnInit(): void {
    console.log(this.currentUserService.user);
    this.title.setTitle("Dashboard | FitHub");
    // make sure user has created their profile, if not take them to the create profile page
    if(this.currentUserService.user.profile.profileHandle == '') {
      this.router.navigate(["/create-profile"]);
    }
  }
}
