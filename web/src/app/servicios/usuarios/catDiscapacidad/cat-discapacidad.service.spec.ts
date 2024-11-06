import { TestBed } from '@angular/core/testing';

import { CatDiscapacidadService } from './cat-discapacidad.service';

describe('CatModalidadLaboralService', () => {
  let service: CatDiscapacidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatDiscapacidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
