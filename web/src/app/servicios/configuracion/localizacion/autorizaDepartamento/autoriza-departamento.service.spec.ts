import { TestBed } from '@angular/core/testing';

import { AutorizaDepartamentoService } from './autoriza-departamento.service';

describe('AutorizaDepartamentoService', () => {
  let service: AutorizaDepartamentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutorizaDepartamentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
