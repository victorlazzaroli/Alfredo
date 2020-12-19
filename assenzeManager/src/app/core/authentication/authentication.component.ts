import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthProvider } from 'ngx-auth-firebaseui';
import { Observable } from 'rxjs';
import { UserInfo } from '../interfaces/UserInfo';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {

  private dipendentiCollection: AngularFirestoreCollection<UserInfo>;
  dipendenti: Observable<UserInfo[]>;

  providers = AuthProvider;
  constructor(private firestore: AngularFirestore,
     private router: Router) { }

  ngOnInit(): void {
  }

  onSuccess(userData: any) {
    if (!userData) {
      return;
    }

    this.router.navigate(['/home']);

    // if (!userData.emailVerified) {
    //   this.dipendentiCollection = this.firestore.collection<UserInfo>('dipendente');
    //   const condition = this.dipendentiCollection.ref.where('email', '==', userData.email);

    //   condition.get()
    //   .then(element => {
    //     if (element.empty) {
    //       const userInfo: UserInfo = {
    //         uid: userData.uid,
    //         ruolo: null,
    //         name: userData.displayName,
    //         email: userData.email,
    //         autorizzazione: Autorizzazioni.DIPENDENTE
    //       };
    //       this.dipendentiCollection.add(userInfo);
    //     } else {
    //       console.log('Utente già presente a DB e email non verificata');
    //     }
    //   })
    //   .catch( err => console.error('Errore: ', err));
    // } else {
    //   this.router.navigate(['home']);
    // }
  }

  printError(event) {
    console.error(event);
  }

}
