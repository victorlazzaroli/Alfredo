import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import firebase from 'firebase';
import User = firebase.User;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user: User;


  constructor(private authService: AuthService,  private router: Router) { }

  ngOnInit(): void {
    this.authService.getAuthUser().subscribe( user => this.user = user);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logOut() {
    this.authService.logOut().subscribe(val => this.router.navigate(['/login']));
  }
}
