import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {RuoloEnum} from 'src/app/core/enum/ruoloEnum';
import {Observable} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';
import {UserService} from '../../services/user.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  visible = true;
  selectable = true;
  removable = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  ruoliList = [RuoloEnum.ANALISI, RuoloEnum.FRONTEND, RuoloEnum.BACKEND, RuoloEnum.MOBILE];
  ruoliSelezionati = [];
  filteredRuoli: Observable<string[]>;
  profileForm: FormGroup;
  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private userService: UserService,
              private authService: AuthService) {
    this.profileForm = this.formBuilder.group({
      displayName: [null, Validators.required],
      email: [null, Validators.required],
      ruoli: []
    });

    this.filteredRuoli = this.profileForm.controls.ruoli.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => fruit ? this._filter(fruit) : this.ruoliList.slice()));
  }

  ngOnInit(): void {
    const uid = this.route.snapshot.paramMap.get('uid');
    if (uid) {
      this.userService.getUserProfile(uid)
        .subscribe(
          profile => {
            this.profileForm.patchValue(profile, {emitEvent: true});
            this.ruoliSelezionati = [...profile?.ruoli];
          },
          error => console.log(error)
        );
    }
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
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
    this.ruoliSelezionati.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = '';
    this.profileForm.controls.ruoli.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.ruoliList.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  }

}
