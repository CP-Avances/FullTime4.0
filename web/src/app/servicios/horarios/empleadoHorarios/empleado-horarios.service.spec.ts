import { TestBed } from '@angular/core/testing';

import { EmpleadoHorariosService } from './empleado-horarios.service';

describe('EmpleadoHorariosService', () => {
  let service: EmpleadoHorariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpleadoHorariosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
