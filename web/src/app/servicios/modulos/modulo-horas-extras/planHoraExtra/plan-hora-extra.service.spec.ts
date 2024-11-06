import { TestBed } from '@angular/core/testing';

import { PlanHoraExtraService } from './plan-hora-extra.service';

describe('PlanHoraExtraService', () => {
  let service: PlanHoraExtraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanHoraExtraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
