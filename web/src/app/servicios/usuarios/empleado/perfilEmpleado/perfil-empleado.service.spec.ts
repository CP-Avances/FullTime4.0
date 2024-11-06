import { TestBed } from '@angular/core/testing';

import { PerfilEmpleadoService } from './perfil-empleado.service';

describe('PerfilEmpleadoService', () => {
  let service: PerfilEmpleadoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerfilEmpleadoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
