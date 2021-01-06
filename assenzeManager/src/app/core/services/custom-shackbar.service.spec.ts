import { TestBed } from '@angular/core/testing';

import { CustomShackbarService } from './custom-shackbar.service';

describe('CustomShackbarService', () => {
  let service: CustomShackbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomShackbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
