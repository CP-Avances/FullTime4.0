import { TestBed } from '@angular/core/testing';

import { TipoComidasService } from './tipo-comidas.service';

describe('TipoComidasService', () => {
  let service: TipoComidasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoComidasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
