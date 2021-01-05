import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {getDay, lastDayOfMonth} from 'date-fns';
import {UserInfo} from '../../../../core/interfaces/UserInfo';
import {AssenzaDipendente, Day, GiornataCalendario} from '../../../../core/interfaces/Assenze';
import * as _ from 'lodash';
import {AssenzeService} from '../../services/assenze.service';
import {isValid} from 'date-fns/esm';
import {first, takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';

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

  constructor(private firestore: AngularFirestore, private assenzaService: AssenzeService) {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getUTCFullYear();
  }

  ngOnInit(): void {
    this.getDipendenti();
  }

  ngOnDestroy() {
    this.destroy$.complete();
  }

  getDipendenti() {
    this.firestore.collection<UserInfo>('dipendente')
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
                  oreDiAssenza: dipendenteAssente.frazioneDiGiornata ?
                    `Assente dalle ${dipendenteAssente.oraInizio}:00 alle ${dipendenteAssente.oraFine}:00` :
                    'Assente per tutta la giornata'
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


  async modificaAssenza(dipendente: number, giornata: number) {
    this.modificaAssenzaEvento.emit({...this.tabellaDipendentiAssenze[dipendente][giornata]});
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
    this.getAssenze(this.currentYear, this.currentMonth);
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear += 1;
    } else {
      this.currentMonth += 1;
    }
    this.getAssenze(this.currentYear, this.currentMonth);
  }
}
