import { Injectable } from '@angular/core';
import {UserInfo} from '../../../core/interfaces/UserInfo';
import {isWithinInterval} from 'date-fns/esm';
import firebase from 'firebase';
import {isMoment} from 'moment/moment';
import {AngularFirestore} from '@angular/fire/firestore';
import {UtilFunctions} from '../../../shared/UtilFunctions';
import {AssenzaDipendente} from '../../../core/interfaces/Assenze';

@Injectable({
  providedIn: 'root'
})
export class AssenzeService {

  constructor(private firestore: AngularFirestore) { }

  async nuovaAssenza(assenza: AssenzaDipendente) {
    return this.firestore.firestore.runTransaction( async transaction => {
      const dipendenteRef = this.firestore.doc(`/dipendenti/${assenza.dipendente}`).ref;
      if (dipendenteRef) {
        const snap = await transaction.get(dipendenteRef);
        const dipendente = snap.data() as UserInfo;

        const nuovoInizio = new Date(assenza.dataInizio);
        const nuovaFine = new Date(assenza.dataFine);

        const assenzaPresente = dipendente?.assenze?.find(assenzaDipendente => {
          if (assenzaDipendente.frazioneDiGiornata) {
            assenzaDipendente.dataFine = assenzaDipendente.dataInizio;
          }
          const interval: Interval = {
            start: new Date(assenzaDipendente.dataInizio),
            end: new Date(assenzaDipendente.dataFine)
          };

          try {
            return isWithinInterval(nuovoInizio, interval) || isWithinInterval(nuovaFine, interval);
          } catch (error) {
            return false;
          }
        });

        if (!assenzaPresente) {
          const giornateCalendario = await UtilFunctions.generaGiornateCalendario(assenza.dataInizio, assenza.dataFine);
          transaction.update(dipendenteRef,
            {
              assenze: firebase.firestore.FieldValue.arrayUnion({...assenza})
            });
          giornateCalendario.forEach((giornata) => {
            const ref = this.firestore.doc(`/assenze/${giornata.id}`).ref;
            const assenzaRef = this.firestore.doc(`/assenze/${giornata.id}/assenti/${dipendente.uid}`).ref;
            transaction.set(ref, { anno: giornata.anno, mese: giornata.mese, giorno: giornata.giorno}, {merge: true});
            transaction.set(assenzaRef, {...assenza});
          });
        }
      }
    });
  }

  async cancellaAssenza(uid: string, data: Date | string) {
    return this.firestore.firestore.runTransaction( async transaction => {
      const dipendenteRef = this.firestore.doc(`/dipendenti/${uid}`).ref;
      if (dipendenteRef) {
        const snap = await transaction.get(dipendenteRef);
        const dipendente = snap.data() as UserInfo;
        let indexAssenza = -1;

        const assenzaDaCancellare = dipendente?.assenze?.find((assenza, index) => {
          const dataSelezionata = new Date(data);
          if (assenza.frazioneDiGiornata) {
            assenza.dataFine = assenza.dataInizio;
          }
          const interval: Interval = {start: new Date(assenza.dataInizio), end: new Date(assenza.dataFine)};
          try {
            if (isWithinInterval(dataSelezionata, interval)) {
              indexAssenza = index;
              return true;
            }
            return false;
          } catch (error) {
            return false;
          }
        });

        if (assenzaDaCancellare && indexAssenza !== -1) {
          // tslint:disable-next-line:max-line-length
          const giornateCalendario = await UtilFunctions.generaGiornateCalendario(assenzaDaCancellare.dataInizio, assenzaDaCancellare.dataFine);
          dipendente.assenze.splice(indexAssenza, 1);
          transaction.update(dipendenteRef,
            {
              assenze: dipendente.assenze
            });
          giornateCalendario.forEach((giorno) => {
            const assenzaRef = this.firestore.doc(`/assenze/${giorno.id}/assenti/${dipendente.uid}`).ref;
            transaction.delete(assenzaRef);
          });

          return assenzaDaCancellare;
        } else {
          return undefined;
        }
      }
    });
  }
}
