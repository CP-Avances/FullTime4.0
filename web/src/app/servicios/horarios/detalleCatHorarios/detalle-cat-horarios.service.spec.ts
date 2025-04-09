import { TestBed } from '@angular/core/testing';

import { DetalleCatHorariosService } from './detalle-cat-horarios.service';

describe('DetalleCatHorariosService', () => {
  let service: DetalleCatHorariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetalleCatHorariosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
