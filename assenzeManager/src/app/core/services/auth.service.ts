import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {PersistenceService} from './persistence.service';
import {Observable, of} from 'rxjs';
import firebase from 'firebase';
import User = firebase.User;
import UserCredential = firebase.auth.UserCredential;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private persistenceService: PersistenceService,
    private auth: AngularFireAuth) {
  }

  async login(email: string, password: string): Promise<UserCredential> {
    await this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

    return this.auth.signInWithEmailAndPassword(email, password);
  }

  logout(): Promise<void> {
    return this.auth.signOut();
  }

  getAuthUser(): Observable<firebase.User> {
    return this.auth.user;
  }
}
