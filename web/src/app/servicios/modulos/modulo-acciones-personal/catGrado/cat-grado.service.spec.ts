import { TestBed } from '@angular/core/testing';

import { CatGradoService } from './cat-grado.service';

describe('CatGradoService', () => {
  let service: CatGradoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatGradoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
