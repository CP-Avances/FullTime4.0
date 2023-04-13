import { TestBed } from '@angular/core/testing';

import { DetallePlanHorarioService } from './detalle-plan-horario.service';

describe('DetallePlanHorarioService', () => {
  let service: DetallePlanHorarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetallePlanHorarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
