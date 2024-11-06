import { TestBed } from '@angular/core/testing';

import { PlanComidasService } from './plan-comidas.service';

describe('PlanComidasService', () => {
  let service: PlanComidasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanComidasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
