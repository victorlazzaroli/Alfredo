import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebaseFirestore from 'firebase/firestore';
import { AuthProvider } from 'ngx-auth-firebaseui';
import { Observable, Subscription } from 'rxjs';
import { Dipendente, UserInfo } from './core/interfaces/UserInfo';
import { Autorizzazioni } from './core/enum/autorizzazioni';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  user: Observable<any>;

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    this.user = this.authService.getAuthUser();
    this.user.subscribe(authUser => {
      if (authUser) {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/login'])
      }
    });
  }
}
