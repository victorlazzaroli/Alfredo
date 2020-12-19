import { createAction } from '@ngrx/store';
import { Assenza } from '../../core/interfaces/Assenze';

export const addAssenza = createAction('[Assenza Component] Aggiunta', (assenza: Assenza) => ({assenza}));
export const updateAssenza = createAction('[Assenza Component] Aggiorna', (assenza: Assenza) => ({assenza}));
export const deleteAssenza = createAction('[Assenza Component] Elimina');

export const detailCalendarAssenza = createAction('[Calendar Component] Dettagli');
export const deleteCalendarAssenza = createAction('[Calendar Component] Elimina');

export const filterAssenze =  createAction('[Filter Component] Filtra');
