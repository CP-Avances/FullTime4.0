import { TestBed } from '@angular/core/testing';

import { CiudadFeriadosService } from './ciudad-feriados.service';

describe('CiudadFeriadosService', () => {
  let service: CiudadFeriadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CiudadFeriadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
