import { TestBed } from '@angular/core/testing';

import { PlanGeneralService } from './plan-general.service';

describe('PlanGeneralService', () => {
  let service: PlanGeneralService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanGeneralService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
