import { TestBed } from '@angular/core/testing';

import { RegimenService } from './regimen.service';

describe('RegimenService', () => {
  let service: RegimenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegimenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
