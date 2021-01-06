import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import firebase from 'firebase';
import User = firebase.User;
import {UserService} from '../services/user.service';
import {UserInfo} from '../interfaces/UserInfo';
import {RuoloEnum} from '../enum/ruoloEnum';
import {Autorizzazioni} from '../enum/autorizzazioni';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user$: Observable<User>;
  private uid: string;
  profile: UserInfo;
  Autorizzazioni = Autorizzazioni;


  constructor(private authService: AuthService, private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    this.user$ = this.authService.getAuthUser().pipe();
    this.user$.subscribe(userProfile => {
      this.uid = userProfile.uid;
      this.userService.getUserProfile(this.uid).subscribe( profile => this.profile = profile);
    });

  }

  goToProfile() {
    this.router.navigate(['/profile/', this.uid]);
  }

  async logOut() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
