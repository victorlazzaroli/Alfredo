import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebaseFirestore from 'firebase/firestore';
import { AuthProvider } from 'ngx-auth-firebaseui';
import { Observable } from 'rxjs';
import { Dipendente, UserInfo } from './core/interfaces/UserInfo';
import { Autorizzazioni } from './core/enum/autorizzazioni';
import { element } from 'protractor';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'assenzeManager';
  providers = AuthProvider;
  private dipendentiCollection: AngularFirestoreCollection<UserInfo>;
  dipendenti: Observable<UserInfo[]>;

  constructor(private firestore: AngularFirestore, private router: Router) {
  }

  onSuccess(userData: any) {
    this.printUser(userData);
    if (!userData) {
      return;
    }

    if (!userData.emailVerified) {
      this.dipendentiCollection = this.firestore.collection<UserInfo>('dipendente');
      const condition = this.dipendentiCollection.ref.where('email', '==', userData.email);

      condition.get()
      .then(element => {
        if (element.empty) {
          const userInfo: UserInfo = {
            uid: userData.uid,
            ruolo: null,
            name: userData.displayName,
            email: userData.email,
            autorizzazione: Autorizzazioni.DIPENDENTE
          };
          this.dipendentiCollection.add(userInfo);
        } else {
          console.log('Utente già presente a DB e email non verificata');
        }
      })
      .catch( err => console.error('Errore: ', err));
    } else {
      this.router.navigate(['/home']);
    }
  }

  printError(event) {
    console.error(event);
  }

  printUser(event) {
    console.error(event);
  }
}
