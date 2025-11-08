import { TestBed } from '@angular/core/testing';

import { ReportesAsistenciasService } from './reportes-asistencias.service';

describe('ReportesAsistenciasService', () => {
  let service: ReportesAsistenciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportesAsistenciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
