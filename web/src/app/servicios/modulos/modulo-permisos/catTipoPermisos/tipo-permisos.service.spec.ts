import { TestBed } from '@angular/core/testing';

import { TipoPermisosService } from './tipo-permisos.service';

describe('TipoPermisosService', () => {
  let service: TipoPermisosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoPermisosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
