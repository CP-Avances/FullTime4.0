import { TestBed } from '@angular/core/testing';

import { AccionPersonalService } from './accion-personal.service';

describe('AccionPersonalService', () => {
  let service: AccionPersonalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccionPersonalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
