import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { AuthenticationComponent } from './core/authentication/authentication.component';
import {ProfileComponent} from './core/components/profile/profile.component';
import {CreateUserComponent} from './core/components/create-user/create-user.component';

const routes: Routes = [
  { path: 'login', component: AuthenticationComponent},
  { path: 'profile', component: ProfileComponent},
  { path: 'newUser', component: CreateUserComponent},
  { path: 'logout', redirectTo: '/'},
  { path: '', pathMatch: 'full', redirectTo: 'home'},
  { path: '*', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
