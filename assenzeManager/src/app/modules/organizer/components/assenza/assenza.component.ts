import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserInfo} from '../../../../core/interfaces/UserInfo';
import {Assenza, AssenzaDipendente, Day, GiornataCalendario} from '../../../../core/interfaces/Assenze';
import {lastDayOfMonth} from 'date-fns';
import {AngularFirestore} from '@angular/fire/firestore';
import {first, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {formatISO, getDayOfYear, isValid, isWithinInterval} from 'date-fns/esm';
import firebase from 'firebase/app';
import {isMoment} from 'moment/moment';
import {AssenzeService} from '../../services/assenze.service';

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

  @Input('assenza')
  set _assenza(val: AssenzaDipendente) {
    if (val) {
      this.assenza = val;
      Object.keys(val).forEach(Key => {
        this.form.patchValue({[Key]: val[Key]}, {emitEvent: true});
      });
      this.isModifica = true;
    } else {
      this.assenza = null;
      this.form.reset();
    }
  }
  assenza: AssenzaDipendente;

  isModifica = false;

  form: FormGroup;
  dipendenti: Observable<UserInfo[]>;

  TipoAssenzaEnum = TipoAssenzaEnum;

  constructor(private formBuilder: FormBuilder,
              private assenzaService: AssenzeService,
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
      if (value !== TipoAssenzaEnum.FERIE && value !== TipoAssenzaEnum.MALATTIA && value !== null) {
        this.form.controls.frazioneDiGiornata.patchValue(true, { emitEvent: true});
      } else {
        this.form.controls.frazioneDiGiornata.patchValue(false, { emitEvent: true});
      }
      if (value === TipoAssenzaEnum.MALATTIA || value === TipoAssenzaEnum.FERIE) {
        this.resetAllErrors();
        this.form.controls.oraInizio.clearValidators();
        this.form.controls.oraFine.clearValidators();
        this.form.controls.dataFine.setValidators(Validators.required);
      } else {
        this.resetAllErrors();
        this.form.controls.oraInizio.setValidators(Validators.required);
        this.form.controls.oraFine.setValidators(Validators.required);
        this.form.controls.dataFine.clearValidators();
      }
    });

    this.form.controls.frazioneDiGiornata.valueChanges.subscribe(value => {
      if (value) {
        this.resetAllErrors();
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

  async addAssenza() {
    if (this.form.invalid) {
      alert('FORM INVALIDO');
      this.form.reset();
      this.resetAllErrors();
      this.isModifica = false;
      return;
    }
    if (this.isModifica) {
      const data = new Date(this.assenza.dataInizio);
      await this.assenzaService.cancellaAssenza(this.assenza.dipendente, data);
      this.isModifica = false;
    }

    if (this.form.controls.frazioneDiGiornata.value) {
      this.form.controls.dataFine.patchValue(this.form.controls.dataInizio.value);
    }

    await this.assenzaService.nuovaAssenza({
      ...this.form.value,

      frazioneDiGiornata: !!this.form.controls.frazioneDiGiornata.value,

      dataInizio: isMoment(this.form.controls.dataInizio.value) ?
          this.form.controls.dataInizio.value.format('YYYY-MM-DD') : this.form.controls.dataInizio.value.toString(),

      dataFine: isMoment(this.form.controls.dataFine.value) ?
          this.form.controls.dataFine.value.format('YYYY-MM-DD') :
          this.form.controls.dataFine.value ? this.form.controls.dataFine.value.toString() : null
      }
    );
    this.form.reset();
    this.assenza = null;
  }

  private resetAllErrors() {
    for (const key in this.form.controls) {
      if (this.form.controls[key]) {
        this.form.controls[key].setErrors(null);
      }
    }
  }
}
