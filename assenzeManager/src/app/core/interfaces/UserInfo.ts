import { Ruolo, Progetto } from './ProgettoInfo';
import { Assenza } from './Assenze';
import { Autorizzazioni } from '../enum/autorizzazioni';

export interface Dipendente {
  ruolo: Ruolo;
  email: string;
}

export interface UserInfo extends Dipendente {
  uid?: string;
  name: string;
  email: string;
  autorizzazione: Autorizzazioni;
  progetti?: Progetto[];
  assenze?: Assenza[];
}
