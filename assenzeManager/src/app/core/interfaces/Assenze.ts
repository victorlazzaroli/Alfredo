import { Dipendente } from './UserInfo';
import {Ruolo} from './ProgettoInfo';

export interface Assenza {
  id: string;
  giornataIntera: boolean;
  dataInizio: string;
  dataFine: string;
  oraInizio?: string;
  oraFine?: string;
}

export interface AssenzaDipendente {
  id?: string;
  dipendente: string;
  tipoAssenza: 'PAR' | 'FERIE' | 'MALATTIA' | 'ALTRO';
  frazioneDiGiornata: boolean;
  descrizioneAltro?: string;
  dataInizio: string;
  dataFine: string;
  oraInizio?: string;
  oraFine?: string;
}

export interface GiornataCalendario {
  id: string;
  giorno: number;
  mese: number;
  anno: number;
  assenti?: AssenzaDipendente[];
}

export interface CalendarioAssenze {
  id: string;
  anno: number;
  giornate: GiornataCalendario[];
}
export interface Day {
  isHoliday: boolean;
  isAssenza: boolean;
}
