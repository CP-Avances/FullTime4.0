import { TestBed } from '@angular/core/testing';

import { SalidasAntesService } from './salidas-antes.service';

describe('SalidasAntesService', () => {
  let service: SalidasAntesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalidasAntesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
