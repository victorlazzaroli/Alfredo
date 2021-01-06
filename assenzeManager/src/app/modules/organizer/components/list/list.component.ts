import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {getDay, lastDayOfMonth} from 'date-fns';
import {UserInfo} from '../../../../core/interfaces/UserInfo';
import {AssenzaDipendente, Day, GiornataCalendario} from '../../../../core/interfaces/Assenze';
import * as _ from 'lodash';
import {AssenzeService} from '../../services/assenze.service';
import {formatISO, isValid} from 'date-fns/esm';
import {first, takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {UserService} from '../../../../core/services/user.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  @Output()
  modificaAssenzaEvento: EventEmitter<AssenzaDipendente> = new EventEmitter<AssenzaDipendente>();

  dipendenti: UserInfo[] = [];
  tabellaDipendentiAssenze: Day[][] = [[]];
  currentDate: Date;
  currentMonth: number;
  currentYear: number;
  destroy$: Subject<boolean> = new Subject<boolean>();
  currentProfile: UserInfo;

  constructor(private firestore: AngularFirestore,
              private userService: UserService,
              private assenzaService: AssenzeService) {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getUTCFullYear();
  }

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe( profile => this.currentProfile = profile);
    this.getDipendenti();
  }

  ngOnDestroy() {
    this.destroy$.complete();
  }

  getDipendenti() {
    this.firestore.collection<UserInfo>('dipendenti')
      .valueChanges()
      .pipe(first())
      .subscribe(dipendenti => {
        this.dipendenti = [];
        this.tabellaDipendentiAssenze = [];
        dipendenti.forEach(dipendente => {
          let giornateList = new Array<Day>(lastDayOfMonth(this.currentMonth).getDate());
          if (this.tabellaDipendentiAssenze.length > 0) {
            giornateList = _.cloneDeep(this.tabellaDipendentiAssenze[0]);
            this.tabellaDipendentiAssenze.push(giornateList);
          } else {
            this.tabellaDipendentiAssenze.push(giornateList);
            this.calculateHolidays(this.currentYear, this.currentMonth);
          }
          this.dipendenti.push(dipendente);
        });
        this.getAssenze(this.currentYear, this.currentMonth);
      });
  }

  getAssenze(anno: number, mese: number) {
    this.firestore.collection<GiornataCalendario>('assenze', ref =>
      ref.where('anno', '==', anno)
        .where('mese', '==', mese)
        .orderBy('giorno')
    ).snapshotChanges()
      .pipe(takeUntil(this.destroy$))
      .subscribe(assenze => {
        assenze.forEach(assenza => {
          const giorno = assenza.payload.doc.data().giorno;
          this.firestore.collection<AssenzaDipendente>(assenza.payload.doc.ref.path + '/assenti')
            .valueChanges({idField: 'id'})
            .pipe(takeUntil(this.destroy$))
            .subscribe(dipendenti => {
              dipendenti.forEach(assente => {
                const dipendenteAssente = assente;
                const idxDipendente = this.dipendenti.findIndex(dipendente => dipendente.uid === assente.id);
                this.tabellaDipendentiAssenze[idxDipendente][giorno - 1] = {
                  ...dipendenteAssente,
                  isHoliday: this.tabellaDipendentiAssenze[idxDipendente][giorno - 1].isHoliday,
                  isGiornataAssenza: !dipendenteAssente.frazioneDiGiornata,
                  isOreAssenza: dipendenteAssente.frazioneDiGiornata,
                  tooltipText: this.tabellaDipendentiAssenze[idxDipendente][giorno - 1].isHoliday ?
                    null : this.getTooltip(dipendenteAssente)
                };
              });
            });
        });
      });
  }

  calculateHolidays(anno: number, mese: number) {
    this.tabellaDipendentiAssenze.forEach(meseUomo => {
      for (let i = 0; i < meseUomo.length; i++) {
        const weekDay = getDay(new Date(anno, mese, i));
        if (weekDay === 5 || weekDay === 6) {
          meseUomo[i] = {...meseUomo[i], isHoliday: true, isGiornataAssenza: false, isOreAssenza: false};
        } else {
          meseUomo[i] = {...meseUomo[i], isHoliday: false, isGiornataAssenza: false, isOreAssenza: false};
        }
      }
    });
  }


  async modificaAssenza(dipendente: number, giornata: number, modifica: boolean = true) {
    if (modifica) {
      this.modificaAssenzaEvento.emit({...this.tabellaDipendentiAssenze[dipendente][giornata]});
    } else {
      const data = new Date(this.currentYear, this.currentMonth, giornata);
      this.modificaAssenzaEvento.emit({
        dipendente: this.dipendenti[dipendente].uid,
        tipoAssenza: 'FERIE',
        frazioneDiGiornata: false,
        dataInizio: formatISO(data, {representation: 'date'}),
        dataFine: formatISO(data, {representation: 'date'}),
      });
    }
  }

  async deleteAssenza(dipendente: number, giornata: number) {
    const data = new Date(this.tabellaDipendentiAssenze[dipendente][giornata].dataInizio);
    if (!this.tabellaDipendentiAssenze[dipendente][giornata].dipendente || !isValid(data)) {
      return null;
    }
    return this.assenzaService.cancellaAssenza(this.tabellaDipendentiAssenze[dipendente][giornata].dipendente, data);
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear -= 1;
    } else {
      this.currentMonth -= 1;
    }
    this.currentDate = new Date(this.currentYear, this.currentMonth);
    this.destroy$.next();
    this.getDipendenti();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear += 1;
    } else {
      this.currentMonth += 1;
    }
    this.currentDate = new Date(this.currentYear, this.currentMonth);
    this.destroy$.next();
    this.getDipendenti();
  }

  getTooltip(day: AssenzaDipendente): string {
    let tooltip: string;
    switch (day.tipoAssenza) {
      case 'FERIE':
        tooltip = 'Assente per tutta la gioranata';
        break;
      case 'PAR':
        if (day.frazioneDiGiornata) {
          tooltip = `Assente dalle ${day.oraInizio}:00 alle ${day.oraFine}:00` ;
        } else {
          tooltip = 'Assente per tutta la gioranata';
        }
        break;
      case 'MALATTIA':
        if (day.frazioneDiGiornata) {
          tooltip = `Malattia dalle ${day.oraInizio}:00 alle ${day.oraFine}:00` ;
        } else {
          tooltip = 'Assente per malattia tutta la gioranata';
        }
        break;
      case 'ALTRO':
        tooltip = day.descrizioneAltro;
        break;
      default:
        if (day.frazioneDiGiornata) {
          tooltip = `Assente dalle ${day.oraInizio}:00 alle ${day.oraFine}:00` ;
        } else {
          tooltip = 'Assente per tutta la gioranata';
        }
    }

    return tooltip;
  }
}
