import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { PersistenceService } from './persistence.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private persistenceService: PersistenceService,
    private auth: AngularFireAuth) { }

  getAuthUser(): Observable<any> {
    const user = this.persistenceService.retrieve('authUser');
    if (!user) {
      return this.auth.user.pipe(authUser => {
        if (authUser) {
          this.persistenceService.save('authUser', authUser);
        }

        return authUser;
      });
    }

    return of(user);
  }
}
