import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserInfo} from '../../../../core/interfaces/UserInfo';
import {AssenzaDipendente, Day, GiornataCalendario} from '../../../../core/interfaces/Assenze';
import {lastDayOfMonth} from 'date-fns';
import {AngularFirestore} from '@angular/fire/firestore';
import {first, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {formatISO, getDayOfYear, isValid, isWithinInterval} from 'date-fns/esm';
import firebase from 'firebase/app';
import {isMoment} from 'moment/moment';

enum TipoAssenzaEnum {
  PAR = 'PAR',
  FERIE = 'FERIE',
  MALATTIA = 'MALATTIA',
  ALTRO = 'ALTRO'
}
@Component({
  selector: 'app-assenza',
  templateUrl: './assenza.component.html',
  styleUrls: ['./assenza.component.scss']
})
export class AssenzaComponent implements OnInit {
  form: FormGroup;
  dipendenti: Observable<UserInfo[]>;

  TipoAssenzaEnum = TipoAssenzaEnum;

  constructor(private formBuilder: FormBuilder,
              private firestore: AngularFirestore) {

    this.createForm();
  }

  private createForm() {
    this.form = this.formBuilder.group({
      dipendente: [null, Validators.required],
      tipoAssenza: [null, Validators.required],
      frazioneDiGiornata: [false, Validators.required],
      descrizioneAltro: [null],
      dataInizio: [null, Validators.required],
      dataFine: [null],
      oraInizio: [null],
      oraFine: [null]
    });

    this.form.controls.tipoAssenza.valueChanges.subscribe(value => {
      if (value === TipoAssenzaEnum.MALATTIA || value === TipoAssenzaEnum.FERIE) {
        this.form.controls.oraInizio.clearValidators();
        this.form.controls.oraFine.clearValidators();
        this.form.controls.dataFine.setValidators(Validators.required);
      } else {
        this.form.controls.oraInizio.setValidators(Validators.required);
        this.form.controls.oraFine.setValidators(Validators.required);
        this.form.controls.dataFine.clearValidators();
      }
    });

    this.form.controls.frazioneDiGiornata.valueChanges.subscribe(value => {
      if (value) {
        this.form.controls.oraInizio.setValidators(Validators.required);
        this.form.controls.oraFine.setValidators(Validators.required);
        this.form.controls.dataFine.clearValidators();
      }
    });
  }

  ngOnInit(): void {
    this.getDipendenti();
  }

  getDipendenti() {
    const dipendentiCollection = this.firestore.collection<UserInfo>('dipendente');
    this.dipendenti = dipendentiCollection.get().pipe(map(dipendenti => {
      return dipendenti.docs.map(dipendente => dipendente.data());
    }), first());
  }

  generaGiornateCalendario(): GiornataCalendario[] {
    const dataInizio: Date = new Date(this.form.controls.dataInizio.value);
    const dataFine: Date = new Date(this.form.controls.dataFine.value);
    const giornateCalendario: GiornataCalendario[] = [];

    if (isValid(dataInizio) && isValid(dataFine)) {
      for (let i = 0; i < getDayOfYear(dataFine) - getDayOfYear(dataInizio); i++) {
        const data = new Date(dataInizio.getFullYear(), dataInizio.getMonth(), dataInizio.getDate() + i);
        giornateCalendario.push({
          id: formatISO(data, {representation: 'date'}),
          anno: data.getFullYear(),
          mese: data.getMonth(),
          giorno: data.getDate()
        });
      }
    }

    return giornateCalendario;
  }

  async addAssenza() {

    if (this.form.invalid) {
      alert('FORM INVALIDO');
      return;
    }

    const dipendenteRef = this.firestore.doc(`/dipendente/${this.form.controls.dipendente.value}`).ref;
    this.firestore.firestore.runTransaction( async transaction => {
      if (dipendenteRef) {
        const snap = await transaction.get(dipendenteRef);
        const dipendente = snap.data() as UserInfo;

        const nuovoInizio = new Date(this.form.controls.dataInizio.value);
        const nuovaFine = new Date(this.form.controls.dataFine.value);

        const assenzaPresente = dipendente?.assenze?.find(assenza => {
          const interval: Interval = {start: new Date(assenza.dataInizio), end: new Date(assenza.dataFine)};
          try {
            return isWithinInterval(nuovoInizio, interval) || isWithinInterval(nuovaFine, interval);
          } catch (error) {
            return false;
          }
        });

        if (!assenzaPresente) {
          const giornateCalendario = await this.generaGiornateCalendario();
          transaction.update(dipendenteRef,
            {
              assenze: firebase.firestore.FieldValue.arrayUnion({
                ...this.form.value,
                dataInizio: isMoment(this.form.controls.dataInizio.value) ? this.form.controls.dataInizio.value.format('YYYY-MM-DD') : this.form.controls.dataInizio.value.toString(),
                // tslint:disable-next-line:max-line-length
                dataFine: isMoment(this.form.controls.dataFine.value) ? this.form.controls.dataFine.value.format('YYYY-MM-DD') : this.form.controls.dataFine.value.toString()
              })
            });
          giornateCalendario.forEach((giornata) => {
            const ref = this.firestore.doc(`/assenze/${giornata.id}`).ref;
            const assenzaRef = this.firestore.doc(`/assenze/${giornata.id}/assenti/${dipendente.uid}`).ref;
            transaction.set(ref, { anno: giornata.anno, mese: giornata.mese, giorno: giornata.giorno}, {merge: true});
            transaction.set(assenzaRef, {
              ...this.form.value,
              dataInizio: isMoment(this.form.controls.dataInizio.value) ? this.form.controls.dataInizio.value.format('YYYY-MM-DD') : this.form.controls.dataInizio.value.toString(),
              dataFine: isMoment(this.form.controls.dataFine.value) ? this.form.controls.dataFine.value.format('YYYY-MM-DD') : this.form.controls.dataFine.value.toString()
            });
          });
        }
      }
    });
  }
}
