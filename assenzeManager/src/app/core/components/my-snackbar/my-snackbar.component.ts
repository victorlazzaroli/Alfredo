import {Component, Inject, OnInit} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-snackbar',
  templateUrl: './my-snackbar.component.html',
  styleUrls: ['./my-snackbar.component.scss']
})
export class MySnackbarComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }

  ngOnInit(): void {
  }

  get getIcon() {
    switch (this.data.snackType) {
      case 'Success':
        return 'check_circle';
      case 'Error':
        return 'highlight_off';
      case 'Warn':
        return 'error';
      case 'Info':
        return 'info';
    }
  }

  get iconColor() {
    switch (this.data.snackType) {
      case 'Success':
        return 'green';
      case 'Error':
        return 'red';
      case 'Warn':
        return 'yellow';
      case 'Info':
        return 'blue';
    }
  }
}
