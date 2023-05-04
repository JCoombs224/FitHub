import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { WorkoutsService } from 'src/app/services/workouts.service';

@Component({
  selector: 'app-favorite-workouts',
  templateUrl: './favorite-workouts.component.html',
  styleUrls: ['./favorite-workouts.component.css']
})
export class FavoriteWorkoutsComponent implements OnInit {
  recentAchievements: any;

  constructor(
    private router: Router,
    private title: Title,
    private fb: FormBuilder,
    public authService: AuthService,
    private toastr: ToastrService,
    public currentUserService: CurrentUserService,
    private workoutsService: WorkoutsService
  ) {}

  favoriteWorkouts: { uid: string, name: string }[];

  ngOnInit(): void {
    this.title.setTitle('Favorite Workouts');

    this.workoutsService.getFavoriteWorkouts().subscribe((workouts) => {
      this.favoriteWorkouts = workouts.map((workout) => {
        return {
          uid: workout.uid,
          name: workout.name
        };
      });
    });
  }

  onFavoriteClicked(uid: string) {
    this.router.navigate(['/workout', uid]);
  }

  goToWorkout(workout) {
    this.workoutsService.getWorkoutByUid(workout.uid).subscribe(data => {
      this.router.navigate([`/workout/${workout.uid}`], {state: {data}});
    });
  }
}
