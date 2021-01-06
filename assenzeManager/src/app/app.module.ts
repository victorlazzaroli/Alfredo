import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthenticationComponent} from './core/authentication/authentication.component';
import {FooterComponent} from './core/footer/footer.component';
import {HeaderComponent} from './core/header/header.component';
import {AngularFireModule} from '@angular/fire';
import {environment} from 'src/environments/environment';
import {AngularFireAnalyticsModule} from '@angular/fire/analytics';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NotFoundComponent} from './core/components/not-found/not-found.component';
import {OrganizerModule} from './modules/organizer/organizer.module';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {NgxMatDatetimePickerModule, NgxMatTimepickerModule} from '@angular-material-components/datetime-picker';
import {NgxMatMomentModule} from '@angular-material-components/moment-adapter';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';
import {ProfileComponent} from './core/components/profile/profile.component';
import {CreateUserComponent} from './core/components/create-user/create-user.component';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatOptionModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {ReactiveFormsModule} from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { MySnackbarComponent } from './core/components/my-snackbar/my-snackbar.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    FooterComponent,
    HeaderComponent,
    NotFoundComponent,
    ProfileComponent,
    CreateUserComponent,
    MySnackbarComponent
  ],
  imports: [
    BrowserModule,
    OrganizerModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAnalyticsModule,
    MatMomentDateModule,
    BrowserAnimationsModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatMomentModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatOptionModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    NgxMatDatetimePickerModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
