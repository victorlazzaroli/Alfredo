import { Component, OnInit } from '@angular/core';
import {AssenzaDipendente} from '../../core/interfaces/Assenze';
import {AssenzeService} from './services/assenze.service';

@Component({
  selector: 'app-organizer',
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss']
})
export class OrganizerComponent implements OnInit {
  assenza: AssenzaDipendente;

  constructor(private assenzaService: AssenzeService) { }

  ngOnInit(): void {
  }

  modificaAssenza($event: AssenzaDipendente) {
    if ($event) {
      this.assenza = {...$event};
    } else {
      this.assenza = undefined;
    }
  }

  async salvaAssenza($event: {assenza: AssenzaDipendente, update?: boolean}) {
    if (!$event) {
      return;
    }
    const assenza = {...$event.assenza};
    if ($event.update) {
      await this.assenzaService.cancellaAssenza(assenza.dipendente, assenza.dataInizio);
    }
    await this.assenzaService.nuovaAssenza(assenza);
  }
}
