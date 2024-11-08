import { TestBed } from '@angular/core/testing';

import { PeriodoVacacionesService } from './periodo-vacaciones.service';

describe('PeriodoVacacionesService', () => {
  let service: PeriodoVacacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeriodoVacacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
