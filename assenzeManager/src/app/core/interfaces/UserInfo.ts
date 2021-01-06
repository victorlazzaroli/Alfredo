import { Progetto } from './ProgettoInfo';
import {AssenzaDipendente} from './Assenze';
import { Autorizzazioni } from '../enum/autorizzazioni';
import {RuoloEnum} from '../enum/ruoloEnum';

export interface Dipendente {
  ruolo: RuoloEnum;
  email: string;
}

export interface UserInfo {
  uid?: string;
  displayName: string;
  email: string;
  autorizzazione: Autorizzazioni;
  ruoli?: RuoloEnum[];
  progetti?: Progetto[];
  assenze?: AssenzaDipendente[];
}
