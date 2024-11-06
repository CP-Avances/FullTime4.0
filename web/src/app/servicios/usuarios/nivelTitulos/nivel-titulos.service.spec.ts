import { TestBed } from '@angular/core/testing';

import { NivelTitulosService } from './nivel-titulos.service';

describe('NivelTitulosService', () => {
  let service: NivelTitulosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NivelTitulosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
