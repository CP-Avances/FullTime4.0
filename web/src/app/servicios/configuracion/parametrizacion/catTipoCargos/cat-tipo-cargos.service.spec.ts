import { TestBed } from '@angular/core/testing';

import { CatTipoCargosService } from './cat-tipo-cargos.service';

describe('CatTipoCargosService', () => {
  let service: CatTipoCargosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatTipoCargosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
