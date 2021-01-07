import {Component, OnInit} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {AuthProvider} from 'ngx-auth-firebaseui';
import {Observable, of} from 'rxjs';
import {UserInfo} from '../interfaces/UserInfo';
import firebase from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {first, map, switchMap} from 'rxjs/operators';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {

  authForm: FormGroup;
  visibility = false;
  error: boolean;

  constructor(
    private firestore: AngularFirestore,
    private userService: UserService,
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private router: Router) {
    this.authForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.authService.getAuthUser()
      .pipe(
        switchMap(user => (user as firebase.User) ? this.userService.getUserProfile((user as firebase.User).uid) : of(null))
      )
      .subscribe( user => user ? this.router.navigate(['/assenze']) : null);
  }

  printError(event) {
    console.error(event);
  }

  login() {
    if (this.authForm.valid) {
      this.authService.login(this.authForm.controls.email.value, this.authForm.controls.password.value)
        .then(user => {
          this.userService.getUserProfile(user.user.uid).subscribe();
          this.error = false;
        })
        .catch(error => this.error = true);
    }
  }

  logout() {
    this.authService.logout().finally(() => console.log('Sign Out'));
  }
}
