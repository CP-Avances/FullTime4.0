import { TestBed } from '@angular/core/testing';

import { RolPermisosService } from './rol-permisos.service';

describe('RolPermisosService', () => {
  let service: RolPermisosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolPermisosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
