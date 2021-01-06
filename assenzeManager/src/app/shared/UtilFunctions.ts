import {GiornataCalendario} from '../core/interfaces/Assenze';
import {formatISO, getDayOfYear, isValid} from 'date-fns/esm';
import {FormGroup} from '@angular/forms';

export class UtilFunctions {

  static generaGiornateCalendario(start: string | Date, end: string | Date ): GiornataCalendario[] {
    const dataInizio: Date = new Date(start);
    const dataFine: Date = !UtilFunctions.isVoid(end) ? new Date(end) : new Date(start);
    const giornateCalendario: GiornataCalendario[] = [];

    if (isValid(dataInizio) && isValid(dataFine)) {
      for (let i = 0; i < getDayOfYear(dataFine) - getDayOfYear(dataInizio) + 1; i++) {
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

  static isVoid(val: any) {
    return val === undefined || val === null || val === 'undefined' || val === 'null' || val === '' || val === ' ';
  }

  static resetFormAllErrors(form: FormGroup) {
    for (const key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].setErrors(null);
      }
    }
  }
}
