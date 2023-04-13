import { TestBed } from '@angular/core/testing';

import { HorasExtrasRealesService } from './horas-extras-reales.service';

describe('HorasExtrasRealesService', () => {
  let service: HorasExtrasRealesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HorasExtrasRealesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
