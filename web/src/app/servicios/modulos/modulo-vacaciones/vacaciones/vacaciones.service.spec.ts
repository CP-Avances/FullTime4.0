import { TestBed } from '@angular/core/testing';

import { VacacionesService } from './vacaciones.service';

describe('VacacionesService', () => {
  let service: VacacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VacacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
