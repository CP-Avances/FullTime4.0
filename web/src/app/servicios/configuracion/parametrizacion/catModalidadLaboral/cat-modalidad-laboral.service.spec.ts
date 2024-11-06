import { TestBed } from '@angular/core/testing';

import { CatModalidadLaboralService } from './cat-modalidad-laboral.service';

describe('CatModalidadLaboralService', () => {
  let service: CatModalidadLaboralService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatModalidadLaboralService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
