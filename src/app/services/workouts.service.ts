import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { CurrentUserService } from './current-user.service';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkoutsService {

  constructor(private http: HttpClient,
              private currentUser: CurrentUserService,
              private afs: AngularFirestore) { }

  getExercises(group, filters?): AngularFirestoreCollection {
    if(!filters) {
      return this.afs.collection('exercises', ref => ref.where('primaryMuscles', 'array-contains', group));
    }
  }

  // Save new workout to firestore database under the current user's profile workouts collection
  newWorkout(workout) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('workouts').add({
      name: workout.name,
      groups: workout.groups
    });
  }

  // Update an existing workout in the firestore database under the current user's profile workouts collection
  updateWorkout(data) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('workouts').doc(data.uid).update({
      name: data.workout.name,
      groups: data.workout.groups
    });
  }
  
  // Get all workouts for the current user
  getWorkouts(profile = this.currentUser.user.profile.profileHandle) {
    return this.afs.collection('profiles').doc(profile).collection('workouts').valueChanges({idField: 'uid'});
  }

  // Get a specific workout for the current user
  openWorkout(uid) {
    return this.afs.collection('profiles')
    .doc(this.currentUser.user.profile.profileHandle)
    .collection('workouts')
    .doc(uid)
    .valueChanges()
    .pipe(debounceTime(250)); // Debounce time to prevent multiple calls to the database, which fixed an issue where the workout would load multiple times
  }
}
