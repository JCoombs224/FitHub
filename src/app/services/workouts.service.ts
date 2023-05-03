import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { CurrentUserService } from './current-user.service';
import { debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';

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
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).update({
      equipmentGroups: firebase.firestore.FieldValue.arrayUnion({
        name: group.name,
        equipment: group.equipment
      })
    });
  }

  updateEquipmentGroup(group) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('equipmentGroups').doc(group.uid).update({
      name: group.name,
      equipment: group.equipment
    });
  }

  deleteEquipmentGroup(group) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).update({
      equipmentGroups: firebase.firestore.FieldValue.arrayRemove({
        name: group.name,
        equipment: group.equipment
      })
    });
  }

  getExercises(group, filters?): AngularFirestoreCollection {
    if (!filters || filters[0] == '*') {
      return this.afs.collection('exercises', ref => ref.where('primaryMuscles', 'array-contains', group));
    }
    else {
      filters.push('body only');
      return this.afs.collection('exercises', ref => ref.where('primaryMuscles', 'array-contains', group).where('equipment', 'in', filters));
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
      description: workout.description,
      equipment: workout.equipment.split(','),
      groups: workout.groups
    });
  }

  // Update an existing workout in the firestore database under the current user's profile workouts collection
  updateWorkout(data) {
    const equipment = data.workout.equipment;
    if(typeof equipment == 'string') {
      data.workout.equipment = equipment.split(',');
    }
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('workouts').doc(data.uid).update({
      name: data.workout.name,
      description: data.workout.description,
      equipment: equipment,
      groups: data.workout.groups
    });
  }

  deleteWorkout(uid) {
    return this.afs.collection('profiles').doc(this.currentUser.user.profile.profileHandle).collection('workouts').doc(uid).delete();
  }

  // Get a specific workout for the current user
  getWorkout(uid, profile = this.currentUser.user.profile.profileHandle) {
    console.log(profile, uid);
    return this.afs.collection('profiles')
      .doc(profile)
      .collection('workouts')
      .doc(uid)
      .valueChanges()
      .pipe(debounceTime(250)); // Debounce time to prevent multiple calls to the database, which fixed an issue where the workout would load multiple times
  }
}
