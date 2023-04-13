import { TestBed } from '@angular/core/testing';

import { EnroladoService } from './enrolado.service';

describe('EnroladoService', () => {
  let service: EnroladoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnroladoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
