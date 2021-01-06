import { Injectable } from '@angular/core';
import {AngularFirestore, DocumentSnapshot} from '@angular/fire/firestore';
import { UserInfo } from '../interfaces/UserInfo';
import {first, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {PersistenceService} from './persistence.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor( private firestore: AngularFirestore, private persistenceService: PersistenceService) { }

  getUserProfile(uid?: string): Observable<UserInfo> {
    let userProfile: UserInfo;
    userProfile = JSON.parse(this.persistenceService.retrieve('userProfile'));
    if (userProfile) {
      return of(userProfile);
    }
    if (!uid) {
      return of(undefined);
    }
    const dipendenteProfile = this.firestore.doc<UserInfo>(`dipendenti/${uid}`);
    return dipendenteProfile.get().pipe(map(user => {
      if (user?.exists) {
        this.persistenceService.save('userProfile', JSON.stringify(user.data()));
      }
      return user.data();
    }), first());
  }

  createProfile(userInfo: UserInfo): Observable<Promise<void>> {
    const dipendenteProfile = this.firestore.doc<UserInfo>(`dipendenti/${userInfo.uid}`);
    return of(dipendenteProfile.set(userInfo));
  }

  updateProfile(userInfo: Partial<UserInfo>): Observable<Promise<void>> {
    const dipendenteProfile = this.firestore.doc<UserInfo>(`dipendenti/${userInfo.uid}`);
    return of(dipendenteProfile.update(userInfo));
  }

  deleteProfile(uid: string): Observable<Promise<void>> {
    const dipendenteProfile = this.firestore.doc<UserInfo>(`dipendenti/${uid}`);
    return of(dipendenteProfile.delete());
  }
}
