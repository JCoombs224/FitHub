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
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { CreateWorkoutComponent } from './pages/create-workout/create-workout.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'create-profile', component: CreateProfileComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'social-feed', component: SocialFeedComponent, canActivate: [AuthGuard]},
  { path: 'my-workouts', component: MyWorkoutsComponent, canActivate: [AuthGuard]},
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthGuard]},
  { path: 'my-workouts/create', component: CreateWorkoutComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'disabled', onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
