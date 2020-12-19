import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { AuthenticationComponent } from './core/authentication/authentication.component';

const routes: Routes = [
  { path: 'login', component: AuthenticationComponent},
  { path: 'logout', redirectTo: '/'},
  { path: '*', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
