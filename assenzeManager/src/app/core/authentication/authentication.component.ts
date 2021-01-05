import {Component, OnInit} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {AuthProvider} from 'ngx-auth-firebaseui';
import {Observable} from 'rxjs';
import {UserInfo} from '../interfaces/UserInfo';
import firebase from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {

  private dipendentiCollection: AngularFirestoreCollection<UserInfo>;
  dipendenti: Observable<UserInfo[]>;

  providers = AuthProvider;
  authForm: FormGroup;

  constructor(
    private firestore: AngularFirestore,
    private formBuilder: FormBuilder,
    public afAuth: AngularFireAuth,
    private router: Router) {
    this.authForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

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

  login() {
    this.afAuth.signInWithPopup(new firebase.auth.EmailAuthProvider());
  }

  logout() {
    this.afAuth.signOut();
  }
}
