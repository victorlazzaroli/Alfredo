import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssenzaComponent } from './assenza.component';

describe('AssenzaComponent', () => {
  let component: AssenzaComponent;
  let fixture: ComponentFixture<AssenzaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssenzaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssenzaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
