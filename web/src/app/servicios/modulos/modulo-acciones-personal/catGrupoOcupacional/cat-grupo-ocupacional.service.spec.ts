import { TestBed } from '@angular/core/testing';

import { CatGrupoOcupacionalService } from './cat-grupo-ocupacional.service';

describe('CatGrupoOcupacionalService', () => {
  let service: CatGrupoOcupacionalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatGrupoOcupacionalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
