import { TestBed } from '@angular/core/testing';

import { PedHoraExtraService } from './ped-hora-extra.service';

describe('PedHoraExtraService', () => {
  let service: PedHoraExtraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedHoraExtraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
