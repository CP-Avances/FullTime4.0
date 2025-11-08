import { TestBed } from '@angular/core/testing';

import { ConfigurarVacacionesService } from './configurar-vacaciones.service';

describe('ConfigurarVacacionesService', () => {
  let service: ConfigurarVacacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigurarVacacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
