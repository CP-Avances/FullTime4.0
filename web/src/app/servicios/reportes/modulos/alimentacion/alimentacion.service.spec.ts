import { TestBed } from '@angular/core/testing';

import { AlimentacionService } from './alimentacion.service';

describe('AlimentacionService', () => {
  let service: AlimentacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlimentacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
