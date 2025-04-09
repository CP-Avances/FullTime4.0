import { TestBed } from '@angular/core/testing';

import { EmpleadoProcesosService } from './empleado-procesos.service';

describe('EmpleadoProcesosService', () => {
  let service: EmpleadoProcesosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpleadoProcesosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
