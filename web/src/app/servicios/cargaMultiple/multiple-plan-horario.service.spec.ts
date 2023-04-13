import { TestBed } from '@angular/core/testing';

import { MultiplePlanHorarioService } from './multiple-plan-horario.service';

describe('MultiplePlanHorarioService', () => {
  let service: MultiplePlanHorarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultiplePlanHorarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
