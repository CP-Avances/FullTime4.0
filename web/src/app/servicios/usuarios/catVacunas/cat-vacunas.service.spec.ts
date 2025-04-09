import { TestBed } from '@angular/core/testing';

import { CatVacunasService } from './cat-vacunas.service';

describe('CatModalidadLaboralService', () => {
  let service: CatVacunasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatVacunasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
