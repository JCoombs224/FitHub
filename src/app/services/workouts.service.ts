import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { CurrentUserService } from './current-user.service';
import { debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkoutsService {

  constructor(private http: HttpClient,
              private currentUser: CurrentUserService,
              private afs: AngularFirestore) { }

  // Get equipment groups from firestore database
  getEquipmentGroups() : Observable<any> {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).valueChanges();
  }

  addEquipmentGroup(group) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('equipmentGroups').add({
      name: group.name,
      equipment: group.equipment
    });
  }

  updateEquipmentGroup(group) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('equipmentGroups').doc(group.uid).update({
      name: group.name,
      equipment: group.equipment
    });
  }

  deleteEquipmentGroup(group) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('equipmentGroups').doc(group.uid).delete();
  }

  getExercises(group, filters?): AngularFirestoreCollection {
    if (!filters) {
      return this.afs.collection('exercises', ref => ref.where('primaryMuscles', 'array-contains', group));
    }
  }

  // Get all workouts for the current user
  getWorkouts(profile = this.currentUser.user.profile.profileHandle) {
    return this.afs.collection('profiles').doc(profile).collection('workouts').valueChanges({ idField: 'uid' });
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
      equipment: data.workout.equipment.split(','),
      groups: data.workout.groups
    });
  }

  deleteWorkout(uid) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('workouts').doc(uid).delete();
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
