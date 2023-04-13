import { TestBed } from '@angular/core/testing';

import { VacunasService } from './vacunas.service';

describe('VacunasService', () => {
  let service: VacunasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VacunasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
