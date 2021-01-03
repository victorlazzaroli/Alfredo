import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizerRoutingModule } from './organizer-routing.module';
import { OrganizerComponent } from './organizer.component';
import { ListComponent } from './components/list/list.component';
import { StoreModule } from '@ngrx/store';
import * as fromOrganizer from './reducers';
import { AssenzaComponent } from './components/assenza/assenza.component';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {NgxMatDatetimePickerModule} from '@angular-material-components/datetime-picker';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';


@NgModule({
  declarations: [OrganizerComponent, ListComponent, AssenzaComponent],
  imports: [
    CommonModule,
    OrganizerRoutingModule,
    StoreModule.forFeature(fromOrganizer.organizerFeatureKey, fromOrganizer.reducers, {metaReducers: fromOrganizer.metaReducers}),
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
    MatCheckboxModule
  ]
})
export class OrganizerModule { }
