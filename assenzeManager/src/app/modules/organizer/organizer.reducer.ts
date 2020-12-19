import { state } from '@angular/animations';
import { createReducer, on } from '@ngrx/store';
import { Assenza } from '../../core/interfaces/Assenze';
import * as OrganizerActions from './organizer.actions';
import * as _ from 'lodash';

export interface AssenzeState {
  assenze: Assenza[];
}
export const initialAssenzeState: AssenzeState = {
  assenze: []
};

const _assenzaReducer = createReducer(
  initialAssenzeState,
  on(OrganizerActions.addAssenza, (state: AssenzeState, {assenza}) => ({..._.cloneDeep(state),
    assenze: [...state.assenze, assenza]
  }))
);
