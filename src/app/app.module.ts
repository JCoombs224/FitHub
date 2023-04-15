import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home/home.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideFunctions,getFunctions } from '@angular/fire/functions';
import { provideMessaging,getMessaging } from '@angular/fire/messaging';
import { provideStorage,getStorage } from '@angular/fire/storage';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignUpComponent } from './signup/sign-up.component';
import { AuthService } from './services/auth.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrModule } from 'ngx-toastr';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreateProfileComponent } from './signup/create-profile/create-profile.component';
import { SocialFeedComponent } from './pages/social-feed/social-feed.component';
import { MyWorkoutsComponent } from './pages/my-workouts/my-workouts.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CreateWorkoutComponent } from './pages/create-workout/create-workout.component';
import { CreatePostModalComponent } from './modals/create-post-modal/create-post-modal.component';
import { RouteReuseStrategy } from '@angular/router';
import { CustomRouteReuseStrategy } from './providers/route-reuse-strategy';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule,BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CreatePostComponent } from './pages/create-post/create-post.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { AddExerciseModalComponent } from './modals/add-exercise-modal/add-exercise-modal.component';
import { NgChartsModule } from 'ng2-charts';
import { EquipmentModalComponent } from './modals/equipment-modal/equipment-modal.component';
import { ConfirmDeleteModalComponent } from './modals/confirm-delete-modal/confirm-delete-modal.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ProgressComponent } from './progress/progress.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    SignUpComponent,
    DashboardComponent,
    CreateProfileComponent,
    SocialFeedComponent,
    MyWorkoutsComponent,
    ProfileComponent,
    CreateWorkoutComponent,
    CreatePostModalComponent,
    CreatePostComponent,
    EditProfileComponent,
    AddExerciseModalComponent,
    EquipmentModalComponent,
    ConfirmDeleteModalComponent,
    ProgressComponent,

  ],

  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    provideStorage(() => getStorage()),
    FontAwesomeModule,
    BrowserAnimationsModule, // required animations module
    BsDatepickerModule,
    BsDropdownModule,
    ModalModule,
    CollapseModule,
    AccordionModule.forRoot(),
    ToastrModule.forRoot(
      {
        positionClass: 'toast-bottom-right',
        closeButton: true,
        preventDuplicates: true,
        resetTimeoutOnDuplicate: true,
      }
    ),
    InfiniteScrollModule,
    FormsModule,
    NgChartsModule,
    ImageCropperModule,
  ],
  providers: [AuthService, BsModalService, BsDatepickerConfig, BsDropdownConfig, { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
