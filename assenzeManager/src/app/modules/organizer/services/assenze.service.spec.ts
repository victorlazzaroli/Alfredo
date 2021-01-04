import { TestBed } from '@angular/core/testing';

import { AssenzeService } from './assenze.service';

describe('AssenzeService', () => {
  let service: AssenzeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssenzeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
