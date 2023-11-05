import { TestBed } from '@angular/core/testing';

import { ConexionDataBaseService } from './conexion-data-base.service';

describe('ConexionDataBaseService', () => {
  let service: ConexionDataBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConexionDataBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
