import { TestBed } from '@angular/core/testing';

import { AtrasosService } from './atrasos.service';

describe('AtrasosService', () => {
  let service: AtrasosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtrasosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
