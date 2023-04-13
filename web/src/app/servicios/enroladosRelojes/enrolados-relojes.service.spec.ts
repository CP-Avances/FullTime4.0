import { TestBed } from '@angular/core/testing';

import { EnroladosRelojesService } from './enrolados-relojes.service';

describe('EnroladosRelojesService', () => {
  let service: EnroladosRelojesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnroladosRelojesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
