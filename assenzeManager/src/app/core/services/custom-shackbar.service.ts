import { Injectable } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MySnackbarComponent} from '../components/my-snackbar/my-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class CustomShackbarService {

  constructor(private snackBar: MatSnackBar) { }
  public openSnackBar(message: string, snackType?: string) {
    const type: string =
      snackType !== undefined ? snackType : 'Success';

    this.snackBar.openFromComponent(MySnackbarComponent, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      data: { message, snackType: type }
    });
  }
}
