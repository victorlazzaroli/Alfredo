import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizerRoutingModule } from './organizer-routing.module';
import { OrganizerComponent } from './organizer.component';
import { ListComponent } from './components/list/list.component';
import { StoreModule } from '@ngrx/store';
import * as fromOrganizer from './reducers';


@NgModule({
  declarations: [OrganizerComponent, ListComponent],
  imports: [
    CommonModule,
    OrganizerRoutingModule,
    StoreModule.forFeature(fromOrganizer.organizerFeatureKey, fromOrganizer.reducers, { metaReducers: fromOrganizer.metaReducers })
  ]
})
export class OrganizerModule { }
