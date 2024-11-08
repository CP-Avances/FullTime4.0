import { TestBed } from '@angular/core/testing';

import { EmplCargosService } from './empl-cargos.service';

describe('EmplCargosService', () => {
  let service: EmplCargosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmplCargosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
