import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationComponent } from './core/authentication/authentication.component';
import { FooterComponent } from './core/footer/footer.component';
import { HeaderComponent } from './core/header/header.component';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { OrganizerModule } from './modules/organizer/organizer.module';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    FooterComponent,
    HeaderComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    OrganizerModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    NgxAuthFirebaseUIModule.forRoot(environment.firebase,
      () => 'assenzeManager',
     {
       enableFirestoreSync: false, // enable/disable autosync users with firestore
       toastMessageOnAuthSuccess: false, // whether to open/show a snackbar message on auth success - default : true
       toastMessageOnAuthError: false, // whether to open/show a snackbar message on auth error - default : true
       authGuardFallbackURL: '/loggedout', // url for unauthenticated users - to use in combination with canActivate feature on a route
       authGuardLoggedInURL: '/home', // url for authenticated users - to use in combination with canActivate feature on a route
       passwordMaxLength: 20, // `min/max` input parameters in components should be within this range.
       passwordMinLength: 5, // Password length min/max in forms independently of each componenet min/max.
       // Same as password but for the name
       nameMaxLength: 50,
       nameMinLength: 2,
       // If set, sign-in/up form is not available until email has been verified.
       // Plus protected routes are still protected even though user is connected.
       guardProtectedRoutesUntilEmailIsVerified: true,
       enableEmailVerification: true, // default: true
     }),
    AngularFirestoreModule,
    AngularFireAnalyticsModule,
    NgxAuthFirebaseUIModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({}, {}),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
