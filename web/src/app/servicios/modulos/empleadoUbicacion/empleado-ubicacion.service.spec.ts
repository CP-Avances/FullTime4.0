import { TestBed } from '@angular/core/testing';

import { EmpleadoUbicacionService } from './empleado-ubicacion.service';

describe('EmpleadoUbicacionService', () => {
  let service: EmpleadoUbicacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpleadoUbicacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
