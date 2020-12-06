import { Dipendente } from './UserInfo';

export interface Progetto {
  id: string;
  name: string;
  dipendenti: Dipendente[];
}

export interface Ruolo {
  name: string;
  id: string;
}
