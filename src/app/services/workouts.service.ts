import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class WorkoutsService {

  constructor(private http: HttpClient,
              private afs: AngularFirestore) { }

  getExercises(group, filters?): AngularFirestoreCollection {
    if(!filters) {
      return this.afs.collection('exercises', ref => ref.where('primaryMuscles', 'array-contains', group));
    }
  }
}
