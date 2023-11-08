import { TestBed } from '@angular/core/testing';

import { TiempoLaboradoService } from './tiempo-laborado.service';

describe('TiempoLaboradoService', () => {
  let service: TiempoLaboradoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiempoLaboradoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
