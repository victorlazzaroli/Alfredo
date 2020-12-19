import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { getDay, lastDayOfMonth } from 'date-fns';
import { UserInfo } from '../../../../core/interfaces/UserInfo';
import { AuthService } from '../../../../core/services/auth.service';
import { Day, GiornataCalendario } from '../../../../core/interfaces/Assenze';
import * as _ from 'lodash';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  dipendenti: UserInfo[] = [];
  tabellaDipendentiAssenze: Day[][] = [[]];
  currentDate: Date;
  currentMonth: number;
  currentYear: number;

  constructor(private firestore: AngularFirestore, private authService: AuthService) {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getUTCFullYear();
  }

  ngOnInit(): void {
    this.getDipendenti();
  }

  getDipendenti() {
    const dipendentiCollection = this.firestore.collection<UserInfo>('dipendente');
    dipendentiCollection.get().subscribe( dipendenti => {
      this.dipendenti = [];
      this.tabellaDipendentiAssenze = [];
      dipendenti.forEach( dipendente => {
        let giornateList = new Array<Day>(lastDayOfMonth(this.currentMonth).getDate());
        if (this.tabellaDipendentiAssenze.length > 0) {
          giornateList = _.cloneDeep(this.tabellaDipendentiAssenze[0]);
          this.tabellaDipendentiAssenze.push(giornateList);
        } else {
          this.tabellaDipendentiAssenze.push(giornateList);
          this.calculateHolidays(this.currentYear, this.currentMonth);
        }
        this.dipendenti.push(dipendente.data());
      });
      this.getAssenze(this.currentYear, this.currentMonth);
    });
  }

  getAssenze(anno: number, mese: number) {
    const assenzeCollection = this.firestore.collection<GiornataCalendario>('assenze');
    assenzeCollection.ref.where('anno', '==', anno).where('mese', '==', mese).get()
    .then( assenze => {
      assenze.forEach( assenza => {
        const giorno = assenza.get('giorno');
        assenza.ref.collection('assenti').get().then(dipendenti => {
          dipendenti.forEach(assente => {
            const idxDipendente = this.dipendenti.findIndex(dipendente => dipendente.email === assente.get('dipendente'));
            this.tabellaDipendentiAssenze[idxDipendente][giorno].isAssenza = true;
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
          meseUomo[i] = {isHoliday: true, isAssenza: false };
        } else {
          meseUomo[i] = {isHoliday: false, isAssenza: false };
        }
      }
    });
  }

}
