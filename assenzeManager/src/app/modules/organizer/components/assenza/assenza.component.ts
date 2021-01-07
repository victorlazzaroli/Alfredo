import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserInfo} from '../../../../core/interfaces/UserInfo';
import {Assenza, AssenzaDipendente, Day, GiornataCalendario} from '../../../../core/interfaces/Assenze';
import {lastDayOfMonth} from 'date-fns';
import {AngularFirestore} from '@angular/fire/firestore';
import {first, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {formatISO, getDayOfYear, isValid, isWithinInterval, startOfToday} from 'date-fns/esm';
import firebase from 'firebase/app';
import {isMoment} from 'moment/moment';
import {AssenzeService} from '../../services/assenze.service';
import {UtilFunctions} from '../../../../shared/UtilFunctions';
import {CustomShackbarService} from '../../../../core/services/custom-shackbar.service';
import {UserService} from '../../../../core/services/user.service';
import {AuthService} from '../../../../core/services/auth.service';

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
  currentProfile$: Observable<UserInfo>;
  private minDatainizio: Date;
  private minDatafine: Date;

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
              private userService: UserService,
              private snackBar: CustomShackbarService,
              private authService: AuthService,
              private assenzaService: AssenzeService,
              private firestore: AngularFirestore) {

    this.createForm();
    this.minDatainizio = startOfToday();
    this.minDatafine = this.minDatainizio;
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

    this.authService.getAuthUser().subscribe( user => this.form.controls.dipendente.patchValue(user.uid, { emitEvent: true}));

    this.form.controls.tipoAssenza.valueChanges.subscribe(value => {
      if (value !== TipoAssenzaEnum.FERIE && value !== TipoAssenzaEnum.MALATTIA && value !== null) {
        this.form.controls.frazioneDiGiornata.patchValue(true, { emitEvent: true});
      } else {
        this.form.controls.frazioneDiGiornata.patchValue(false, { emitEvent: true});
      }
      if (value !== TipoAssenzaEnum.ALTRO) {
        this.form.controls.descrizioneAltro.reset();
      }
    });

    this.form.controls.frazioneDiGiornata.valueChanges.subscribe(value => {
      if (!value) {
        UtilFunctions.resetFormAllErrors(this.form);
        this.form.controls.oraInizio.reset();
        this.form.controls.oraInizio.clearValidators();
        this.form.controls.oraFine.reset();
        this.form.controls.oraFine.clearValidators();
        this.form.controls.dataFine.setValidators(Validators.required);
      } else {
        UtilFunctions.resetFormAllErrors(this.form);
        this.form.controls.oraInizio.setValidators([Validators.required, Validators.min(8), , Validators.max(24)]);
        this.form.controls.oraFine.setValidators([Validators.required, Validators.min(8), , Validators.max(24)]);
        this.form.controls.dataFine.reset();
        this.form.controls.dataFine.clearValidators();
      }
    });

    this.form.controls.dataInizio.valueChanges.subscribe(value => {
      this.minDatafine = new Date(value);
    });
  }

  ngOnInit(): void {
    this.currentProfile$ = this.userService.getUserProfile();
    this.getDipendenti();
  }

  getDipendenti() {
    const dipendentiCollection = this.firestore.collection<UserInfo>('dipendenti');
    this.dipendenti = dipendentiCollection.get().pipe(map(dipendenti => {
      return dipendenti.docs.map(dipendente => dipendente.data());
    }), first());
  }

  async addAssenza() {
    if (this.form.invalid) {
      alert('FORM INVALIDO');
      this.form.reset();
      UtilFunctions.resetFormAllErrors(this.form);
      this.isModifica = false;
      return;
    }
    if (this.isModifica) {
      const data = new Date(this.assenza.dataInizio);
      try {
        await this.assenzaService.cancellaAssenza(this.assenza.dipendente, data);
      } catch (errore) {
        this.snackBar.openSnackBar('Errore nella creazione dell\' assenza', 'Error');
        this.form.reset();
        this.assenza = null;
        return;
      } finally {
        this.isModifica = false;
      }
    }

    if (this.form.controls.frazioneDiGiornata.value) {
      this.form.controls.dataFine.patchValue(this.form.controls.dataInizio.value);
    }

    try {
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
      this.snackBar.openSnackBar('Assenza creata con successo', 'Success');
    } catch (error) {
      this.snackBar.openSnackBar('Errore nella creazione dell\' assenza', 'Error');
    }
    this.form.reset();
    this.assenza = null;
  }
}
