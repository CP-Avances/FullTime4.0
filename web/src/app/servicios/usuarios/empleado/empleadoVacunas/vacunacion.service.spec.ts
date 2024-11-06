import { TestBed } from '@angular/core/testing';

import { VacunacionService } from './vacunacion.service';

describe('VacunacionService', () => {
  let service: VacunacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VacunacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
