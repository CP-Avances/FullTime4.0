import { TestBed } from '@angular/core/testing';

import { RelojesService } from './relojes.service';

describe('RelojesService', () => {
  let service: RelojesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelojesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
