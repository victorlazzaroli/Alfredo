import { Dipendente } from './UserInfo';

export interface Assenza {
  id: string;
  giornataIntera: boolean;
  dataInizio: Date;
  dataFine: Date;
}

export interface GiornataCalendario {
  id: string;
  giorno: number;
  mese: number;
  anno: number;
  assenti: Dipendente[];
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
