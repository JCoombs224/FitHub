import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home/home.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './signup/sign-up.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './services/auth.guard';
import { CreateProfileComponent } from './signup/create-profile/create-profile.component';
import { SocialFeedComponent } from './pages/social-feed/social-feed.component';
import { MyWorkoutsComponent } from './pages/my-workouts/my-workouts.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CreateWorkoutComponent } from './pages/create-workout/create-workout.component';
import { CreatePostComponent } from './pages/create-post/create-post.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { ProgressComponent } from './progress/progress.component';
import { ViewWorkoutComponent } from './pages/view-workout/view-workout.component';
import { ActiveWorkoutComponent } from './pages/active-workout/active-workout.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'create-profile', component: CreateProfileComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'social-feed', component: SocialFeedComponent, canActivate: [AuthGuard]},
  { path: 'my-workouts', component: MyWorkoutsComponent, canActivate: [AuthGuard]},
  { path: 'profile/:name', component: ProfileComponent, canActivate: [AuthGuard]},
  { path: 'my-workouts/create', component: CreateWorkoutComponent, canActivate: [AuthGuard]}, // Route to create a new workout
  { path: 'edit-workout/:uid', component: CreateWorkoutComponent, canActivate: [AuthGuard]}, // Route to edit a workout
  { path: 'workout/:uid', component: ViewWorkoutComponent, canActivate: [AuthGuard]}, // Route to view a workout that is not currently in progress
  { path: 'active-workout/:uid', component: ActiveWorkoutComponent, canActivate: [AuthGuard]}, // Route for a workout that is currently in progress
  { path: 'profile/:name/create-post', component: CreatePostComponent, canActivate: [AuthGuard]},
  { path: 'profile/:name/edit-profile', component: EditProfileComponent, canActivate: [AuthGuard]},
  { path: 'progress', component: ProgressComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'disabled', onSameUrlNavigation: 'reload', paramsInheritanceStrategy: 'always' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
