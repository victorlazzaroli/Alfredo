import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {RuoloEnum} from '../../enum/ruoloEnum';
import {Observable} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../services/user.service';
import firebase from 'firebase/app';
import {map, startWith} from 'rxjs/operators';
import {MatChipInputEvent} from '@angular/material/chips';
import {AngularFireAuth} from '@angular/fire/auth';
import {Autorizzazioni} from '../../enum/autorizzazioni';
import {UtilFunctions} from '../../../shared/UtilFunctions';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CustomShackbarService} from '../../services/custom-shackbar.service';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  ruoliList = [RuoloEnum.ANALISI, RuoloEnum.FRONTEND, RuoloEnum.BACKEND, RuoloEnum.MOBILE];
  ruoliSelezionati = [];
  filteredRuoli: Observable<string[]>;
  profileForm: FormGroup;
  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  private editMode: boolean;

  constructor(private formBuilder: FormBuilder,
              private snackBar: CustomShackbarService,
              private afAuthService: AngularFireAuth,
              private route: ActivatedRoute,
              private userService: UserService) {
    this.profileForm = this.formBuilder.group({
      displayName: [null, Validators.required],
      email: [null, Validators.required],
      password: [null, [Validators.required, Validators.minLength(6)]],
      ruoli: [[]]
    });

    this.filteredRuoli = this.profileForm.controls.ruoli.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => fruit ? this._filter(fruit) : this.ruoliList.slice()));
  }

  ngOnInit(): void {
    this.editMode = false;
    const uid = this.route.snapshot.paramMap.get('uid');
    if (uid) {
      this.userService.getUserProfile(uid)
        .subscribe(
          profile => {
            if (profile) {
              this.editMode = true;
            }
            this.profileForm.patchValue(profile, {emitEvent: true});
          },
          error => console.log(error)
        );
    }
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim() && !this.ruoliSelezionati.includes(value)) {
      this.ruoliSelezionati.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.profileForm.controls.ruoli.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.ruoliSelezionati.indexOf(fruit);

    if (index >= 0) {
      this.ruoliSelezionati.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.ruoliSelezionati.includes(event.option.viewValue)) {
      this.ruoliSelezionati.push(event.option.viewValue);
    }
    this.fruitInput.nativeElement.value = '';
    this.profileForm.controls.ruoli.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.ruoliList.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  }

  creaUtente() {
    if (this.profileForm.invalid) {
      alert('FORM INVALIDO');
      this.profileForm.reset();
      UtilFunctions.resetFormAllErrors(this.profileForm);
      return;
    }
    const authApp = firebase.initializeApp(environment.firebase, 'authApp');
    const detachedAuth = authApp.auth();
    detachedAuth.createUserWithEmailAndPassword(this.profileForm.controls.email.value, this.profileForm.controls.password.value)
      .then(newUser => {
        newUser.user.updateProfile({displayName: this.profileForm.controls.displayName.value});
        this.userService.createProfile({
          uid: newUser.user.uid,
          autorizzazione: Autorizzazioni.DIPENDENTE,
          displayName: this.profileForm.controls.displayName.value,
          email:  this.profileForm.controls.email.value,
          ruoli: [...this.ruoliSelezionati],
          progetti: [],
          assenze: []
        })
          .subscribe(success => {
            this.snackBar.openSnackBar('Utene creato con successo', 'Success');
          });
      })
      .catch(error => this.snackBar.openSnackBar('Errore durante la creazione', 'Error'));
  }

  generaPassword() {
    const lista: number[] = [];
    for (let i = 0; i < 10; i++) {
      lista.push(Math.floor(Math.random() * 42) + 65);
    }
    this.profileForm.controls.password.patchValue(String.fromCharCode(...lista));
  }
}
