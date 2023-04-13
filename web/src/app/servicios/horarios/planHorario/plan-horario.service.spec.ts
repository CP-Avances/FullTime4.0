import { TestBed } from '@angular/core/testing';

import { PlanHorarioService } from './plan-horario.service';

describe('PlanHorarioService', () => {
  let service: PlanHorarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanHorarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
