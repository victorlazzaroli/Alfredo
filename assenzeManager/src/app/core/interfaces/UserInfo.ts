import { Ruolo, Progetto } from './ProgettoInfo';
import { Assenza } from './Assenze';
import { Autorizzazioni } from '../enum/autorizzazioni';

export interface Dipendente {
  ruolo: Ruolo;
  uid: string;
}

export interface UserInfo extends Dipendente {
  name: string;
  email: string;
  autorizzazione: Autorizzazioni;
  progetti?: Progetto[];
  assenze?: Assenza[];
}
